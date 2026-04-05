Our end-to-end tests stopped working. The test APK wouldn't install on the emulators SauceLabs provides, because those emulators run x86_64 and we were only building for ARM and x86. Simple enough to fix: add `x86_64` to the ABI list. Except that when we did, the app crashed two seconds after launch.

Not a JavaScript crash. Not a React Native red screen. A kernel-level `SIGSYS` signal that killed the process instantly. No stack trace, no error dialog, just gone.

This rabbit hole took three months.

## The symptom

[Issue #17265](https://github.com/status-im/status-legacy/issues/17265) started as a QA report: e2e APK can't be installed on Android 12+ emulators. The fix seemed obvious: build for x86_64. A colleague created [PR #17335](https://github.com/status-im/status-legacy/pull/17335) to add the architecture. The APK installed. Then it crashed immediately after the user created a profile and set a password.

Logcat showed:

```
Fatal signal 31 (SIGSYS), code 1 (SYS_SECCOMP), syscall 232
in tid 6327 (create_react_co)
```

`SIGSYS` with `SYS_SECCOMP`. The kernel's seccomp filter had blocked a system call and killed the process. Syscall 232 on x86_64 is `epoll_wait`.

The app was being killed by the Android kernel for calling `epoll_wait`. On ARM devices and x86 emulators, this same code worked perfectly. Only x86_64 emulators running Android 11+ triggered the crash.

## Ruling things out

I reproduced it locally with `ANDROID_ABI_INCLUDE=x86_64 make run-android` and started eliminating suspects.

First I tried relaxing SELinux with `adb shell setenforce 0`. No effect. Seccomp filtering is separate from SELinux and can't be disabled on non-rooted emulators.

I checked if the Flipper debugging library was the cause, since they'd had a [similar SIGSYS crash on x86_64](https://github.com/facebook/flipper). It wasn't. Our crash happened with Flipper completely removed.

I suspected `react-native-reanimated`, `okhttp`, anything that might use native code differently on x86_64. None of them were the problem.

## Following the crash

The crash always happened 1-2 seconds after the "Generating Keys" screen appeared. I traced the call flow from the moment the user presses "confirm password":

1. React Native dispatches a re-frame event
2. ClojureScript calls into a native module
3. `StatusModule.java` calls `createAccountAndLogin`
4. This calls into `status-go`, our Go backend compiled for Android via gomobile

I started commenting out code. When I removed the call to `createAccountAndLogin`, the crash disappeared. The problem was in the Go backend.

## Into status-go

I narrowed it down to `g.store(childAccount, password)` in `account/generator/generator.go`. Added logging around every function call. Everything looked correct. The arguments were valid, the account object was properly initialized, the password was a normal string.

The crash was deeper than the application code. Something in the Go runtime or one of our Go dependencies was making a system call that Android's seccomp filter didn't allow on x86_64.

## The breakthrough

![Call chain from React Native user action down to the Android seccomp filter blocking syscall 232 and killing the process with SIGSYS](/blog/seccomp-epoll-crash-chain.svg)

A colleague, bitgamma, pointed me to the key insight: syscall 232 on x86_64 Linux is `epoll_wait`. The Go standard library uses `epoll` for I/O multiplexing on Linux. But Android's seccomp policy, which got stricter starting with Android 11, blocks certain legacy syscalls on x86_64. `epoll_wait` is one of them. The "correct" syscall is `epoll_pwait` (syscall 281), which is what modern versions of the Go runtime use. But not all Go libraries go through the standard library's syscall wrappers. Some make raw syscalls directly.

I searched our dependency tree for direct uses of `epoll_wait` and found two:

1. **[`github.com/rjeczalik/notify`](https://github.com/rjeczalik/notify)** -- a filesystem notification library that used inotify with a raw `epoll_wait` event loop
2. **[`github.com/status-im/tcp-shaker`](https://github.com/status-im/tcp-shaker)** -- a TCP health check library that used `epoll_wait` to poll socket events

Both libraries called `epoll_wait` directly through `syscall.Syscall6` instead of using the Go standard library's netpoller, which had long since been updated to use `epoll_pwait`.

## The dead end

Before finding the real fix, I tried upgrading the Android NDK to r26. Google had [fixed a similar seccomp issue](https://github.com/android/ndk/issues/1298) in newer NDK versions. But `status-go` depends on `go-sqlcipher`, which uses CGo to compile OpenSSL. The AES assembly routines wouldn't compile with NDK r26's updated clang. NDK r25 compiled but didn't fix the crash.

The NDK wasn't the problem. The problem was raw syscalls in Go libraries that bypassed the standard library.

## The fix

I forked both libraries and created platform-specific implementations for `android && amd64`:

For **tcp-shaker** ([status-go PR #4233](https://github.com/status-im/status-go/pull/4233)): replaced the `epoll_wait` event loop with a polling loop that uses `unix.Recvfrom` with `MSG_DONTWAIT|MSG_PEEK` and a 10ms sleep interval. Not as efficient, but it doesn't call any blocked syscalls.

For **notify**: rewrote the inotify event loop to use direct `unix.Read` calls on the inotify file descriptor and a signal pipe, with separate goroutines for each, instead of multiplexing with `epoll_wait`.

Both changes used Go build tags so the original implementations are preserved on all other platforms:

```go
//go:build android && amd64
```

The original files got the inverse tag:

```go
//go:build linux && !(android && amd64)
```

I also modified the mailserver ping logic to skip TCP health checks entirely on Android emulators, since the polling fallback was less reliable than the `epoll`-based version and mailserver selection doesn't matter in test environments.

The [final PR](https://github.com/status-im/status-legacy/pull/17773) in status-mobile was anticlimactic: 6 files changed, 6 additions, 6 deletions. Point to the fixed status-go, add `x86_64` to the ABI list, bump the Jenkins library version.

## The takeaway

The crash existed because two Go libraries made raw `epoll_wait` syscalls that Android's seccomp filter blocks on x86_64. On ARM and x86, the same syscall number maps to a different (allowed) call, or the seccomp policy is more permissive. The bug only appeared on x86_64 emulators running Android 11+, which is exactly the environment our CI used for end-to-end tests.

What made this hard wasn't the fix. The fix was straightforward once I knew which syscall was being blocked and which libraries were making it. What made it hard was the distance between the symptom ("app crashes after creating a profile") and the cause ("a filesystem notification library is calling a blocked kernel syscall on this specific CPU architecture"). That distance is three months of ruling things out, tracing call stacks through four languages (TypeScript, ClojureScript, Java, Go), and learning more about Android's seccomp policy than anyone should have to.
