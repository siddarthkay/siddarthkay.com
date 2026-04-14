export interface Project {
  index: string;
  name: string;
  year: string;
  description: string;
  tags: string[];
  href?: string;
  repo?: string;
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
];
