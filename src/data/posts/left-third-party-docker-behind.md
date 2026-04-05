There's a version of this post that's purely about security: supply chain attacks on public Docker images are real, the Docker Hub is not curated in any meaningful sense, and you should not be pulling untrusted images into your build pipeline. That argument is correct but it's not what changed my mind.

What changed my mind was build drift.

## Build drift

![Trust chain comparison: five layers of implicit trust when pulling a third-party Docker image versus two explicit, verifiable layers with a self-built digest-pinned base](/blog/docker-trust-chain.svg)

Build drift is what happens when your build environment changes without you knowing. It's subtle. An upstream image gets a minor OS update. A library that was previously at version 1.2.3 is now 1.2.4. Your build still passes. Your tests still pass. The artifact that comes out looks the same.

Until it doesn't.

We had a case in early 2025 where a change to the bundled `libssl` version in an upstream Ubuntu-based image caused an obscure TLS handshake failure in our integration tests. Not a crash, not a clear error: a timeout that only appeared in certain network conditions. It took four days and two engineers to trace it back to the image change.

## The security argument, briefly

While I said the security argument wasn't what changed my mind, it's still worth stating clearly. When you pull `some-vendor/build-tools:latest`, you are trusting:

- The image author's identity verification process
- The security of their Docker Hub account
- The provenance of every layer in their image
- That they haven't been coerced or compromised

None of these are guarantees you can verify without building the image yourself. For a build pipeline that produces software shipped to users, that's not an acceptable trust model.

## What self-built images actually cost

More than you'd think at first, less than you'd think after you've done it once.

The upfront cost is writing and maintaining Dockerfiles, setting up a private registry, and updating your CI pipelines to pull from it. That's a week or two of work for a small team.

The ongoing cost is keeping the images updated. New OS patches, new toolchain releases, new transitive dependencies. We run a weekly automated job that checks for updates and opens a pull request. A human reviews and merges. The whole loop takes about 30 minutes per week.

The benefit is complete visibility and control. When something breaks in the build, the image is never the mystery variable.
