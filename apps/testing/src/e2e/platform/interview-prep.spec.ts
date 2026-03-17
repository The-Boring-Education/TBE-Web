import { expect, test } from "../fixtures/platform.fixture";

test.describe("Interview Prep — Public Flow", () => {
  test.describe("Landing Page (/interview-prep)", () => {
    test("loads and renders hero section", async ({ platformPage: page }) => {
      const response = await page.goto("/interview-prep");
      expect(response?.status()).toBe(200);

      await expect(page.getByText("Preparing for")).toBeVisible();
      await expect(page.getByText("Tech Interviews??")).toBeVisible();
    });

    test("displays hero description", async ({ platformPage: page }) => {
      await page.goto("/interview-prep");

      await expect(
        page.getByText(
          "Crack Tech Interview with Questions Asked in Real Interviews.",
        ),
      ).toBeVisible();
    });

    test("'Explore Sheets' CTA links to explore page", async ({
      platformPage: page,
    }) => {
      await page.goto("/interview-prep");

      const exploreCTA = page.getByRole("link", { name: "Explore Sheets" });
      await expect(exploreCTA).toBeVisible();
      await expect(exploreCTA).toHaveAttribute(
        "href",
        "/interview-prep/explore",
      );
    });

    test("renders features section", async ({ platformPage: page }) => {
      await page.goto("/interview-prep");

      await expect(page.getByText("What We Do")).toBeVisible();
    });
  });

  test.describe("Explore Page (/interview-prep/explore)", () => {
    test("loads and renders interview sheet cards", async ({
      platformPage: page,
    }) => {
      await page.goto("/interview-prep/explore");

      await expect(page.getByText("Interview Prep Sheets")).toBeVisible();

      await expect(
        page.getByText("JavaScript Interview Questions"),
      ).toBeVisible();
      await expect(page.getByText("React Interview Questions")).toBeVisible();
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

      await expect(page.getByText("No Sheets found")).toBeVisible();
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
