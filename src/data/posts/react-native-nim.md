Nim is a systems language that compiles to C. React Native runs JavaScript on mobile. There's no official way to connect them. So I built one.

[react-native-nim](https://github.com/siddarthkay/react-native-nim) is a template and CLI tool that lets you write Nim functions and call them from React Native via JSI, with auto-generated native bindings for both iOS and Android. No legacy bridge, no JSON serialization, no manual JNI or Objective-C++ boilerplate.

## Why this exists

At Status, the app's backend is written in Nim (via [nimbus](https://github.com/status-im/nimbus-eth2) and [nim-libp2p](https://github.com/status-im/nim-libp2p)). The mobile client was React Native. Connecting them required hand-written C bridges, manual memory management, and platform-specific native modules that nobody wanted to touch.

Go has `gomobile`. Rust has `uniffi`. Nim had nothing. Every team using Nim on mobile was rolling their own bindings from scratch.

I wanted something where you write a Nim function with `{.exportc.}`, run a generator, and get a working TypeScript function you can call from React Native. No native code to write by hand.

## How the binding works

The pipeline has four stages:

**1. Write Nim with `{.exportc.}`**

```nim
proc add(a, b: cint): cint {.exportc.} =
  return a + b

proc greet(name: cstring): cstring {.exportc, allocated.} =
  let msg = "Hello, " & $name & "!"
  return allocCString(msg)
```

The `{.exportc.}` pragma tells the Nim compiler to preserve C-compatible symbol names in the output. The compiled Nim becomes a regular C library that anything can link against.

**2. Compile to a static library**

Nim compiles to C, then C compiles to a `.a` (iOS) or `.so` (Android) library. iOS requires static linking for App Store submissions. Android's JNI naturally works with shared libraries.

**3. Auto-generate native bindings**

A Python [code generator](https://github.com/siddarthkay/react-native-nim/tree/main/tools/bindings) parses the Nim source, finds all `{.exportc.}` functions, and emits:

- **iOS**: C++ wrapper + Objective-C++ bridge that calls into the static library
- **Android**: JNI bridge + Kotlin TurboModule + CMake config
- **TypeScript**: TurboModule spec with full type safety

The generator reads a `generator_config.json` for function name mappings, boolean annotations (C has no bool, so you need to mark which `cint` returns are booleans), and custom type mappings.

**4. Call from JavaScript via JSI**

```typescript
import { NimBridge } from './NimBridge';

const result = NimBridge.add(2, 3); // synchronous, no bridge overhead
const greeting = NimBridge.greet("world"); // "Hello, world!"
```

JSI (JavaScript Interface) provides synchronous, direct C++ function calls from JavaScript. No JSON serialization, no async bridge queuing. This is React Native's new architecture, and it's what makes the whole thing practical. On the old bridge, every call would serialize arguments to JSON, queue them, deserialize on the other side, and do the reverse for the return value. With JSI, it's a direct function call.

## The memory problem

The first version leaked memory on every string return ([PR #5](https://github.com/siddarthkay/react-native-nim/pull/5)). Nim's garbage collector manages Nim strings, but when you return a `cstring` to C, Nim doesn't know the caller is done with it. The string never gets freed.

The fix was an annotation system. Functions that return allocated strings use `allocCString()` and get marked with `## @allocated`. The code generator detects this annotation and emits wrappers that copy the string to the native side and then call `free()` on the original. 761 lines added, 8871 deleted. Most of those deletions were generated files that shouldn't have been in source control.

## From the legacy bridge to JSI

The project started on React Native's legacy bridge ([initial commit](https://github.com/siddarthkay/react-native-nim), May 2025). It worked but felt wrong. Every Nim function call went through JSON serialization, async dispatch, and back. For a systems language that compiles to native code, adding a serialization layer defeats the purpose.

[PR #8](https://github.com/siddarthkay/react-native-nim/pull/8) enabled the new architecture flag. [PR #10](https://github.com/siddarthkay/react-native-nim/pull/10) was the real shift: rewriting the binding layer to use TurboModules and JSI. The generated code now creates C++ host objects that JavaScript can call directly. No bridge, no queuing, no serialization.

This was also when the code generator became essential. Writing TurboModule boilerplate by hand for every Nim function would be unsustainable. The generator handles the repetitive parts: registering the module, mapping types between Nim's C types and JSI's `jsi::Value`, and emitting the correct platform-specific includes and build configuration.

## The code generator

The generator started as a single Python script and evolved through [PR #6](https://github.com/siddarthkay/react-native-nim/pull/6) (OOP refactor with JSON config) and [PR #7](https://github.com/siddarthkay/react-native-nim/pull/7) (modularized into separate files) into a proper package:

```
tools/bindings/
  parser.py         # Parses Nim source for {.exportc.} functions
  models.py         # NimFunction & TypeMapper data models
  orchestrator.py   # Coordinates all generators
  generators/
    ios.py          # Objective-C++ output
    android.py      # Kotlin/JNI output
    typescript.py   # TypeScript interface
    cmake.py        # CMake build config
```

The parser reads Nim source files and extracts function signatures: name, parameters with types, return type, and annotations. The type mapper converts between Nim types (`cint`, `int64`, `cstring`, `bool`, `float`) and each platform's native types. Each generator takes the parsed functions and emits platform-specific code.

Adding a new Nim function to your app is: write the function, run the generator, import from TypeScript. No Xcode project edits, no Gradle changes, no manual JNI.

## The CLI tool

[PR #12](https://github.com/siddarthkay/react-native-nim/pull/12) (5343 additions, 118 files) introduced `create-react-native-nim`, an npm initializer that scaffolds a new project:

```bash
npx create-react-native-nim MyApp
```

This creates a React Native project with Nim integration pre-configured: the build system, the code generator, a sample Nim module, and the native bridge code for both platforms. [PR #13](https://github.com/siddarthkay/react-native-nim/pull/13) refined the templating to use rsync, treating the `mobile-app` directory itself as the template source.

The package is published on npm as [`create-react-native-nim`](https://www.npmjs.com/package/create-react-native-nim) and the project is listed in [awesome-nim](https://github.com/ringabout/awesome-nim).

## react-native-go: the companion project

After building react-native-nim, I built [react-native-go](https://github.com/siddarthkay/react-native-go) using a different architecture. Where Nim compiles to C and links directly, Go runs as an embedded HTTP server inside the app. JavaScript calls Go functions via JSON-RPC over localhost.

The trade-off is clear:
- **Nim approach**: lower latency per call (direct FFI), but requires a custom code generator since Nim has no mobile toolchain
- **Go approach**: simpler bridge (just HTTP), uses `gomobile`'s existing toolchain, but adds HTTP overhead to every call

Both have CLI tools (`npx create-react-native-nim` and `npx create-react-native-go`) and Nix flakes for reproducible builds. The pattern is the same, the plumbing is different.

## What I'd do differently

Start with the code generator architecture from day one instead of hand-writing bridge code first. The generator paid for itself after the third function. Before that, I was manually keeping iOS, Android, and TypeScript bindings in sync, which is exactly the kind of tedious work that machines should do.

I'd also invest in testing the generated code earlier. Right now the generator is tested by building the sample app. A proper test suite that compiles generated code against mock Nim libraries would catch regressions faster.

The project fills a real gap. If you're using Nim for backend logic and React Native for the UI, there's no longer a reason to write native bindings by hand.
