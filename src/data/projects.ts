import syncupContent from "./projects/syncup.md?raw";

export interface Project {
  index: string;
  name: string;
  year: string;
  description: string;
  tags: string[];
  href?: string;
  repo?: string;
  slug?: string;
  tagline?: string;
  status?: string;
  content?: string;
}

export const projects: Project[] = [
  {
    index: "01",
    name: "AppDrop",
    year: "2026",
    description:
      "CLI-first app distribution for iOS and Android. Upload .ipa / .apk builds, share a link or QR code, and testers install directly. No App Store, no TestFlight.",
    tags: ["Go", "React", "TypeScript", "Postgres", "S3", "CLI"],
    href: "https://appdrop.sh",
  },
  {
    index: "02",
    name: "SyncUp",
    year: "2026",
    description:
      "Peer-to-peer file sync for iPhone and Android, open source and cloud-free. Your files move straight between your own devices, never through someone else's datacenter.",
    tags: ["React Native", "Go", "gomobile", "Swift", "Kotlin", "Syncthing"],
    slug: "syncup",
    repo: "https://github.com/siddarthkay/syncthing-app",
    tagline: "Your files, on every device you own. No cloud in the middle.",
    status: "v0, pre-release",
    content: syncupContent,
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}
