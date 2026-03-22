export interface BlogPost {
  slug: string;
  date: string;
  title: string;
  excerpt: string;
  readTime: string;
  tags: string[];
  content: string; // markdown-like HTML string
}

export const blogPosts: BlogPost[] = [
  {
    slug: "migrating-android-ci-qt-69",
    date: "March 2026",
    title: "Migrating Android CI to Qt 6.9 with Self-Controlled Docker Images",
    excerpt:
      "Why we stopped trusting upstream images and what it took to own the build environment entirely.",
    readTime: "9 min read",
    tags: ["CI/CD", "Android", "Docker", "Qt", "Jenkins"],
    content: `
<p>Qt 6.9 landed with a number of improvements for Android builds, but the upgrade path is never as clean as the release notes suggest. We had been relying on a combination of upstream Qt Docker images and a hand-rolled Jenkins pipeline that had accumulated years of workarounds. The upgrade was the forcing function to finally clean house.</p>

<h2>The problem with upstream images</h2>

<p>Upstream Qt Docker images are convenient until they're not. The moment you need a specific NDK version pinned to a Qt minor release, or a toolchain that doesn't ship in the base image, you start layering hacks. We had <code>RUN apt-get install</code> statements spread across three different Dockerfiles, each one a small monument to a build failure someone had fixed in a hurry.</p>

<p>The deeper issue is reproducibility. When you pull <code>qt:6.8-android</code> today and again in three months, you may get a different image. Tags are not immutable. We had a silent breakage in November 2025 when an upstream image updated its bundled NDK and suddenly our JNI bindings stopped compiling on ARM64. It took two days to trace it back to the image change.</p>

<h2>Building our own base</h2>

<p>The fix was to take full ownership. We now maintain a set of base images in a private registry, built from scratch and pinned to exact versions:</p>

<ul>
  <li>Ubuntu 22.04 LTS as the base OS</li>
  <li>Qt 6.9.0 installed from the Qt online installer in unattended mode</li>
  <li>Android NDK r26d (the last stable release tested against our codebase)</li>
  <li>OpenJDK 17 from the Adoptium distribution</li>
</ul>

<p>Each image is tagged with a hash of its Dockerfile and pinned in the Jenkins pipeline definition. No floating tags anywhere in our build chain.</p>

<h2>The Qt 6.9 specific changes</h2>

<p>Qt 6.9 introduced a new Gradle plugin structure for Android that required changes to how we invoke <code>qt-cmake</code>. The old approach of passing <code>-DQT_ANDROID_BUILD_ALL_ABIS=ON</code> still works, but the output directory structure changed, which broke our artifact collection step.</p>

<p>We also had to update our signing workflow. Qt 6.9 now passes signing configuration differently to the bundled Gradle tasks. The old environment variable approach we used with Fastlane needed a shim to work with the new plugin.</p>

<h2>What we'd do differently</h2>

<p>We should have owned our images from the start. The cost of maintaining a Dockerfile is lower than the cost of debugging a mystery breakage caused by an upstream change you had no visibility into. The discipline of pinning everything, including the base OS layer, is worth the overhead.</p>

<p>The migration took about two weeks of engineering time, spread across the Android and CI teams. The result is a build chain we can fully audit, reproduce on any machine with Docker, and upgrade on our own schedule.</p>
    `,
  },
  {
    slug: "ethereum-validators-year-in-review",
    date: "January 2026",
    title: "Running Ethereum Validators: A Year in Review",
    excerpt:
      "Uptime, incidents, governance participation, and what I'd do differently with Nimbus and Nethermind.",
    readTime: "11 min read",
    tags: ["Ethereum", "Validators", "Nimbus", "Nethermind", "Rocket Pool"],
    content: `
<p>I've been running Ethereum validators for a little over two years now, split between Lido's distributed validator network and my own Rocket Pool minipool. 2025 was the first full calendar year where I had stable infrastructure and could actually reflect on what running validators at this level looks like over time.</p>

<h2>The setup</h2>

<p>My consensus layer is Nimbus. I chose it early on because the team is small and focused, the memory footprint is low, and it's written in Nim, which I find easier to audit than Go or Rust. My execution layer is Nethermind, running on dedicated Hetzner bare metal in Finland. I run my own MEV-Boost relay selection, currently pointing at Flashbots and Agnostic.</p>

<p>The hardware is a single AX52 with 64 GB RAM and two NVMe SSDs in a software RAID. Overkill for a single validator, appropriately sized for a small operator running multiple.</p>

<h2>Uptime and incidents</h2>

<p>Over 2025, I maintained 99.4% attestation effectiveness. The two meaningful downtime events were both self-inflicted:</p>

<p><strong>February:</strong> I updated Nethermind without reading the changelog carefully. The new version introduced a breaking change in how the Engine API handled certain edge cases during Dencun-related blob processing. Consensus dropped to zero for about 40 minutes before I caught it in monitoring. Lesson: read the full release notes, not just the headline features.</p>

<p><strong>August:</strong> A routine Hetzner maintenance window ran over. I had set up automatic restart but not automatic re-peering. Nimbus came back up but didn't reconnect to peers quickly enough, resulting in missed attestations for about two epochs. The fix was a small script that checks peer count after restart and alerts if it's below threshold after 10 minutes.</p>

<h2>Rocket Pool ODAO governance</h2>

<p>Being a Rocket Pool ODAO member means participating in on-chain votes for protocol upgrades and oracle submissions. In 2025 that meant voting on the Saturn upgrade and several smaller parameter changes. The tooling has improved significantly but it still requires more manual attention than it should. I'd like to see better notifications for upcoming votes.</p>

<h2>What I'd do differently</h2>

<p>Run two consensus clients in checkpoint sync mode, fail over automatically. The single-client setup is fine for attestations but adds operational stress during upgrades. A standby Teku or Lighthouse node that can take over within a few minutes would have prevented both incidents above.</p>

<p>I'd also invest earlier in proper monitoring. I started with basic Prometheus/Grafana but it took until mid-year to get alerting tuned correctly. Too many false positives early on means you start ignoring alerts, which is worse than no alerting at all.</p>
    `,
  },
  {
    slug: "left-third-party-docker-behind",
    date: "November 2025",
    title: "Why I Left Third-Party Docker Images Behind",
    excerpt:
      "The hidden cost of convenience: build drift, supply chain risk, and the case for self-built base images.",
    readTime: "7 min read",
    tags: ["Docker", "Security", "CI/CD", "DevOps"],
    content: `
<p>There's a version of this post that's purely about security: supply chain attacks on public Docker images are real, the Docker Hub is not curated in any meaningful sense, and you should not be pulling untrusted images into your build pipeline. That argument is correct but it's not what changed my mind.</p>

<p>What changed my mind was build drift.</p>

<h2>Build drift</h2>

<p>Build drift is what happens when your build environment changes without you knowing. It's subtle. An upstream image gets a minor OS update. A library that was previously at version 1.2.3 is now 1.2.4. Your build still passes. Your tests still pass. The artifact that comes out looks the same.</p>

<p>Until it doesn't.</p>

<p>We had a case in early 2025 where a change to the bundled <code>libssl</code> version in an upstream Ubuntu-based image caused an obscure TLS handshake failure in our integration tests. Not a crash, not a clear error: a timeout that only appeared in certain network conditions. It took four days and two engineers to trace it back to the image change.</p>

<h2>The security argument, briefly</h2>

<p>While I said the security argument wasn't what changed my mind, it's still worth stating clearly. When you pull <code>some-vendor/build-tools:latest</code>, you are trusting:</p>

<ul>
  <li>The image author's identity verification process</li>
  <li>The security of their Docker Hub account</li>
  <li>The provenance of every layer in their image</li>
  <li>That they haven't been coerced or compromised</li>
</ul>

<p>None of these are guarantees you can verify without building the image yourself. For a build pipeline that produces software shipped to users, that's not an acceptable trust model.</p>

<h2>What self-built images actually cost</h2>

<p>More than you'd think at first, less than you'd think after you've done it once.</p>

<p>The upfront cost is writing and maintaining Dockerfiles, setting up a private registry, and updating your CI pipelines to pull from it. That's a week or two of work for a small team.</p>

<p>The ongoing cost is keeping the images updated. New OS patches, new toolchain releases, new transitive dependencies. We run a weekly automated job that checks for updates and opens a pull request. A human reviews and merges. The whole loop takes about 30 minutes per week.</p>

<p>The benefit is complete visibility and control. When something breaks in the build, the image is never the mystery variable.</p>
    `,
  },
  {
    slug: "debugging-nim-utf8-race-conditions",
    date: "September 2025",
    title: "Debugging Nim UTF-8 Race Conditions on macOS ARM64",
    excerpt:
      "A weekend deep-dive into a non-deterministic crash that only appeared on Apple Silicon.",
    readTime: "13 min read",
    tags: ["Nim", "Debugging", "macOS", "ARM64", "Concurrency"],
    content: `
<p>Non-deterministic bugs are the worst kind. They don't fail consistently, they often disappear under a debugger, and they have a way of making you question whether the bug is in your code or in the platform itself. This one turned out to be both.</p>

<h2>The symptom</h2>

<p>We started seeing intermittent crashes in the Status desktop client on Apple Silicon Macs. Not Intel Macs, not Linux, not Windows: specifically M1 and M2 machines, and only under certain usage patterns involving rapid message rendering with mixed Unicode content.</p>

<p>The crash was a segfault deep in the Nim runtime's string handling code. Stack traces were unhelpful because the optimiser had inlined most of the relevant functions. The crash rate was about 1 in 200 on a reproducible test script, which is high enough to be real but low enough to make debugging painful.</p>

<h2>Narrowing it down</h2>

<p>The first step was making it reproducible. I wrote a stress test that spawned 16 goroutine-equivalent Nim threads, each repeatedly encoding and decoding UTF-8 strings with various Unicode planes including CJK characters, emoji, and right-to-left text.</p>

<p>With that, I could reproduce the crash in about 30 seconds on an M2 MacBook Pro. Progress.</p>

<p>The next step was instrumenting the string encoding path. Nim's UTF-8 validation is done in a tight loop that checks byte boundaries. On x86, the loop's memory access pattern is predictable enough that the CPU rarely sees a race. On ARM64 with the M-series chips, the out-of-order execution and load-store reordering is more aggressive, which can expose races that are invisible on x86.</p>

<h2>The root cause</h2>

<p>After about 12 hours of tracing, I found it. There was a shared counter used to track the current byte position in the encoding buffer that was being updated without a memory barrier. On x86, the strong memory model means this kind of code often "works" even when it's technically incorrect. ARM64 has a weaker memory model: without explicit barriers, load and store reordering can cause two threads to read a stale counter value simultaneously, leading to a buffer overflow.</p>

<p>The fix was a one-line change: adding <code>atomicStore</code> and <code>atomicLoad</code> around the counter updates. The hard part was finding the line.</p>

<h2>What I learned</h2>

<p>The ARM64 memory model will surface bugs that x86 tolerates. If you're maintaining a codebase that was developed and tested primarily on Intel hardware and you're now targeting Apple Silicon, it's worth auditing any shared mutable state that isn't protected by a mutex or atomic operation. The bugs are there. ARM will find them.</p>

<p>Also: stress tests that you can run in 30 seconds are worth their weight in gold. Build them early.</p>
    `,
  },
];

export function getPost(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}
