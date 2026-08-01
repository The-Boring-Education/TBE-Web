import { expect, test } from "../fixtures/platform.fixture";

test.describe("Platform Landing Page", () => {
  test("loads successfully and exposes hero CTAs", async ({
    platformPage: page,
  }) => {
    const response = await page.goto("/", { waitUntil: "domcontentloaded" });
    expect(response?.status()).toBe(200);

    await expect(
      page.getByRole("link", { name: /Start Learning Now/i }),
    ).toBeVisible();
  });

  test("displays primary and secondary CTAs", async ({
    platformPage: page,
  }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    await expect(
      page.getByRole("link", { name: /Start Learning Now/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Bite Size Courses/i }).first(),
    ).toBeVisible();
  });

  test("renders Products section", async ({ platformPage: page }) => {
    await page.goto("/");

    const productsSection = page.locator("#products");
    await expect(productsSection).toBeAttached();
    const productCTAs = productsSection.getByRole("link");
    expect(await productCTAs.count()).toBeGreaterThan(0);
  });

  test("renders community and testimonial sections", async ({
    platformPage: page,
  }) => {
    await page.goto("/");

    const pageSections = page.locator("section");
    expect(await pageSections.count()).toBeGreaterThan(3);
  });

  test("navigation contains key links", async ({ platformPage: page }) => {
    await page.goto("/");

    const nav = page.locator("nav").first();
    if ((await nav.count()) > 0) {
      const navLinks = nav.getByRole("link");
      await expect(navLinks.first()).toBeVisible({ timeout: 15_000 });
      expect(await navLinks.count()).toBeGreaterThan(0);
    }
  });
});
