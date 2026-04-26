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

// Parse a human date like "March 2026" into "2026-03-01"
function parseDate(dateStr) {
  const months = {
    january: "01", february: "02", march: "03", april: "04",
    may: "05", june: "06", july: "07", august: "08",
    september: "09", october: "10", november: "11", december: "12",
  };
  const parts = dateStr.toLowerCase().split(/\s+/);
  if (parts.length !== 2) return null;
  const month = months[parts[0]];
  const year = parts[1];
  if (!month || !year) return null;
  return `${year}-${month}-01`;
}

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
  {
    route: "/syncup/privacy-policy",
    title: "SyncUp Privacy Policy | Siddarth Kumar",
    description:
      "Privacy policy for the SyncUp iOS app, an open-source client for the Syncthing peer-to-peer file synchronization protocol.",
    noindex: true,
  },
];

// Parse blog post metadata from the source TS file.
const blogSource = readFileSync("src/data/blog-posts.ts", "utf-8");
const postRegex =
  /slug:\s*"([^"]+)"[\s\S]*?date:\s*"([^"]+)"[\s\S]*?title:\s*(?:"((?:[^"\\]|\\.)*)"|`([^`]+)`)[\s\S]*?excerpt:\s*\n?\s*(?:"((?:[^"\\]|\\.)*)"|`([^`]+)`)/g;

let match;
while ((match = postRegex.exec(blogSource)) !== null) {
  const slug = match[1];
  const date = match[2];
  const title = (match[3] || match[4] || "").replace(/\\"/g, '"');
  const excerpt = (match[5] || match[6] || "").replace(/\\"/g, '"');

  pages.push({
    route: `/blog/${slug}`,
    title: `${title} | Siddarth Kumar`,
    description: excerpt,
    ogType: "article",
    date,
  });
}

// Parse project metadata from projects.ts. Only entries that declare a slug
// get a dedicated page; others are linked externally and need no route.
const projectSource = readFileSync("src/data/projects.ts", "utf-8");
const projectBlocks = projectSource
  .split(/\{\s*index:/)
  .slice(1)
  .map((block) => "index:" + block);

for (const block of projectBlocks) {
  const slugMatch = /slug:\s*"([^"]+)"/.exec(block);
  if (!slugMatch) continue;
  const slug = slugMatch[1];
  const name = (/name:\s*"([^"]+)"/.exec(block) || [])[1] || slug;
  const year = (/year:\s*"([^"]+)"/.exec(block) || [])[1] || "";
  const descMatch = /description:\s*\n?\s*"((?:[^"\\]|\\.)*)"/.exec(block);
  const description = (descMatch ? descMatch[1] : "").replace(/\\"/g, '"');

  pages.push({
    route: `/projects/${slug}`,
    title: `${name} | Siddarth Kumar`,
    description,
    ogType: "project",
    date: year ? `January ${year}` : undefined,
  });
}

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeJsonLd(str) {
  return str.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function trailingSlash(route) {
  return route.endsWith("/") ? route : route + "/";
}

function generateHtml(page) {
  const title = escapeHtml(page.title);
  const description = escapeHtml(page.description);
  const url = `${BASE_URL}${trailingSlash(page.route)}`;
  // "project" is an internal marker; the actual og:type stays "website".
  const ogType =
    !page.ogType || page.ogType === "project" ? "website" : page.ogType;

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

  // Replace canonical URL
  html = html.replace(
    /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/,
    `<link rel="canonical" href="${url}" />`
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

  // Static pages with custom OG images
  const staticOgMap = { "/blog": "blog", "/uses": "uses" };
  if (staticOgMap[page.route]) {
    const ogImage = `${BASE_URL}/og/${staticOgMap[page.route]}.png`;
    html = html.replace(
      /<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>/,
      `<meta property="og:image" content="${ogImage}" />`
    );
    html = html.replace(
      /<meta\s+name="twitter:image"\s+content="[^"]*"\s*\/?>/,
      `<meta name="twitter:image" content="${ogImage}" />`
    );
  }

  // For blog posts, use per-post OG image
  if (page.ogType === "article") {
    const slug = page.route.replace("/blog/", "");
    const ogImage = `${BASE_URL}/og/${slug}.png`;
    html = html.replace(
      /<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>/,
      `<meta property="og:image" content="${ogImage}" />`
    );
    html = html.replace(
      /<meta\s+name="twitter:image"\s+content="[^"]*"\s*\/?>/,
      `<meta name="twitter:image" content="${ogImage}" />`
    );
    // Blog posts have proper 1200x630 images, use summary_large_image
    html = html.replace(
      /<meta\s+name="twitter:card"\s+content="[^"]*"\s*\/?>/,
      `<meta name="twitter:card" content="summary_large_image" />`
    );
  }

  // For project pages, use per-project OG image
  if (page.ogType === "project") {
    const slug = page.route.replace("/projects/", "");
    const ogImage = `${BASE_URL}/og/project-${slug}.png`;
    html = html.replace(
      /<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>/,
      `<meta property="og:image" content="${ogImage}" />`
    );
    html = html.replace(
      /<meta\s+name="twitter:image"\s+content="[^"]*"\s*\/?>/,
      `<meta name="twitter:image" content="${ogImage}" />`
    );
    html = html.replace(
      /<meta\s+name="twitter:card"\s+content="[^"]*"\s*\/?>/,
      `<meta name="twitter:card" content="summary_large_image" />`
    );
  }

  // Pages flagged noindex (e.g. legal pages we host but don't want surfaced)
  if (page.noindex) {
    html = html.replace(
      /<meta\s+name="robots"\s+content="[^"]*"\s*\/?>/,
      `<meta name="robots" content="noindex, nofollow" />`
    );
  }

  // For blog posts, replace the Person JSON-LD with Article JSON-LD
  if (page.ogType === "article") {
    const isoDate = parseDate(page.date) || new Date().toISOString().split("T")[0];
    const articleJsonLd = `<script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": "${escapeJsonLd(page.title.replace(" | Siddarth Kumar", ""))}",
      "description": "${escapeJsonLd(page.description)}",
      "datePublished": "${isoDate}",
      "url": "${url}",
      "author": {
        "@type": "Person",
        "name": "Siddarth Kumar",
        "url": "https://siddarthkay.com"
      }
    }
    </script>`;

    html = html.replace(
      /<script type="application\/ld\+json">[\s\S]*?<\/script>/,
      articleJsonLd
    );
  }

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

// Update 404.html to match root, but mark as noindex
let notFoundHtml = generateHtml(pages[0]);
notFoundHtml = notFoundHtml.replace(
  '<meta name="robots" content="index, follow" />',
  '<meta name="robots" content="noindex, nofollow" />'
);
writeFileSync(path.join(DIST, "404.html"), notFoundHtml);

console.log(`Pre-rendered meta tags for ${count + 2} pages (${count} routes + index.html + 404.html)`);

// Generate sitemap.xml with accurate lastmod dates
const today = new Date().toISOString().split("T")[0];
const sitemapEntries = pages.filter((p) => !p.noindex).map((page) => {
  const freq =
    page.route === "/"
      ? "daily"
      : page.ogType === "article"
        ? "monthly"
        : page.ogType === "project"
          ? "monthly"
          : "weekly";
  const priority =
    page.route === "/"
      ? "1.0"
      : page.ogType === "article"
        ? "0.7"
        : page.ogType === "project"
          ? "0.7"
          : "0.8";
  const lastmod = page.date ? (parseDate(page.date) || today) : today;
  return `  <url>
    <loc>${BASE_URL}${trailingSlash(page.route)}</loc>
    <lastmod>${lastmod}</lastmod>
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
console.log(`Generated sitemap.xml with ${sitemapEntries.length} URLs`);

// Generate RSS feed
const feedItems = pages
  .filter((p) => p.ogType === "article")
  .map((p) => {
    const isoDate = parseDate(p.date) || today;
    const url = `${BASE_URL}${trailingSlash(p.route)}`;
    const title = p.title.replace(" | Siddarth Kumar", "");
    return `  <item>
    <title>${escapeHtml(title)}</title>
    <link>${url}</link>
    <guid>${url}</guid>
    <pubDate>${new Date(isoDate).toUTCString()}</pubDate>
    <description>${escapeHtml(p.description)}</description>
  </item>`;
  });

const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>Siddarth Kumar</title>
  <link>${BASE_URL}</link>
  <description>Notes on CI/CD pipelines, infrastructure engineering, Ethereum nodes, and DevOps.</description>
  <language>en</language>
  <atom:link href="${BASE_URL}/feed.xml" rel="self" type="application/rss+xml" />
${feedItems.join("\n")}
</channel>
</rss>
`;

writeFileSync(path.join(DIST, "feed.xml"), rss);
console.log(`Generated feed.xml with ${feedItems.length} items`);
