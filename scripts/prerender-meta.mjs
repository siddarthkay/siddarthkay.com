/**
 * Post-build script that generates index.html files for each route
 * with correct <meta> tags for SEO and social sharing.
 *
 * Reads the built dist/index.html as a template, replaces the <head>
 * meta tags for each route, and writes to dist/<route>/index.html.
 *
 * This runs AFTER `vite build` and BEFORE deploy.
 */

import { readFileSync, writeFileSync, mkdirSync } from "fs";
import path from "path";

const DIST = path.resolve("dist");
const BASE_URL = "https://siddarthkay.com";
const template = readFileSync(path.join(DIST, "index.html"), "utf-8");

// Page metadata — static pages + blog posts
const pages = [
  {
    route: "/",
    title: "Siddarth Kumar | Infrastructure Engineer & DevOps",
    description:
      "Siddarth Kumar builds and maintains the infrastructure behind decentralized software. CI/CD pipelines, multi-platform build systems, and Ethereum validator nodes.",
  },
  {
    route: "/blog",
    title: "Blog | Siddarth Kumar",
    description:
      "Writing on CI/CD pipelines, infrastructure engineering, Ethereum nodes, and DevOps.",
  },
  {
    route: "/uses",
    title: "Uses | Siddarth Kumar",
    description:
      "Tools, hardware, and software Siddarth Kumar uses for infrastructure engineering and daily work.",
  },
];

// Parse blog post metadata from the built JS bundle is fragile.
// Instead, read the source TS file and extract slugs/titles/excerpts with regex.
const blogSource = readFileSync("src/data/blog-posts.ts", "utf-8");
const postRegex =
  /slug:\s*"([^"]+)"[\s\S]*?title:\s*(?:"((?:[^"\\]|\\.)*)"|`([^`]+)`)[\s\S]*?excerpt:\s*\n?\s*(?:"((?:[^"\\]|\\.)*)"|`([^`]+)`)/g;

let match;
while ((match = postRegex.exec(blogSource)) !== null) {
  const slug = match[1];
  // Title might have escaped quotes
  const title = (match[2] || match[3] || "").replace(/\\"/g, '"');
  const excerpt = (match[4] || match[5] || "").replace(/\\"/g, '"');

  pages.push({
    route: `/blog/${slug}`,
    title: `${title} | Siddarth Kumar`,
    description: excerpt,
    ogType: "article",
  });
}

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function generateHtml(page) {
  const title = escapeHtml(page.title);
  const description = escapeHtml(page.description);
  const url = `${BASE_URL}${page.route}`;
  const ogType = page.ogType || "website";

  let html = template;

  // Replace <title>
  html = html.replace(
    /<title>[^<]*<\/title>/,
    `<title>${title}</title>`
  );

  // Replace meta description
  html = html.replace(
    /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/,
    `<meta name="description" content="${description}" />`
  );

  // Replace OG tags
  html = html.replace(
    /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:title" content="${title}" />`
  );
  html = html.replace(
    /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:description" content="${description}" />`
  );
  html = html.replace(
    /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:url" content="${url}" />`
  );
  html = html.replace(
    /<meta\s+property="og:type"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:type" content="${ogType}" />`
  );

  // Replace Twitter tags
  html = html.replace(
    /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/,
    `<meta name="twitter:title" content="${title}" />`
  );
  html = html.replace(
    /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/,
    `<meta name="twitter:description" content="${description}" />`
  );

  return html;
}

let count = 0;
for (const page of pages) {
  if (page.route === "/") continue; // index.html already exists

  const dir = path.join(DIST, page.route);
  mkdirSync(dir, { recursive: true });
  writeFileSync(path.join(dir, "index.html"), generateHtml(page));
  count++;
}

// Also update the root index.html with correct home meta
writeFileSync(path.join(DIST, "index.html"), generateHtml(pages[0]));

// Update 404.html to match root
writeFileSync(path.join(DIST, "404.html"), generateHtml(pages[0]));

console.log(`Pre-rendered meta tags for ${count + 2} pages (${count} routes + index.html + 404.html)`);

// Generate sitemap.xml from the same pages list
const today = new Date().toISOString().split("T")[0];
const sitemapEntries = pages.map((page) => {
  const freq = page.route === "/" ? "daily" : page.ogType === "article" ? "monthly" : "weekly";
  const priority = page.route === "/" ? "1.0" : page.ogType === "article" ? "0.7" : "0.8";
  return `  <url>
    <loc>${BASE_URL}${page.route}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${freq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
});

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapEntries.join("\n")}
</urlset>
`;

writeFileSync(path.join(DIST, "sitemap.xml"), sitemap);
console.log(`Generated sitemap.xml with ${pages.length} URLs`);
