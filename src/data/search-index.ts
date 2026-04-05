import { blogPosts } from "./blog-posts";
import { projects } from "./projects";
import { makeToolCategories } from "./uses-tools";

export type SearchItemType = "post" | "project" | "tool" | "section";

export interface SearchItem {
  type: SearchItemType;
  title: string;
  body: string;
  tags: string[];
  href: string;
  meta?: string;
  external?: boolean;
}

// Home page section summaries (kept short, prose that matches what the site says)
const sections: SearchItem[] = [
  {
    type: "section",
    title: "About",
    body: "Infrastructure engineer working on CI/CD pipelines, build systems, Ethereum validator nodes, and reproducible builds. Currently at IFT, previously shipping across mobile, desktop, and blockchain at Status.",
    tags: ["about", "bio"],
    href: "/#about",
  },
  {
    type: "section",
    title: "Work",
    body: "Recent projects: IFT DevOps engineering, Status React Native and build systems, Source Elements product engineering, Centillion founding to CTO.",
    tags: ["work", "projects"],
    href: "/#work",
  },
  {
    type: "section",
    title: "Writing",
    body: "Blog posts on infrastructure, CI/CD, React Native, Nim, Go, macOS, Docker, debugging.",
    tags: ["blog", "writing"],
    href: "/blog",
  },
  {
    type: "section",
    title: "Uses",
    body: "Tools, hardware, and services in daily use: Jenkins, Docker, Nix, Nimbus, Nethermind, Neovim, MacBook Pro, Framework 13.",
    tags: ["uses", "tools", "hardware"],
    href: "/uses",
  },
  {
    type: "section",
    title: "Contact",
    body: "Get in touch, links to Github, email, and other profiles.",
    tags: ["contact", "email", "github"],
    href: "/#contact",
  },
];

// Blog posts
const postItems: SearchItem[] = blogPosts.map((p) => ({
  type: "post",
  title: p.title,
  body: p.excerpt + "\n\n" + p.content,
  tags: p.tags,
  href: `/blog/${p.slug}`,
  meta: `${p.date} · ${p.readTime}`,
}));

// Projects
const projectItems: SearchItem[] = projects.map((p) => ({
  type: "project",
  title: p.name,
  body: p.description,
  tags: p.tags,
  href: p.href || "/#work",
  meta: p.year,
  external: !!p.href && p.href.startsWith("http"),
}));

// Tools from /uses (sketches aren't needed for search, pass empty strings)
const toolItems: SearchItem[] = makeToolCategories({
  infrastructure: "",
  ethereum: "",
  devtools: "",
  hardware: "",
  services: "",
}).flatMap((cat) =>
  cat.items.map<SearchItem>((item) => ({
    type: "tool",
    title: item.name,
    body: item.note,
    tags: [cat.category],
    href: item.url || "/uses",
    meta: cat.category,
    external: !!item.url,
  }))
);

export const searchIndex: SearchItem[] = [
  ...sections,
  ...postItems,
  ...projectItems,
  ...toolItems,
];
