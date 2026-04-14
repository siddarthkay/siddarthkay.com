import { test, expect } from "@playwright/test";
import { readFileSync } from "fs";
import { resolve } from "path";

/** Read a pre-rendered HTML file and check for a substring */
function readDistHtml(route: string): string {
  const file =
    route === "/"
      ? resolve("dist/index.html")
      : resolve(`dist${route}/index.html`);
  return readFileSync(file, "utf-8");
}

test.describe("Homepage", () => {
  test("renders hero with single h1", async ({ page }) => {
    await page.goto("/");
    const h1 = page.locator("h1");
    await expect(h1).toHaveCount(1);
    await expect(h1).toContainText("Siddarth");
    await expect(h1).toContainText("Kumar");
  });

  test("renders all sections", async ({ page }) => {
    await page.goto("/");
    for (const id of ["about", "vitals", "experience", "projects", "writing", "contact"]) {
      await expect(page.locator(`#${id}`)).toBeAttached();
    }
  });

  test("has correct meta tags", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Siddarth Kumar/);
    const desc = page.locator('meta[name="description"]');
    await expect(desc).toHaveAttribute("content", /infrastructure/i);
    const canonical = page.locator('link[rel="canonical"]');
    await expect(canonical).toHaveAttribute("href", "https://siddarthkay.com/");
  });

  test("navigation links work", async ({ page }) => {
    await page.goto("/");
    await page.click('a[href="/uses"]');
    await expect(page).toHaveURL("/uses");
  });
});

test.describe("Blog index", () => {
  test("renders post list", async ({ page }) => {
    await page.goto("/blog");
    await expect(page.locator("h1")).toContainText("All posts");
    const posts = page.locator("a[href^='/blog/']");
    await expect(posts.first()).toBeVisible();
    expect(await posts.count()).toBeGreaterThanOrEqual(5);
  });

  test("has correct meta tags", async ({ page }) => {
    await page.goto("/blog");
    await expect(page).toHaveTitle(/Blog/);
  });

  test("pre-rendered HTML has correct canonical", () => {
    const html = readDistHtml("/blog");
    expect(html).toContain('href="https://siddarthkay.com/blog/"');
  });
});

test.describe("Blog post", () => {
  test("renders article content", async ({ page }) => {
    await page.goto("/blog/react-native-nim");
    await expect(page.locator("h1")).toBeVisible();
    const prose = page.locator(".prose-blog");
    await expect(prose).toBeAttached();
    const h2s = prose.locator("h2");
    expect(await h2s.count()).toBeGreaterThan(0);
  });

  test("headings have anchor IDs", async ({ page }) => {
    await page.goto("/blog/react-native-nim");
    const h2s = page.locator(".prose-blog h2[id]");
    expect(await h2s.count()).toBeGreaterThan(0);
    const id = await h2s.first().getAttribute("id");
    expect(id).toBeTruthy();
    expect(id).toMatch(/^[a-z0-9-]+$/);
  });

  test("pre-rendered HTML has article structured data", () => {
    const html = readDistHtml("/blog/react-native-nim");
    expect(html).toContain('"@type": "Article"');
    expect(html).toContain('"datePublished"');
  });

  test("pre-rendered HTML has per-post OG image", () => {
    const html = readDistHtml("/blog/react-native-nim");
    expect(html).toContain("/og/react-native-nim.png");
  });
});

test.describe("Uses page", () => {
  test("renders tool categories", async ({ page }) => {
    await page.goto("/uses");
    await expect(page.locator("h1")).toContainText("What I use");
    const categories = page.locator("[id] .label-mono");
    expect(await categories.count()).toBeGreaterThan(0);
  });

  test("has correct meta tags", async ({ page }) => {
    await page.goto("/uses");
    await expect(page).toHaveTitle(/Uses/);
  });

  test("pre-rendered HTML has correct canonical", () => {
    const html = readDistHtml("/uses");
    expect(html).toContain('href="https://siddarthkay.com/uses/"');
  });
});

test.describe("404 page", () => {
  test("renders for unknown routes", async ({ page }) => {
    await page.goto("/this-does-not-exist");
    await expect(page.locator("text=404.")).toBeVisible();
    await expect(page.locator("text=Page Not Found")).toBeVisible();
  });

  test("has navigation links back to the site", async ({ page }) => {
    await page.goto("/this-does-not-exist");
    const main = page.locator("main");
    await expect(main.locator('a[href="/"]')).toBeVisible();
    await expect(main.locator('a[href="/blog"]')).toBeVisible();
    await expect(main.locator('a[href="/uses"]')).toBeVisible();
  });
});

test.describe("No lazy chunk loading", () => {
  test("client-side navigation does not fetch additional JS", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Track new JS requests during SPA navigation
    const newJsRequests: string[] = [];
    page.on("request", (req) => {
      if (req.url().endsWith(".js")) newJsRequests.push(req.url());
    });

    // Navigate via links (SPA navigation, no full page reload)
    await page.click('a[href="/uses"]');
    await expect(page.locator("h1")).toContainText("What I use");

    await page.click('a[href="/blog"]');
    await expect(page.locator("h1")).toContainText("All posts");

    await page.click('a[href="/blog/react-native-nim"]');
    await expect(page.locator("h1")).toBeVisible();

    expect(newJsRequests.length).toBe(0);
  });
});

test.describe("SEO essentials", () => {
  const routes = ["/", "/blog", "/uses", "/blog/react-native-nim"];

  for (const route of routes) {
    test(`${route} has OG tags`, async ({ page }) => {
      await page.goto(route);
      await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
        "content",
        /.+/
      );
      await expect(
        page.locator('meta[property="og:description"]')
      ).toHaveAttribute("content", /.+/);
      await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
        "content",
        /^https:\/\/siddarthkay\.com\/og\/.+\.png$/
      );
      await expect(
        page.locator('meta[name="twitter:card"]')
      ).toHaveAttribute("content", /summary/);
    });
  }

  test("robots.txt is served", async ({ request }) => {
    const res = await request.get("/robots.txt");
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toContain("Sitemap:");
    expect(body).toContain("User-agent:");
  });

  test("sitemap.xml is served and valid", async ({ request }) => {
    const res = await request.get("/sitemap.xml");
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toContain("<urlset");
    expect(body).toContain("siddarthkay.com");
    expect(body).toContain("/blog/react-native-nim");
  });
});
