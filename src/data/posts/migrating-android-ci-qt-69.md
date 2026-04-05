Before Jenkins-based Android builds existed at status-app, they ran on GitHub Actions inside a third-party Docker image pulled fresh every run. The migration off that setup, to our own Jenkins pipeline, our own Dockerfile, and eventually `aqtinstall`, took about six months and five PRs.

## The starting point

The pre-existing workflow was [`mobile/.github/workflows/android-build.yml`](https://github.com/status-im/status-app/blob/35ce6247d7a500d0f7023a567fc3be2305a9566a/mobile/.github/workflows/android-build.yml#L11), with this container declaration:

```yaml
container:
  image: carlonluca/qt-dev:6.8.3
env:
  ANDROID_NDK_HOME: /opt/android-sdk/ndk/26.1.10909125
  QT_PATH: /opt/qt/6.8.3
  JAVA_HOME: /usr/lib/jvm/java-17-openjdk-amd64
```

`carlonluca/qt-dev` is a community Qt development image maintained by [Luca Carlon](https://github.com/carlonluca). It's well-maintained and convenient. But convenience came with transitive trust: we were trusting whoever pushed that image to also pick the right base OS, the right bundled NDK, the right apt layers, and the right Qt compilation flags. The tag was pinned, but layers inside a tag are not. An image author can re-push `:6.8.3` at any time without a changelog.

## Moving to Jenkins + own Docker

![From a third-party community Docker image on GitHub Actions to a pinned own-built base in our private registry on Jenkins](/blog/docker-image-drift-vs-pinned.svg)

I opened [PR #18488](https://github.com/status-im/status-app/pull/18488) as a draft in August 2025 to prove we could build PR Android APKs from our own Dockerfile. Two weeks later, [PR #18597](https://github.com/status-im/status-app/pull/18597) merged the production setup: a Jenkins pipeline (`ci/Jenkinsfile.android`) plus a multi-stage Dockerfile under our control (`mobile/docker/Dockerfile`).

The pinned ARGs in that first version:

- `ubuntu:noble` (24.04) as the base image
- `QTVER=6.9.0`, built from source inside Docker
- `ANDROID_NDK_VERSION=27.2.12479018` (r27c)
- `JAVA_VERSION=17`, installed via `apt-get install openjdk-17-jdk`

Qt 6.9.0 got bumped to 6.9.2 shortly after in [commit `c0e81420`](https://github.com/status-im/status-app/commit/c0e814208722d6c4ccc3cf04ebe037f468c7f86a). Every image rebuild was a separate manual Jenkins job because compiling Qt from source was slow enough that we didn't want it running on every PR.

The old GitHub Actions workflow stayed active in parallel for a few months, which in hindsight was a mistake. Parallel CI paths erode trust in which one is canonical. Developers never know which build is "the" build. I finally deleted it in [PR #19238](https://github.com/status-im/status-app/pull/19238) in November 2025.

## Simplifying with aqtinstall

Compiling Qt from source turned out to be overkill. [PR #19746](https://github.com/status-im/status-app/pull/19746) replaced the from-source compile with [`aqtinstall`](https://github.com/miurahr/aqtinstall), a Python tool that downloads prebuilt Qt binaries by version. The PR description is exactly what the blog post would say:

> - Switch from compiling QT ourselves to relying on `aqtinstall`
> - uses fewer qt modules
> - adds cleanup stage to save space

Dropping unused Qt modules was the real efficiency win. Cleaning up intermediate files inside the same `RUN` layer kept the final image small.

The first roll-out was too aggressive: it stripped `QtQml.StateMachine`, which some QML files depended on, and the app crashed at runtime with `module "QtQml.StateMachine" is not installed`. [PR #19849](https://github.com/status-im/status-app/pull/19849) re-applied the simplification with the missing module restored, and added a `qmllint` CI job so this class of import failure gets caught before a build ships.

## What I'd do differently

Cut the old CI path on day one. The `android-build.yml` workflow kept running for months after Jenkins took over, and every run of it was quietly re-trusting choices we didn't own. The cost of deleting a CI path nobody is actively using is zero; the cost of leaving two paths alive is ambiguity that compounds.

Start with `aqtinstall`, not a from-source compile. Building Qt from source is a tempting default for maximum control, but prebuilt binaries are good enough for the vast majority of needs and save real build time. The only reason to compile from scratch is if you need a patch that isn't upstream. If you need that, you'll know.
