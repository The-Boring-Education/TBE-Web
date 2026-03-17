import { expect, test } from "../fixtures/platform.fixture";

test.describe("Shiksha (Courses) — Public Flow", () => {
  test.describe("Landing Page (/shiksha)", () => {
    test("loads and renders hero with course stats", async ({
      platformPage: page,
    }) => {
      const response = await page.goto("/shiksha");
      expect(response?.status()).toBe(200);

      await expect(page.getByText("Learn Tech with")).toBeVisible();
      await expect(page.getByText("Mini Courses")).toBeVisible();
    });

    test("shows key stats", async ({ platformPage: page }) => {
      await page.goto("/shiksha");

      await expect(page.getByText("4+ Free Courses")).toBeVisible();
      await expect(page.getByText("10K+ Students")).toBeVisible();
      await expect(page.getByText("Free Certificates")).toBeVisible();
    });

    test("'Explore Courses' CTA navigates to explore page", async ({
      platformPage: page,
    }) => {
      await page.goto("/shiksha");

      const exploreCTA = page.getByRole("link", { name: "Explore Courses" });
      await expect(exploreCTA).toBeVisible();
      await expect(exploreCTA).toHaveAttribute("href", "/shiksha/explore");
    });

    test("renders features section", async ({ platformPage: page }) => {
      await page.goto("/shiksha");

      await expect(page.getByText("What We Do")).toBeVisible();
    });
  });

  test.describe("Explore Page (/shiksha/explore)", () => {
    test("loads and renders course cards from API", async ({
      platformPage: page,
    }) => {
      await page.goto("/shiksha/explore");

      await expect(page.getByText("Explore")).toBeVisible();
      await expect(page.getByText("Courses")).toBeVisible();

      await expect(page.getByText("Logic Building for Everyone")).toBeVisible();
      await expect(
        page.getByText("Zero to One Frontend Development"),
      ).toBeVisible();
    });

    test("shows course descriptions", async ({ platformPage: page }) => {
      await page.goto("/shiksha/explore");

      await expect(
        page.getByText("Build a strong foundation in programming logic"),
      ).toBeVisible();
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

      await expect(page.getByText("No Courses found")).toBeVisible();
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
      await expect(page.getByText("Logic Building for Everyone")).toBeVisible();
    });
  });
});
