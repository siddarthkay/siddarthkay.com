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
import { createServer } from "vite";
import path from "path";

// Extract slugs from blog-posts.ts
const blogSource = readFileSync("src/data/blog-posts.ts", "utf-8");
const slugs = [...blogSource.matchAll(/slug:\s*"([^"]+)"/g)].map((m) => m[1]);

const routes = ["/", "/blog", "/uses", ...slugs.map((s) => `/blog/${s}`)];

// Serve dist locally
const server = await createServer({
  root: "dist",
  server: { port: 4173, strictPort: true },
  logLevel: "silent",
});
await server.listen();

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

  // Extract just the inner body content from the rendered page
  const renderedBody = await page.evaluate(() => document.body.innerHTML);

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
await server.close();
