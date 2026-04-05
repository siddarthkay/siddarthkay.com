export interface ToolItem {
  name: string;
  note: string;
  url?: string;
}

export interface ToolCategory {
  index: string;
  category: string;
  items: ToolItem[];
  sketch: string;
  sketchAlt: string;
}

export function makeToolCategories(sketches: {
  infrastructure: string;
  ethereum: string;
  devtools: string;
  hardware: string;
  services: string;
}): ToolCategory[] {
  return [
    {
      index: "01",
      category: "Infrastructure & CI/CD",
      sketch: sketches.infrastructure,
      sketchAlt: "Server rack and CI/CD pipeline sketch",
      items: [
        { name: "Jenkins", note: "Primary CI orchestration. Self-hosted, declarative pipelines.", url: "https://www.jenkins.io" },
        { name: "Docker", note: "All build environments are containerised. Reproducibility by default." },
        { name: "Nix", note: "Dependency management and reproducible builds. Painful to learn, worth it." },
        { name: "Ansible", note: "Server provisioning and configuration management." },
        { name: "Fastlane", note: "iOS and Android release automation, signing, and deployment." },
        { name: "Hetzner", note: "Primary cloud provider for Ethereum nodes. Excellent price-to-performance." },
      ],
    },
    {
      index: "02",
      category: "Ethereum & Validator Stack",
      sketch: sketches.ethereum,
      sketchAlt: "Ethereum validator network diagram sketch",
      items: [
        { name: "Nimbus", note: "Consensus client of choice. Lightweight, written in Nim.", url: "https://nimbus.team" },
        { name: "Nethermind", note: "Execution client. .NET-based, robust and well-maintained.", url: "https://nethermind.io" },
        { name: "Rocket Pool", note: "Decentralised staking protocol. Participating as a node operator and ODAO member.", url: "https://rocketpool.net" },
        { name: "Lido", note: "Liquid staking. Running validators as part of Lido's operator set.", url: "https://lido.fi" },
        { name: "Grafana + Prometheus", note: "Validator and node monitoring. Alerts wired to PagerDuty." },
      ],
    },
    {
      index: "03",
      category: "Development Tools",
      sketch: sketches.devtools,
      sketchAlt: "Terminal and vim editor sketch",
      items: [
        { name: "Neovim", note: "Daily driver. Lua config, minimal plugins, fast." },
        { name: "tmux", note: "Multiplexer for long-running sessions on remote servers." },
        { name: "Git", note: "Obvious, but worth saying: command-line only." },
        { name: "zsh + starship", note: "Shell setup. Starship prompt keeps it informative without clutter." },
        { name: "Ghostty", note: "Terminal emulator. Fast and native." },
      ],
    },
    {
      index: "04",
      category: "Hardware & Desk",
      sketch: sketches.hardware,
      sketchAlt: "Desk setup with laptop and monitor sketch",
      items: [
        { name: "MacBook Pro M3 Pro", note: "Primary machine. The ARM build performance is genuinely transformative." },
        { name: "Framework 13 (Linux)", note: "Secondary machine running NixOS. Used for testing Linux builds." },
        { name: "LG 27UK850-W", note: "27-inch 4K IPS. Good enough without being excessive." },
        { name: "Keychron Q1 Pro", note: "Wireless mechanical. Gateron G Pro switches." },
        { name: "Logitech MX Master 3", note: "The scroll wheel alone justifies the price." },
      ],
    },
    {
      index: "05",
      category: "Services & Subscriptions",
      sketch: sketches.services,
      sketchAlt: "Keys, cloud, DNS and security icons sketch",
      items: [
        { name: "1Password", note: "Password and secrets manager. Team license." },
        { name: "Tailscale", note: "VPN mesh for accessing home lab and build servers." },
        { name: "Cloudflare", note: "DNS, tunnels, and R2 for static assets." },
        { name: "Backblaze B2", note: "Cheap, reliable object storage for backups." },
        { name: "Linear", note: "Issue tracking for personal projects. Clean and fast." },
      ],
    },
  ];
}
