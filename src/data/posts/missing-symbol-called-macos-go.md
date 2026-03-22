Five words in the terminal. No stack trace, no error code, no file name. Just:

```
dyld[30877]: missing symbol called
```

Then the process dies. That was the entire error message we got when trying to run integration tests on macOS after upgrading Go from 1.19 to 1.20.

## Context

Status has a Go backend (`status-go`) that gets compiled into a C-archive (`libstatus.a`) and loaded as a native Node.js addon during contract tests. This worked fine with Go 1.19. After bumping to 1.20, the tests crashed on macOS ARM processors with that useless `missing symbol called` error. Linux was fine.

We had a [temporary workaround](https://github.com/status-im/status-mobile/pull/19965): force macOS to keep building with Go 1.19 while Linux used 1.20. Ugly, but it kept developers unblocked. Then status-go bumped `go-waku`, pulling in `quic-go` and other dependencies that were incompatible with Go 1.19. The workaround was dead.

I [opened the issue](https://github.com/status-im/status-legacy/issues/20135) and laid out three options: (a) tell developers to stop using macOS, (b) revert the status-go dependency bump, or (c) find the actual missing symbol. None of us wanted (a) or (b).

## Step 1: remote debugging

I added `--trace-warnings --trace-uncaught --inspect-brk` to the node process and connected via `chrome://inspect`. Set breakpoints on both caught and uncaught exceptions.

The debugger caught errors about missing `bufferutil` and `utf-8-validate` modules from `@walletconnect`'s WebSocket library. This looked like a lead, but I had to prove it. I ripped out all `@walletconnect` dependencies and their test references. The error messages disappeared but the crash was identical. The WebSocket modules were a red herring.

The real cause had to be macOS-specific. Node module resolution errors are platform-agnostic.

## Step 2: catching the signal

The crash was happening below JavaScript, in the native addon layer. I added a signal handler in `modules/react-native-status/nodejs/status.cpp`:

```cpp
#include <execinfo.h>
#include <signal.h>

void SignalHandler(int signal) {
    void *array[50];
    int size = backtrace(array, 50);
    backtrace_symbols_fd(array, size, STDERR_FILENO);
    exit(1);
}
```

Registered it for `SIGABRT` and `SIGSEGV`. Now when the crash happened, I got a backtrace:

```
dyld -> abort_with_payload_wrapper_internal
runtime.syscall.abi0
runtime.asmcgocall.abi0
```

The dynamic linker was aborting during a Go runtime syscall through the cgo bridge. The missing symbol was needed at the boundary between Go's compiled C-archive and the macOS system libraries. But which symbol?

## Step 3: dyld diagnostics

I added `DYLD_PRINT_APIS=1 DYLD_PRINT_BINDINGS=1` to the environment to make the macOS dynamic linker print every binding operation. This produced a wall of output showing every symbol being resolved, but the crash happened before any useful metadata about the failing symbol was printed. The linker aborted before it could tell me what it was looking for.

## Step 4: diffing the binaries

This was the approach that cracked it. Instead of trying to catch the error at runtime, I compared the compiled artifacts:

1. Built `libstatus.a` with Go 1.19 using a known-good status-go tag
2. Ran `nm -u result/libstatus.a > go-119-symbols.log` to dump all undefined symbols
3. Removed the Go 1.19 hack, rebuilt with Go 1.20
4. Ran `nm -u result/libstatus.a > go-120-symbols.log`
5. Diffed the two files

The diff showed symbols related to `resolv` that were present as undefined in the Go 1.20 build but not in 1.19. Immediately familiar. This was a known Go 1.20 regression on Darwin, documented in two upstream issues ([#58416](https://github.com/golang/go/issues/58416), [#58159](https://github.com/golang/go/issues/58159)). Go 1.20 changed how DNS resolution symbols were handled when building C-archives on macOS, leaving `resolv` symbols unresolved.

## The fix

[PR #20248](https://github.com/status-im/status-legacy/pull/20248). One Nix file changed, +7/-7 lines. Two flags added to the Go build, Darwin-only:

1. `-ldflags=-extldflags=-lresolv` to tell the external linker to link against `libresolv`
2. The `netgo` build tag to force Go's pure-Go DNS resolver, avoiding the cgo-based resolver that relied on the missing symbols

The old Go 1.19 workaround was removed entirely. macOS now builds with the same Go version as Linux.

I initially applied the flags unconditionally, which broke Linux CI. Wrapped them in `lib.optionalString stdenv.isDarwin` and everything went green.

## Why writing it down mattered

This bug had been floating around as tribal knowledge for weeks. People knew "tests don't work on macOS with Go 1.20" and the workaround was "use Go 1.19." Nobody had written down what was actually failing or what had been tried.

The moment I opened the issue and started documenting each step, the debugging became directional instead of circular. Step 1 eliminated the JavaScript layer. Step 2 confirmed the crash was in the native/cgo boundary. Step 3 showed the dynamic linker was the actor. Step 4 found the symbol.

Each step narrowed the search space. Each step was written down so I wouldn't repeat work or forget what I'd already ruled out. The fix took eight days from issue open to merge. Without the written trail, I'd probably still be re-trying things I'd already tried.

The lesson isn't about Go or macOS or `libresolv`. It's about writing things down. A bug that lives in Discord messages and verbal complaints stays unsolved. A bug that lives in an issue with documented steps gets fixed, because every failed attempt is progress you can build on instead of progress you forget.
