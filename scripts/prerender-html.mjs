/**
 * Post-build: render each route with Playwright and write the full HTML
 * back to dist so crawlers see real content, not an empty shell.
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
  await page.goto(`http://localhost:4173${route}`, {
    waitUntil: "networkidle",
  });
  const html = await page.content();
  const file =
    route === "/" ? "dist/index.html" : `dist${route}/index.html`;
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, `<!DOCTYPE html>${html}`);
  console.log(`Pre-rendered: ${route}`);
}

await browser.close();
await server.close();
