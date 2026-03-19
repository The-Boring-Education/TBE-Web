import { expect, test } from "../fixtures/platform.fixture";

test.describe("Shiksha (Courses) — Public Flow", () => {
  test.describe("Landing Page (/shiksha)", () => {
    test("loads landing page and core CTA", async ({ platformPage: page }) => {
      const response = await page.goto("/shiksha");
      expect(response?.status()).toBe(200);

      await expect(
        page.getByRole("link", { name: "Explore Courses" }),
      ).toBeVisible();
    });

    test("'Explore Courses' CTA navigates to explore page", async ({
      platformPage: page,
    }) => {
      await page.goto("/shiksha");

      const exploreCTA = page.getByRole("link", { name: "Explore Courses" });
      await expect(exploreCTA).toBeVisible();
      await expect(exploreCTA).toHaveAttribute("href", "/shiksha/explore");
    });

    test("can move from landing to explore", async ({ platformPage: page }) => {
      await page.goto("/shiksha");
      await page.getByRole("link", { name: "Explore Courses" }).click();
      await page.waitForURL("**/shiksha/explore");
    });
  });

  test.describe("Explore Page (/shiksha/explore)", () => {
    test("loads and renders course links from API", async ({
      platformPage: page,
    }) => {
      await page.goto("/shiksha/explore");

      const courseLinks = page.locator('a[href^="/shiksha/"]');
      await expect(courseLinks.first()).toBeVisible();
      expect(await courseLinks.count()).toBeGreaterThan(0);
    });

    test("displays empty state when no courses exist", async ({ page }) => {
      await page.route("**/api/proxy/shiksha", (route) =>
        route.fulfill({
          status: 200,
          json: { status: true, data: [] },
        }),
      );

      // Mock auxiliary endpoints to prevent errors
      await page.route("**/api/proxy/notification**", (route) =>
        route.fulfill({ status: 200, json: { status: true, data: [] } }),
      );
      await page.route("**/api/proxy/gamification**", (route) =>
        route.fulfill({ status: 200, json: { status: true, data: null } }),
      );

      await page.goto("/shiksha/explore");

      await expect(
        page.getByRole("link", { name: "Go Back To Home" }),
      ).toBeVisible();
    });
  });

  test.describe("Navigation Flow", () => {
    test("user can navigate from shiksha landing to explore page", async ({
      platformPage: page,
    }) => {
      await page.goto("/shiksha");

      await page.getByRole("link", { name: "Explore Courses" }).click();

      await page.waitForURL("**/shiksha/explore");
      await expect(page.locator('a[href^="/shiksha/"]').first()).toBeVisible();
    });
  });
});
