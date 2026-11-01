import { expect, test } from "../fixtures/auth.fixture";

test.describe("Platform — Quizzes Dashboard E2E", () => {
  test.beforeEach(async ({ authedPage: page }) => {
    // Mock user quizzes & categories
    await page.route("**/api/proxy/quiz**", (route) => {
      const url = route.request().url();
      if (url.includes("/categories")) {
        return route.fulfill({
          status: 200,
          json: {
            status: true,
            data: [
              { _id: "cat-web", categoryName: "Web Development" },
              { _id: "cat-prog", categoryName: "Programming" },
            ],
          },
        });
      }
      return route.fulfill({
        status: 200,
        json: {
          status: true,
          data: [],
        },
      });
    });

    // Mock gamification stats
    await page.route("**/api/proxy/gamification/streak**", (route) => {
      return route.fulfill({
        status: 200,
        json: {
          status: true,
          data: { currentStreak: 3, longestStreak: 7 },
        },
      });
    });
  });

  test("loads quizzes dashboard and renders banner and category filters", async ({
    authedPage: page,
  }) => {
    await page.goto("/quizzes/dashboard", { waitUntil: "domcontentloaded" });

    await expect(page.getByText(/popular quizzes/i)).toBeVisible({
      timeout: 15_000,
    });

    // Check category filter pills
    await expect(
      page.getByRole("button", { name: "All", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Web Development" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Programming" }),
    ).toBeVisible();
  });

  test("filter category pills switch active filter", async ({
    authedPage: page,
  }) => {
    await page.goto("/quizzes/dashboard", { waitUntil: "domcontentloaded" });

    const webDevBtn = page.getByRole("button", { name: "Web Development" });
    await expect(webDevBtn).toBeVisible({ timeout: 15_000 });
    await webDevBtn.click();

    // Verify filter pill has active styling
    await expect(webDevBtn).toHaveClass(/bg-\[#EF4444\]/);
  });
});
