Qt 6.9 landed with a number of improvements for Android builds, but the upgrade path is never as clean as the release notes suggest. We had been relying on a combination of upstream Qt Docker images and a hand-rolled Jenkins pipeline that had accumulated years of workarounds. The upgrade was the forcing function to finally clean house.

## The problem with upstream images

Upstream Qt Docker images are convenient until they're not. The moment you need a specific NDK version pinned to a Qt minor release, or a toolchain that doesn't ship in the base image, you start layering hacks. We had `RUN apt-get install` statements spread across three different Dockerfiles, each one a small monument to a build failure someone had fixed in a hurry.

The deeper issue is reproducibility. When you pull `qt:6.8-android` today and again in three months, you may get a different image. Tags are not immutable. We had a silent breakage in November 2025 when an upstream image updated its bundled NDK and suddenly our JNI bindings stopped compiling on ARM64. It took two days to trace it back to the image change.

## Building our own base

The fix was to take full ownership. We now maintain a set of base images in a private registry, built from scratch and pinned to exact versions:

- Ubuntu 22.04 LTS as the base OS
- Qt 6.9.0 installed from the Qt online installer in unattended mode
- Android NDK r26d (the last stable release tested against our codebase)
- OpenJDK 17 from the Adoptium distribution

Each image is tagged with a hash of its Dockerfile and pinned in the Jenkins pipeline definition. No floating tags anywhere in our build chain.

## The Qt 6.9 specific changes

Qt 6.9 introduced a new Gradle plugin structure for Android that required changes to how we invoke `qt-cmake`. The old approach of passing `-DQT_ANDROID_BUILD_ALL_ABIS=ON` still works, but the output directory structure changed, which broke our artifact collection step.

We also had to update our signing workflow. Qt 6.9 now passes signing configuration differently to the bundled Gradle tasks. The old environment variable approach we used with Fastlane needed a shim to work with the new plugin.

## What we'd do differently

We should have owned our images from the start. The cost of maintaining a Dockerfile is lower than the cost of debugging a mystery breakage caused by an upstream change you had no visibility into. The discipline of pinning everything, including the base OS layer, is worth the overhead.

The migration took about two weeks of engineering time, spread across the Android and CI teams. The result is a build chain we can fully audit, reproduce on any machine with Docker, and upgrade on our own schedule.
