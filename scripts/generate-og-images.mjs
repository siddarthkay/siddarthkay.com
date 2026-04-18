/**
 * One-time script to generate OG images for all blog posts.
 * Uses satori (JSX → SVG) + resvg (SVG → PNG).
 *
 * Run: node scripts/generate-og-images.mjs
 */

import { readFileSync, writeFileSync, mkdirSync } from "fs";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";

const WIDTH = 1200;
const HEIGHT = 630;

// Colors from tailwind config
const NAVY = "#1a2744";
const PARCHMENT = "#f5f2ed";
const BURNT = "#d4702a";
const SLATE = "#6b7280";

// Fetch Google Fonts as ArrayBuffers
async function loadFont(url) {
  const res = await fetch(url);
  return res.arrayBuffer();
}

async function loadFonts() {
  // Google Fonts CSS API returns different URLs per user-agent.
  // Request .ttf directly via the API with a simple user-agent.
  const serifUrl =
    "https://fonts.googleapis.com/css2?family=Newsreader:wght@500&display=swap";
  const monoUrl =
    "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400&display=swap";

  async function extractFontUrl(cssUrl) {
    const res = await fetch(cssUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      },
    });
    const css = await res.text();
    const match = css.match(/src:\s*url\(([^)]+)\)/);
    if (!match) throw new Error(`No font URL found in CSS from ${cssUrl}`);
    return match[1];
  }

  const [serifFontUrl, monoFontUrl] = await Promise.all([
    extractFontUrl(serifUrl),
    extractFontUrl(monoUrl),
  ]);

  const [serifData, monoData] = await Promise.all([
    loadFont(serifFontUrl),
    loadFont(monoFontUrl),
  ]);

  return [
    { name: "Newsreader", data: serifData, weight: 500, style: "normal" },
    { name: "JetBrains Mono", data: monoData, weight: 400, style: "normal" },
  ];
}

function buildOgMarkup(title, date, tags) {
  // Truncate title if too long
  const displayTitle = title.length > 80 ? title.slice(0, 77) + "..." : title;
  const displayTags = tags.slice(0, 4);

  return {
    type: "div",
    props: {
      style: {
        width: WIDTH,
        height: HEIGHT,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        backgroundColor: NAVY,
        padding: "60px 70px",
        fontFamily: "Newsreader",
      },
      children: [
        // Top bar: site name + date
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            },
            children: [
              {
                type: "span",
                props: {
                  style: {
                    fontFamily: "JetBrains Mono",
                    fontSize: 16,
                    color: BURNT,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                  },
                  children: "siddarthkay.com",
                },
              },
              {
                type: "span",
                props: {
                  style: {
                    fontFamily: "JetBrains Mono",
                    fontSize: 16,
                    color: SLATE,
                    letterSpacing: "0.08em",
                  },
                  children: date,
                },
              },
            ],
          },
        },
        // Divider
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              width: "100%",
              height: 1,
              backgroundColor: BURNT,
              opacity: 0.3,
              marginTop: 24,
            },
            children: [],
          },
        },
        // Title
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              flex: 1,
              alignItems: "center",
            },
            children: [
              {
                type: "h1",
                props: {
                  style: {
                    fontSize: displayTitle.length > 60 ? 48 : 56,
                    fontWeight: 500,
                    color: PARCHMENT,
                    lineHeight: 1.15,
                    margin: 0,
                  },
                  children: displayTitle,
                },
              },
            ],
          },
        },
        // Bottom: tags + author
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
            },
            children: [
              {
                type: "div",
                props: {
                  style: {
                    display: "flex",
                    gap: 10,
                  },
                  children: displayTags.map((tag) => ({
                    type: "span",
                    props: {
                      style: {
                        fontFamily: "JetBrains Mono",
                        fontSize: 13,
                        color: PARCHMENT,
                        opacity: 0.5,
                        border: `1px solid ${PARCHMENT}33`,
                        padding: "4px 10px",
                        borderRadius: 3,
                      },
                      children: tag,
                    },
                  })),
                },
              },
              {
                type: "span",
                props: {
                  style: {
                    fontFamily: "JetBrains Mono",
                    fontSize: 14,
                    color: SLATE,
                  },
                  children: "Siddarth Kumar",
                },
              },
            ],
          },
        },
      ],
    },
  };
}

function buildStaticPageMarkup(title, subtitle) {
  return {
    type: "div",
    props: {
      style: {
        width: WIDTH,
        height: HEIGHT,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        backgroundColor: NAVY,
        padding: "60px 70px",
        fontFamily: "Newsreader",
      },
      children: [
        // Top bar
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            },
            children: [
              {
                type: "span",
                props: {
                  style: {
                    fontFamily: "JetBrains Mono",
                    fontSize: 16,
                    color: BURNT,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                  },
                  children: "siddarthkay.com",
                },
              },
            ],
          },
        },
        // Divider
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              width: "100%",
              height: 1,
              backgroundColor: BURNT,
              opacity: 0.3,
              marginTop: 24,
            },
            children: [],
          },
        },
        // Title block
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              flexDirection: "column",
              flex: 1,
              justifyContent: "center",
              gap: 20,
            },
            children: [
              {
                type: "h1",
                props: {
                  style: {
                    fontSize: 64,
                    fontWeight: 500,
                    color: PARCHMENT,
                    lineHeight: 1.1,
                    margin: 0,
                  },
                  children: title,
                },
              },
              {
                type: "p",
                props: {
                  style: {
                    fontFamily: "JetBrains Mono",
                    fontSize: 18,
                    color: SLATE,
                    lineHeight: 1.6,
                    margin: 0,
                  },
                  children: subtitle,
                },
              },
            ],
          },
        },
        // Bottom
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              justifyContent: "flex-end",
            },
            children: [
              {
                type: "span",
                props: {
                  style: {
                    fontFamily: "JetBrains Mono",
                    fontSize: 14,
                    color: SLATE,
                  },
                  children: "Siddarth Kumar",
                },
              },
            ],
          },
        },
      ],
    },
  };
}

async function generateImage(markup, outPath, fonts) {
  const svg = await satori(markup, {
    width: WIDTH,
    height: HEIGHT,
    fonts,
  });

  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: WIDTH },
  });
  const png = resvg.render().asPng();
  writeFileSync(outPath, png);
  console.log(`  ${outPath}`);
}

async function main() {
  console.log("Loading fonts...");
  const fonts = await loadFonts();

  const outDir = "public/og";
  mkdirSync(outDir, { recursive: true });

  // Static pages
  const staticPages = [
    {
      filename: "home",
      title: "Siddarth Kumar",
      subtitle: "Infrastructure Engineer & DevOps",
    },
    {
      filename: "blog",
      title: "Blog",
      subtitle: "CI/CD, infrastructure, Ethereum, and debugging war stories",
    },
    {
      filename: "uses",
      title: "What I use.",
      subtitle: "Tools, hardware, and services that make up my daily workflow",
    },
  ];

  console.log("Generating static page images...");
  for (const page of staticPages) {
    const markup = buildStaticPageMarkup(page.title, page.subtitle);
    await generateImage(markup, `${outDir}/${page.filename}.png`, fonts);
  }

  // Blog posts
  const blogSource = readFileSync("src/data/blog-posts.ts", "utf-8");
  const postRegex =
    /slug:\s*"([^"]+)"[\s\S]*?date:\s*"([^"]+)"[\s\S]*?title:\s*(?:"((?:[^"\\]|\\.)*)"|`([^`]+)`)[\s\S]*?tags:\s*\[([^\]]*)\]/g;

  const posts = [];
  let match;
  while ((match = postRegex.exec(blogSource)) !== null) {
    const slug = match[1];
    const date = match[2];
    const title = (match[3] || match[4] || "").replace(/\\"/g, '"');
    const tagsRaw = match[5];
    const tags = [...tagsRaw.matchAll(/"([^"]+)"/g)].map((m) => m[1]);
    posts.push({ slug, date, title, tags });
  }

  console.log(`Generating ${posts.length} blog post images...`);
  for (const post of posts) {
    const markup = buildOgMarkup(post.title, post.date, post.tags);
    await generateImage(markup, `${outDir}/${post.slug}.png`, fonts);
  }

  // Projects with dedicated pages
  const projectSource = readFileSync("src/data/projects.ts", "utf-8");
  const projectBlocks = projectSource
    .split(/\{\s*index:/)
    .slice(1)
    .map((b) => "index:" + b);
  const projectsWithPages = [];
  for (const block of projectBlocks) {
    const slugMatch = /slug:\s*"([^"]+)"/.exec(block);
    if (!slugMatch) continue;
    const name = (/name:\s*"([^"]+)"/.exec(block) || [])[1] || slugMatch[1];
    const year = (/year:\s*"([^"]+)"/.exec(block) || [])[1] || "";
    const tagsRaw = (/tags:\s*\[([^\]]*)\]/.exec(block) || [])[1] || "";
    const tags = [...tagsRaw.matchAll(/"([^"]+)"/g)].map((m) => m[1]);
    projectsWithPages.push({ slug: slugMatch[1], name, year, tags });
  }

  console.log(`Generating ${projectsWithPages.length} project images...`);
  for (const p of projectsWithPages) {
    const markup = buildOgMarkup(p.name, p.year, p.tags);
    await generateImage(markup, `${outDir}/project-${p.slug}.png`, fonts);
  }

  console.log("\nDone!");
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
