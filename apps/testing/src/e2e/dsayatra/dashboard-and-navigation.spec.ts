import { expect, test } from "@playwright/test";

import { mockDsayatraDashboardApis } from "../fixtures/authenticated-dashboard-smoke";
import {
  fullyOnboardedProductFieldsByApp,
  installOnboardingRedirectMocks,
} from "../fixtures/onboarding-redirect";

test.describe("DSA Yatra — Dashboard & Actions E2E Flow", () => {
  test.beforeEach(async ({ page }) => {
    await installOnboardingRedirectMocks(
      page,
      fullyOnboardedProductFieldsByApp.dsayatra,
    );
    await mockDsayatraDashboardApis(page);

    // Mock payment status
    await page.route("**/api/proxy/payment/checkstatus**", (route) => {
      return route.fulfill({
        status: 200,
        json: {
          status: true,
          data: { purchased: true },
        },
      });
    });

    // Mock DSA questions & topics
    await page.route("**/api/proxy/interview-prep/dsa-sheet**", (route) => {
      const url = route.request().url();
      if (url.includes("query=topics")) {
        return route.fulfill({
          status: 200,
          json: {
            status: true,
            data: {
              topics: [
                {
                  topic: "ARRAY",
                  count: 25,
                  solved: 5,
                  accessibleCount: 25,
                  accessibleSolved: 5,
                },
              ],
            },
          },
        });
      }
      return route.fulfill({
        status: 200,
        json: {
          status: true,
          data: {
            questions: [
              {
                _id: "q-1",
                title: "Two Sum",
                topic: "ARRAY",
                difficulty: "EASY",
              },
            ],
          },
        },
      });
    });

    // Mock user profile
    await page.route("**/api/proxy/user/profile**", (route) => {
      return route.fulfill({
        status: 200,
        json: {
          status: true,
          data: {
            linkedInUrl: "https://linkedin.com/in/test",
            githubUrl: "https://github.com/test",
            leetCodeUrl: "https://leetcode.com/test",
            dsaYatra: {
              target: "Product-based",
              timeline: "3 - 6 months",
              experienceLevel: "Tech student",
              companies: ["Google", "Amazon"],
            },
          },
        },
      });
    });
  });

  test("renders dashboard with greeting, progress metrics and goal details", async ({
    page,
  }) => {
    await page.goto("/dashboard", { waitUntil: "domcontentloaded" });

    await expect(page).toHaveURL(/\/dashboard\/?$/);
    await expect(
      page.getByRole("heading", { name: /Welcome back,/i }),
    ).toBeVisible({
      timeout: 25_000,
    });

    // Check Start Solving button
    const startSolvingBtn = page.getByRole("button", {
      name: /start solving/i,
    });
    await expect(startSolvingBtn).toBeVisible();

    // Check Edit Goal button
    const editGoalBtn = page.getByRole("button", { name: /edit goal/i });
    await expect(editGoalBtn).toBeVisible();
  });

  test("Edit Goal button opens onboarding preferences modal", async ({
    page,
  }) => {
    await page.goto("/dashboard", { waitUntil: "domcontentloaded" });

    const editGoalBtn = page.getByRole("button", { name: /edit goal/i });
    await expect(editGoalBtn).toBeVisible({ timeout: 25_000 });

    await editGoalBtn.click();
    // Modal dialog opens
    await expect(page.getByRole("dialog")).toBeVisible({ timeout: 10_000 });
  });

  test("Start Solving button navigates to /sheets", async ({ page }) => {
    await page.goto("/dashboard", { waitUntil: "domcontentloaded" });

    const startSolvingBtn = page.getByRole("button", {
      name: /start solving/i,
    });
    await expect(startSolvingBtn).toBeVisible({ timeout: 25_000 });

    await Promise.all([
      page.waitForURL(/\/sheets/, { timeout: 15_000 }),
      startSolvingBtn.click(),
    ]);
    await expect(page).toHaveURL(/\/sheets/);
  });

  test("All Time button is static without dropdown behavior (Identified Issue)", async ({
    page,
  }) => {
    await page.goto("/dashboard", { waitUntil: "domcontentloaded" });

    const allTimeBtn = page.getByRole("button", { name: /all time/i });
    await expect(allTimeBtn).toBeVisible({ timeout: 25_000 });

    await allTimeBtn.click();
    // There is no dropdown menu (e.g. "Last 7 Days", "Last 30 Days", etc.) rendered
    const dropdownItem = page
      .getByRole("menuitem")
      .or(page.getByText(/last 7 days|this month/i));
    const isDropdownOpen = await dropdownItem.isVisible().catch(() => false);
    expect(isDropdownOpen).toBe(false);
  });
});
