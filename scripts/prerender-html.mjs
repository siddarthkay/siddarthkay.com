/**
 * Post-build: render each route with Playwright and inject the rendered
 * <body> into the pre-rendered HTML files so crawlers see real content.
 *
 * Preserves the <head> written by prerender-meta.mjs (meta tags, OG,
 * structured data) and only replaces the <body> with rendered content.
 *
 * Runs AFTER `vite build` and `prerender-meta.mjs`, BEFORE deploy.
 */
import { chromium } from "playwright";
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { preview } from "vite";
import path from "path";

// Extract slugs from blog-posts.ts
const blogSource = readFileSync("src/data/blog-posts.ts", "utf-8");
const slugs = [...blogSource.matchAll(/slug:\s*"([^"]+)"/g)].map((m) => m[1]);

// Extract project slugs from projects.ts (only entries that define a slug)
const projectSource = readFileSync("src/data/projects.ts", "utf-8");
const projectSlugs = [
  ...projectSource.matchAll(/slug:\s*"([^"]+)"/g),
].map((m) => m[1]);

const routes = [
  "/",
  "/blog",
  "/uses",
  "/syncup/privacy-policy",
  ...slugs.map((s) => `/blog/${s}`),
  ...projectSlugs.map((s) => `/projects/${s}`),
];

// Serve the production build from dist/
const server = await preview({
  root: ".",
  preview: { port: 4173, strictPort: true },
  logLevel: "silent",
});

const browser = await chromium.launch();
const page = await browser.newPage();

for (const route of routes) {
  const file =
    route === "/" ? "dist/index.html" : `dist${route}/index.html`;

  // Read the existing HTML with correct <head> from prerender-meta.mjs
  const existingHtml = readFileSync(file, "utf-8");

  // Render the route in the browser to get the full DOM
  await page.goto(`http://localhost:4173${route}`, {
    waitUntil: "networkidle",
  });

  // Scroll to bottom to trigger all useInView animations
  await page.evaluate(async () => {
    await new Promise(resolve => {
      let totalHeight = 0;
      const distance = 300;
      const timer = setInterval(() => {
        window.scrollBy(0, distance);
        totalHeight += distance;
        if (totalHeight >= document.body.scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 50);
    });
  });
  await page.waitForTimeout(500);

  // Extract body content, stripping Framer Motion initial animation styles
  const renderedBody = await page.evaluate(() => {
    document.querySelectorAll('[style*="opacity: 0"]').forEach(el => {
      const style = el.getAttribute('style');
      if (style) {
        const cleaned = style
          .replace(/opacity:\s*0\s*;?/g, '')
          .replace(/transform:\s*translate[^;]*;?/g, '')
          .trim();
        if (cleaned) {
          el.setAttribute('style', cleaned);
        } else {
          el.removeAttribute('style');
        }
      }
    });
    return document.body.innerHTML;
  });

  // Replace the <body> contents in the existing HTML, preserving <head>
  const updatedHtml = existingHtml.replace(
    /<body>[\s\S]*<\/body>/,
    `<body>\n    ${renderedBody}\n  </body>`
  );

  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, updatedHtml);
  console.log(`Pre-rendered: ${route}`);
}

await browser.close();
server.httpServer.close();
