import missingSymbolMacosGo from "./posts/missing-symbol-called-macos-go.md?raw";
import androidSeccompCrash from "./posts/android-seccomp-epoll-crash.md?raw";
import iosBuildXcodebuild from "./posts/ios-build-fails-xcodebuild-not-xcode.md?raw";
import reactNativeNim from "./posts/react-native-nim.md?raw";
import buildingMobileCicd from "./posts/building-mobile-cicd-status-app.md?raw";
import ogImageMemoryLeak from "./posts/og-image-memory-leak-nextjs.md?raw";
import rnUpgradeStatusMobile from "./posts/react-native-upgrade-status-mobile.md?raw";
import migratingAndroidCi from "./posts/migrating-android-ci-qt-69.md?raw";
import ethereumValidators from "./posts/ethereum-validators-year-in-review.md?raw";
import leftThirdPartyDocker from "./posts/left-third-party-docker-behind.md?raw";
import debuggingNimUtf8 from "./posts/debugging-nim-utf8-race-conditions.md?raw";

export interface BlogPost {
  slug: string;
  date: string;
  title: string;
  excerpt: string;
  readTime: string;
  tags: string[];
  content: string;
}

export const blogPosts: BlogPost[] = [
  {
    slug: "missing-symbol-called-macos-go",
    date: "June 2026",
    title: "\"missing symbol called\" and Nothing Else",
    excerpt:
      "Five words, no stack trace. A Go 1.20 regression left DNS symbols unresolved in our C-archive on macOS. Finding the symbol meant diffing the binaries.",
    readTime: "8 min read",
    tags: ["Go", "macOS", "Debugging", "Nix", "CI/CD"],
    content: missingSymbolMacosGo,
  },
  {
    slug: "android-seccomp-epoll-crash",
    date: "June 2026",
    title: "A Kernel Syscall Was Killing Our Android App on x86_64",
    excerpt:
      "The app worked on ARM, worked on x86, and crashed instantly on x86_64 emulators. Three months to find two Go libraries making raw epoll_wait calls that Android's seccomp filter blocked.",
    readTime: "11 min read",
    tags: ["Android", "Go", "Debugging", "Seccomp", "React Native"],
    content: androidSeccompCrash,
  },
  {
    slug: "ios-build-fails-xcodebuild-not-xcode",
    date: "June 2026",
    title: "Six Months of Broken iOS Builds, Fixed by One Environment Variable",
    excerpt:
      "Our app compiled in Xcode but failed via xcodebuild. For half a year nobody could figure out why. The fix was a single line in the Podfile.",
    readTime: "7 min read",
    tags: ["iOS", "React Native", "Debugging", "Xcode", "CI/CD"],
    content: iosBuildXcodebuild,
  },
  {
    slug: "react-native-nim",
    date: "March 2026",
    title: "Bridging Nim and React Native via JSI",
    excerpt:
      "Building an auto-generated FFI layer that lets you write Nim functions and call them from React Native with no bridge overhead.",
    readTime: "12 min read",
    tags: ["Nim", "React Native", "JSI", "Mobile", "Open Source"],
    content: reactNativeNim,
  },
  {
    slug: "building-mobile-cicd-status-app",
    date: "March 2026",
    title: "Building Mobile CI/CD for a Crypto App from Scratch",
    excerpt:
      "85 PRs, 7 months, and a pipeline that ships to Google Play, TestFlight, and F-Droid. With a Qt/QML app compiled through Nim, Go, and C.",
    readTime: "16 min read",
    tags: ["CI/CD", "Jenkins", "Docker", "iOS", "Android", "F-Droid"],
    content: buildingMobileCicd,
  },
  {
    slug: "og-image-memory-leak-nextjs",
    date: "March 2026",
    title: "A Single Config Line Was Leaking 1.8GB in Our Next.js App",
    excerpt:
      "How a copy-pasted Edge runtime directive caused OG image generation to eat 4.4GB of memory in three minutes.",
    readTime: "8 min read",
    tags: ["Next.js", "Debugging", "Memory Leak", "WASM", "Node.js"],
    content: ogImageMemoryLeak,
  },
  {
    slug: "react-native-upgrade-status-mobile",
    date: "May 2026",
    title: "Upgrading React Native from 0.63 to 0.73 in a Production App",
    excerpt:
      "A year-long incremental upgrade across five major versions in Status, a ClojureScript app with Go bridges, nix builds, and a full Java-to-Kotlin migration along the way.",
    readTime: "14 min read",
    tags: ["React Native", "Mobile", "Status", "Kotlin", "CI/CD"],
    content: rnUpgradeStatusMobile,
  },
  {
    slug: "migrating-android-ci-qt-69",
    date: "March 2026",
    title: "Migrating Android CI to Qt 6.9 with Self-Controlled Docker Images",
    excerpt:
      "Why we stopped trusting upstream images and what it took to own the build environment entirely.",
    readTime: "9 min read",
    tags: ["CI/CD", "Android", "Docker", "Qt", "Jenkins"],
    content: migratingAndroidCi,
  },
  {
    slug: "ethereum-validators-year-in-review",
    date: "January 2026",
    title: "Running Ethereum Validators: A Year in Review",
    excerpt:
      "Uptime, incidents, governance participation, and what I'd do differently with Nimbus and Nethermind.",
    readTime: "11 min read",
    tags: ["Ethereum", "Validators", "Nimbus", "Nethermind", "Rocket Pool"],
    content: ethereumValidators,
  },
  {
    slug: "left-third-party-docker-behind",
    date: "November 2025",
    title: "Why I Left Third-Party Docker Images Behind",
    excerpt:
      "The hidden cost of convenience: build drift, supply chain risk, and the case for self-built base images.",
    readTime: "7 min read",
    tags: ["Docker", "Security", "CI/CD", "DevOps"],
    content: leftThirdPartyDocker,
  },
  {
    slug: "debugging-nim-utf8-race-conditions",
    date: "September 2025",
    title: "Debugging Nim UTF-8 Race Conditions on macOS ARM64",
    excerpt:
      "A weekend deep-dive into a non-deterministic crash that only appeared on Apple Silicon.",
    readTime: "13 min read",
    tags: ["Nim", "Debugging", "macOS", "ARM64", "Concurrency"],
    content: debuggingNimUtf8,
  },
];

export function getPost(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}
