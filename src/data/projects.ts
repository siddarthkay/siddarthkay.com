export interface Project {
  index: string;
  name: string;
  year: string;
  description: string;
  tags: string[];
  href?: string;
}

export const projects: Project[] = [
  {
    index: "01",
    name: "IFT: DevOps Engineering",
    year: "2024–Now",
    description:
      "Production deployments, on-call rotations, and build infrastructure for Ethereum light clients. Built nimbus-eth1 benchmarking infra from scratch, migrated fleets from iptables to nftables, and lead macOS/Xcode upgrades across CI.",
    tags: ["Nix", "Docker", "nftables", "Nimbus", "CI/CD"],
    href: "https://free.technology",
  },
  {
    index: "02",
    name: "Status: React Native & Build Systems",
    year: "2022–2024",
    description:
      "Led the React Native 0.63→0.73 upgrade for a decentralised messaging app nobody else would touch. Built local device pairing, moved QR generation to Go backend, and owned CI/CD across iOS, Android, and desktop.",
    tags: ["React Native", "ClojureScript", "Jenkins", "Qt", "Fastlane", "Nix"],
    href: "https://status.im",
  },
  {
    index: "03",
    name: "Source Elements: Product Engineering",
    year: "2021–2022",
    description:
      "Worked directly with the CEO to build a new-generation dashboard in Vue 2. Shipped Dark Mode and coordinated API changes with the backend team.",
    tags: ["Vue 2", "APIs", "Dashboard"],
  },
  {
    index: "04",
    name: "Centillion: Founding → CTO",
    year: "2016–2020",
    description:
      "First technical hire. Grew the team from 1 to 30. Built core products, set up CI pipelines in Bitbucket/GitLab, shipped 10+ Laravel sites and complex mobile apps in React Native and Xamarin. Trained 300+ engineering students.",
    tags: ["React Native", "Laravel", "Docker", "Drupal", "APIGEE"],
  },
];
