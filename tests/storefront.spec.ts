import { test, expect, type Page } from "@playwright/test";

async function captureStorefront(page: Page, path: string) {
  // Visiting each image verifies lazy loading and produces a complete screenshot.
  for (const image of await page.locator("main img").all()) {
    await image.scrollIntoViewIfNeeded();
    await expect.poll(() => image.evaluate(element => (element as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  }
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await expect(page.locator(".site-header")).toHaveClass(/over-hero/);
  await expect(page.locator(".site-header")).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  await expect(page.locator(".story-copy")).toHaveCSS("opacity", "1");
  await expect(page.locator(".campaign-copy")).toHaveCSS("opacity", "1");
  await page.screenshot({ path, fullPage: true });
}

test("desktop storefront has no overflow, loads the supplied film, and pauses it", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 960 });
  const failures: string[] = [];
  page.on("pageerror", error => failures.push(error.message));
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Some things");
  await expect(page.locator(".hero-video")).toHaveAttribute("src", /campaign-desktop\.mp4/, { timeout: 30000 });
  await expect(page.getByRole("button", { name: "Pause campaign film" })).toBeVisible({ timeout: 30000 });
  await page.getByRole("button", { name: "Pause campaign film" }).click();
  await expect(page.getByRole("button", { name: "Play campaign film" })).toBeVisible();
  await expect(page.locator(".hero-video")).toHaveCSS("opacity", "1");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await captureStorefront(page, "test-results/home-desktop.png");
  await page.getByRole("link", { name: "Discover the collection", exact: true }).click();
  await expect(page.locator("#collection")).toBeInViewport();
  await expect(page.locator(".site-header")).toHaveClass(/solid/);
  expect(failures).toEqual([]);
});

test("mobile loads only mobile film and navigation works with Escape", async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, deviceScaleFactor: 2, hasTouch: true });
  const page = await context.newPage();
  const videos: string[] = [];
  page.on("request", request => { if (request.url().includes(".mp4")) videos.push(request.url()); });
  await page.goto("/");
  await expect(page.locator(".hero-video")).toHaveAttribute("src", /campaign-mobile\.mp4/, { timeout: 30000 });
  expect(videos.some(url => url.includes("campaign-desktop"))).toBe(false);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await captureStorefront(page, "test-results/home-mobile.png");
  await page.getByRole("button", { name: "Open navigation" }).click();
  await expect(page.getByRole("dialog", { name: "Main navigation" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: "Main navigation" })).not.toBeVisible();
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page.getByRole("navigation", { name: "Mobile navigation" }).getByRole("link", { name: "Our world" }).click();
  await expect(page.locator("#our-world")).toBeInViewport();
  await context.close();
});

test("small phones and tablets keep hero content clear of navigation and film controls", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const viewport of [{ width: 320, height: 568 }, { width: 768, height: 1024 }]) {
    await page.setViewportSize(viewport);
    await page.goto("/");
    await expect(page.locator(".hero-content")).toBeVisible();
    await expect(page.locator(".hero-bottom")).toBeVisible();
    const header = await page.locator(".site-header").boundingBox();
    const content = await page.locator(".hero-content").boundingBox();
    const controls = await page.locator(".hero-bottom").boundingBox();
    expect(content!.y).toBeGreaterThanOrEqual(header!.y + header!.height + 16);
    expect(content!.y + content!.height).toBeLessThanOrEqual(controls!.y - 16);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    if (viewport.width === 320) await captureStorefront(page, "test-results/home-small-phone.png");
  }
});

test("reduced motion and data saving avoid automatic video downloads", async ({ browser }) => {
  for (const mode of ["reduce", "saveData"] as const) {
    const context = await browser.newContext({ reducedMotion: mode === "reduce" ? "reduce" : "no-preference" });
    if (mode === "saveData") await context.addInitScript(() => Object.defineProperty(navigator, "connection", { value: { saveData: true, effectiveType: "4g" }, configurable: true }));
    const page = await context.newPage();
    const requests: string[] = [];
    page.on("request", request => { if (request.url().includes(".mp4")) requests.push(request.url()); });
    await page.goto("/");
    await page.waitForTimeout(2000);
    expect(requests).toEqual([]);
    await expect(page.locator(".hero-video")).not.toHaveAttribute("src");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("button", { name: "Play campaign film" })).toBeVisible();
    await context.close();
  }
});

test("admin pages redirect anonymous visitors and reject unauthorized writes", async ({ page, request, baseURL }) => {
  for (const route of ["/admin", "/admin/products", "/admin/products/new", "/admin/hero", "/admin/settings", "/admin/media"]) {
    await page.goto(route);
    await expect(page).toHaveURL(/\/admin\/login$/);
  }
  await page.screenshot({ path: "test-results/admin-login.png", fullPage: true });
  const response = await request.put("/api/admin/products/forbidden", { data: { name: "Unauthorized" }, headers: { origin: new URL(baseURL!).origin } });
  expect(response.status()).toBe(401);
  const crossOrigin = await request.post("/api/auth/session", { data: { idToken: "invalid" }, headers: { origin: "https://attacker.example" } });
  expect(crossOrigin.status()).toBe(401);
});

test("collection empty state, missing products and SEO routes work", async ({ page, request }) => {
  await page.goto("/products");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByText("Something personal is coming.")).toBeVisible();
  const missing = await page.goto("/products/not-a-real-product");
  // Next.js can stream the loading shell before discovering a missing product.
  expect([200, 404]).toContain(missing?.status());
  await expect(page.getByText("A little off the scent.")).toBeVisible();
  await expect(page.locator('meta[name="robots"][content*="noindex"]').first()).toBeAttached();
  const robots = await request.get("/robots.txt");
  expect(await robots.text()).toContain("Disallow: /admin");
  const sitemap = await request.get("/sitemap.xml");
  expect(await sitemap.text()).toContain("/products</loc>");
});
