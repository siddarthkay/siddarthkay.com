Status had a desktop CI pipeline that worked. Then we needed to ship mobile. Android on the Play Store, Android on F-Droid, iOS on TestFlight. From scratch, on Jenkins, with custom Docker images, in a codebase that compiles QML through Nim through Go through C. This is how that went.

## Starting point

The app is a Qt/QML desktop application with a Go backend (`status-go`) and Nim bindings. The existing CI built Linux, macOS, and Windows artifacts on Jenkins. Mobile was a new target, which meant new build environments, new signing workflows, new distribution channels, and a lot of new ways for things to break.

I started in mid-2025 and the pipeline was fully operational by early 2026. About 85 PRs in `status-app`, 20+ in `status-jenkins-lib`, and several in `status-go` to fix mobile-specific build issues.

## The Android Docker image

The first real milestone was [PR #18597](https://github.com/status-im/status-app/pull/18597): a Jenkins pipeline and Docker image for Android builds. The Dockerfile is a multi-stage build on Ubuntu 22.04 with Qt 6.9.0, the Android SDK/NDK, Go, and Nim. Everything pinned to exact versions.

The tricky part was Qt. Initially I was [building Qt from source](https://github.com/status-im/status-app/pull/18597) inside Docker, which took ages. Later I [switched to aqtinstall](https://github.com/status-im/status-app/pull/19746), which downloads prebuilt Qt binaries and cut the image build time significantly. I also trimmed the Qt module list to only what we actually use, which saved more space.

Before this could work, I had to [fix a Go 1.23 linking error](https://github.com/status-im/status-app/pull/18375) in status-go's Android build. The `anet` package was failing with a `checklinkname` error, requiring a new ldflag. On iOS, I had to switch to Xcode's clang for compiling status-go because the default compiler wasn't producing valid ARM binaries.

## Signing Android builds

Getting an unsigned APK building in CI was one thing. Getting a signed one accepted by Google Play was another ([PR #18992](https://github.com/status-im/status-app/pull/18992)).

The first surprise: `androiddeployqt --sign` silently produces invalid AAB files. The APK it generates is fine, but the AAB needs a separate `jarsigner` step. I only discovered this when Google Play Console rejected the upload with a generic signing error. The [fix](https://github.com/status-im/status-app/pull/19155) added jarsigner as a post-processing step and also fixed OpenSSL library locations that were wrong on the build image.

I also had to auto-generate `versionCode` based on minutes since epoch, because Google Play requires a monotonically increasing integer and we didn't want to manage it manually.

Later, I [separated bundle IDs for PR vs release builds](https://github.com/status-im/status-app/pull/19614) using Gradle build flavors. PR builds get `app.status.mobile.pr` so testers can have both installed simultaneously without conflicts.

## The iOS pipeline

iOS signing is its own universe. I [initialized the pipeline](https://github.com/status-im/status-app/pull/18886) with a new Jenkinsfile and then [added signing and TestFlight upload](https://github.com/status-im/status-app/pull/18993) in a separate PR.

For TestFlight, I generate a short-lived Apple JWT with `iat` and `exp` timestamps, then upload using `altool`. I had previous experience with Fastlane at status-mobile and initially avoided it here, preferring bash scripts I could fully control. Over time I [adopted Fastlane for specific tasks](https://github.com/status-im/status-app/pull/19505) like code signing with `match` and TestFlight uploads, while keeping the build orchestration in shell scripts.

## Christmas Day debugging

On December 25th, [TestFlight uploads broke](https://github.com/status-im/status-app/pull/19640). The IPA path needed to be absolute when passed to Fastlane's upload action. A one-line fix, but it required deploying on Christmas.

The next day, December 26th, Apple started [rejecting our uploads](https://github.com/status-im/status-app/pull/19645) because of NFC entitlements. SDK 18.2 introduced new requirements around `NFCReaderUsageDescription` and `ITSAppUsesNonExemptEncryption` that hadn't been enforced before. Another same-day fix.

This is the reality of mobile CI: the platform vendors change the rules, and you find out when your pipeline turns red.

## Separate PR bundles for iOS

This was the most debated change ([PR #19505](https://github.com/status-im/status-app/pull/19505)). PR builds need a different bundle ID (`app.status.mobile.pr`) so testers can install them alongside the production app. On iOS, this means separate provisioning profiles, separate code signing identities, and a way to distribute builds outside TestFlight (we used DIAWI).

I introduced a Nix flake for Ruby and Fastlane dependencies to keep the build reproducible. A reviewer questioned this approach, but the alternative was relying on whatever Ruby version happened to be on the CI host, which is exactly the kind of drift that causes "works on my machine" failures.

828 additions, 463 deletions, 34 files changed, and multiple rounds of review discussion about where scripts should live and how much to lean on Fastlane vs custom bash.

## Dirty CI hosts

One of the more frustrating issues was [stale state on Jenkins hosts](https://github.com/status-im/status-app/pull/18795). The workspace would accumulate leftover files from previous builds, and submodule checkouts would fail with errors in the `boringssl` vendor tree inside OpenSSL. The fix was adding explicit cleanup and submodule checkout stages at the beginning of every pipeline run.

Not glamorous work, but without it, about 1 in 10 builds would fail for reasons unrelated to the code being built.

## F-Droid: building everything from source

F-Droid is the open-source Android app store, and their requirements are strict: no prebuilt binaries, everything compiled from source, no Google Play services. This meant a completely [separate build pipeline](https://github.com/status-im/status-app/pull/19823).

The F-Droid Dockerfile uses Docker-in-Docker because `fdroidserver` expects to run builds inside its own container. Inside that container, I build:

- Qt from source (`fdroid/build-qt.sh`)
- OpenSSL from source (`fdroid/build-openssl.sh`)
- The app itself (`fdroid/build-app.sh`)

There's also a `cleanup-binaries.sh` script that removes any prebuilt `.so` files that the F-Droid scanner would flag. And a separate signing script because F-Droid uses its own keystore format.

I added an `apk-fdroid` Makefile target that builds an unsigned APK without Google Play services, which is what the F-Droid build server expects. The [final PR](https://github.com/status-im/status-app/pull/20201) to add F-Droid to the nightly release job was just 6 lines. All the complexity was in the 637 lines that came before it.

## Credential management

As the number of platforms grew, so did the credential sprawl. Android needs a keystore and signing key. iOS needs provisioning profiles, a signing certificate, and App Store Connect API keys. Both need API proxy tokens, Mixpanel tokens, Sentry DSNs.

I went through several iterations in `status-jenkins-lib`:
- [Consolidated credentials with higher-order functions](https://github.com/status-im/status-jenkins-lib/pull/120) to reduce duplication
- [Added Android signing credentials](https://github.com/status-im/status-jenkins-lib/pull/122)
- [Added iOS signing credentials](https://github.com/status-im/status-jenkins-lib/pull/123)
- [Separated PR and release credentials](https://github.com/status-im/status-jenkins-lib/pull/126) for Android
- Finally [unified everything](https://github.com/status-im/status-jenkins-lib/pull/132) into a single credential management system

The pattern that worked: a function that takes platform-specific credentials and wraps them with common ones. Each platform calls the same function with its own extras, so adding a new secret to all platforms is a one-line change.

## QML linting

After being [bitten too many times](https://github.com/status-im/status-app/pull/19786) by invalid QML crashing the mobile app at runtime, I added `qmllint` to CI. QML is not compiled, it's interpreted at runtime, which means syntax errors and type mismatches only show up when you navigate to that screen. Running qmllint in CI catches these before they reach a device.

## The Nim version debate

In the [signed Android PR](https://github.com/status-im/status-app/pull/18992), reviewers debated whether to use `USE_SYSTEM_NIM=1` (Nim installed directly in Docker) or go through nimbus-build-system (which builds Nim from source). I chose system Nim because it saved 5 minutes per build. The trade-off is manual version pinning in the Dockerfile, but since we control the Docker image, that's acceptable.

## What the pipeline looks like now

Every PR triggers:
- **Linux** AppImage build
- **Android** signed APK (PR bundle ID, uploaded to DIAWI)
- **iOS** signed IPA (PR bundle ID, uploaded to DIAWI)

Every nightly/release triggers:
- All of the above, plus
- **Android** signed AAB (production bundle ID, uploaded to Google Play internal track)
- **iOS** signed IPA (production bundle ID, uploaded to TestFlight)
- **F-Droid** unsigned APK (built from source, uploaded to F-Droid repo)
- **macOS** DMG
- **Windows** installer

The entire thing runs on Jenkins with custom Docker images for Android and F-Droid, macOS bare metal hosts for iOS, and a shared Jenkins library for credential management.

## What I'd do differently

Start with Fastlane earlier for iOS signing. I spent weeks writing custom bash scripts that Fastlane handles out of the box. The control was nice but not worth the maintenance cost.

Build the credential management system before the second platform, not after the fourth. Retrofitting credential functions across existing pipelines is tedious and error-prone.

And test TestFlight uploads on a holiday before you have to fix them on one.
