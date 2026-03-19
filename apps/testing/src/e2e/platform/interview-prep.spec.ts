import { expect, test } from "../fixtures/platform.fixture";

test.describe("Interview Prep — Public Flow", () => {
  test.describe("Landing Page (/interview-prep)", () => {
    test("loads landing page and core CTA", async ({ platformPage: page }) => {
      const response = await page.goto("/interview-prep");
      expect(response?.status()).toBe(200);

      const exploreCTA = page.getByRole("link", { name: "Explore Sheets" });
      await expect(exploreCTA).toBeVisible();
      await expect(exploreCTA).toHaveAttribute(
        "href",
        "/interview-prep/explore",
      );
    });

    test("can move from landing to explore", async ({ platformPage: page }) => {
      await page.goto("/interview-prep");

      await page.getByRole("link", { name: "Explore Sheets" }).click();
      await page.waitForURL("**/interview-prep/explore");
    });
  });

  test.describe("Explore Page (/interview-prep/explore)", () => {
    test("loads and renders sheet card links", async ({
      platformPage: page,
    }) => {
      await page.goto("/interview-prep/explore");

      await expect(page.getByText("Interview Prep Sheets")).toBeVisible();

      const viewSheetLinks = page.locator('a[href^="/interview-prep/"]');
      await expect(viewSheetLinks.first()).toBeVisible();
      expect(await viewSheetLinks.count()).toBeGreaterThan(0);
    });

    test("displays empty state when no sheets exist", async ({ page }) => {
      await page.route("**/api/proxy/interview-prep", (route) =>
        route.fulfill({
          status: 200,
          json: { status: true, data: [] },
        }),
      );

      await page.route("**/api/proxy/notification**", (route) =>
        route.fulfill({ status: 200, json: { status: true, data: [] } }),
      );
      await page.route("**/api/proxy/gamification**", (route) =>
        route.fulfill({ status: 200, json: { status: true, data: null } }),
      );
      await page.route("**/api/proxy/user**", (route) =>
        route.fulfill({ status: 200, json: { status: true, data: null } }),
      );

      await page.goto("/interview-prep/explore");

      await expect(
        page.getByRole("link", { name: "Go Back To Home" }),
      ).toBeVisible();
    });
  });

  test.describe("Navigation Flow", () => {
    test("user can navigate from landing to explore page", async ({
      platformPage: page,
    }) => {
      await page.goto("/interview-prep");

      await page.getByRole("link", { name: "Explore Sheets" }).click();

      await page.waitForURL("**/interview-prep/explore");
      await expect(page.getByText("Interview Prep Sheets")).toBeVisible();
    });
  });
});
