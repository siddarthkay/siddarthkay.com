Non-deterministic bugs are the worst kind. They don't fail consistently, they often disappear under a debugger, and they have a way of making you question whether the bug is in your code or in the platform itself. This one turned out to be both.

## The symptom

We started seeing intermittent crashes in the Status desktop client on Apple Silicon Macs. Not Intel Macs, not Linux, not Windows: specifically M1 and M2 machines, and only under certain usage patterns involving rapid message rendering with mixed Unicode content.

The crash was a segfault deep in the Nim runtime's string handling code. Stack traces were unhelpful because the optimiser had inlined most of the relevant functions. The crash rate was about 1 in 200 on a reproducible test script, which is high enough to be real but low enough to make debugging painful.

## Narrowing it down

The first step was making it reproducible. I wrote a stress test that spawned 16 goroutine-equivalent Nim threads, each repeatedly encoding and decoding UTF-8 strings with various Unicode planes including CJK characters, emoji, and right-to-left text.

With that, I could reproduce the crash in about 30 seconds on an M2 MacBook Pro. Progress.

The next step was instrumenting the string encoding path. Nim's UTF-8 validation is done in a tight loop that checks byte boundaries. On x86, the loop's memory access pattern is predictable enough that the CPU rarely sees a race. On ARM64 with the M-series chips, the out-of-order execution and load-store reordering is more aggressive, which can expose races that are invisible on x86.

## The root cause

After about 12 hours of tracing, I found it. There was a shared counter used to track the current byte position in the encoding buffer that was being updated without a memory barrier. On x86, the strong memory model means this kind of code often "works" even when it's technically incorrect. ARM64 has a weaker memory model: without explicit barriers, load and store reordering can cause two threads to read a stale counter value simultaneously, leading to a buffer overflow.

The fix was a one-line change: adding `atomicStore` and `atomicLoad` around the counter updates. The hard part was finding the line.

## What I learned

The ARM64 memory model will surface bugs that x86 tolerates. If you're maintaining a codebase that was developed and tested primarily on Intel hardware and you're now targeting Apple Silicon, it's worth auditing any shared mutable state that isn't protected by a mutex or atomic operation. The bugs are there. ARM will find them.

Also: stress tests that you can run in 30 seconds are worth their weight in gold. Build them early.
