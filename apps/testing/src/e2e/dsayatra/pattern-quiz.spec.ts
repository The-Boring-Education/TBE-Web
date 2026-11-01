import { expect, test } from "@playwright/test";

import { mockDsayatraDashboardApis } from "../fixtures/authenticated-dashboard-smoke";
import {
  fullyOnboardedProductFieldsByApp,
  installOnboardingRedirectMocks,
} from "../fixtures/onboarding-redirect";

test.describe("DSA Yatra — Pattern Quiz E2E Flow", () => {
  test.beforeEach(async ({ page }) => {
    await installOnboardingRedirectMocks(
      page,
      fullyOnboardedProductFieldsByApp.dsayatra,
    );
    await mockDsayatraDashboardApis(page);

    // Mock content feedback widget submissions
    await page.route("**/api/proxy/feedback**", (route) => {
      return route.fulfill({
        status: 200,
        json: { status: true, message: "Feedback submitted successfully" },
      });
    });
  });

  test("loads pattern quiz page with breadcrumbs and start screen", async ({
    page,
  }) => {
    await page.goto("/pattern-quiz", { waitUntil: "domcontentloaded" });

    await expect(page).toHaveURL(/\/pattern-quiz/);

    // Breadcrumb verification
    await expect(page.getByRole("link", { name: "DSA Yatra" })).toBeVisible({
      timeout: 25_000,
    });
    await expect(page.getByText("Pattern Quiz").first()).toBeVisible();

    // Start Screen Title & Details
    await expect(
      page.getByRole("heading", { name: /DSA Pattern Quiz/i }),
    ).toBeVisible();
    await expect(
      page.getByText(/Train your algorithmic intuition/i),
    ).toBeVisible();

    // Feature Badges
    await expect(page.getByText(/5 Qs/i)).toBeVisible();
    await expect(page.getByText(/12\+ Patterns/i)).toBeVisible();
    await expect(page.getByText(/Adaptive/i)).toBeVisible();

    // Start Button
    const startBtn = page.getByRole("button", { name: /start assessment/i });
    await expect(startBtn).toBeVisible();
  });

  test("can navigate to pattern quiz from sidebar navigation", async ({
    page,
  }) => {
    await page.goto("/dashboard", { waitUntil: "domcontentloaded" });

    // Click Pattern Quiz in sidebar
    const patternQuizNav = page
      .getByRole("button", { name: /pattern quiz/i })
      .or(page.getByRole("link", { name: /pattern quiz/i }))
      .first();
    await expect(patternQuizNav).toBeVisible({ timeout: 25_000 });

    await patternQuizNav.click();
    await expect(page).toHaveURL(/\/pattern-quiz/);
    await expect(
      page.getByRole("heading", { name: /DSA Pattern Quiz/i }),
    ).toBeVisible();
  });

  test("completes full assessment flow from start to results and review", async ({
    page,
  }) => {
    await page.goto("/pattern-quiz", { waitUntil: "domcontentloaded" });

    // 1. Start the Assessment
    const startBtn = page.getByRole("button", { name: /start assessment/i });
    await expect(startBtn).toBeVisible({ timeout: 25_000 });
    await startBtn.click();

    // 2. Active Quiz Shell
    await expect(
      page.getByRole("heading", { name: /DSA Pattern Challenge/i }),
    ).toBeVisible();
    await expect(page.getByText("1 / 5")).toBeVisible();

    // Next button starts disabled
    const nextBtn = page.getByRole("button", { name: /^next$/i });
    await expect(nextBtn).toBeDisabled();

    // 3. Answer Questions 1 through 4
    for (let q = 1; q <= 4; q++) {
      await expect(page.getByText(`${q} / 5`)).toBeVisible();

      // Click option A
      const optionA = page.locator("button").filter({ hasText: /^A/ }).first();
      await optionA.click();

      // Click Next
      await expect(nextBtn).toBeEnabled();
      await nextBtn.click();
    }

    // 4. Question 5 — Submit Quiz
    await expect(page.getByText("5 / 5")).toBeVisible();
    const submitBtn = page.getByRole("button", { name: /submit quiz/i });
    await expect(submitBtn).toBeDisabled();

    // Select option for question 5
    const lastOption = page.locator("button").filter({ hasText: /^A/ }).first();
    await lastOption.click();

    await expect(submitBtn).toBeEnabled();
    await submitBtn.click();

    // 5. Results Screen
    await expect(page.getByText(/Assessment Completed/i)).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByText("Accuracy")).toBeVisible();
    await expect(page.getByText("Score")).toBeVisible();
    await expect(
      page.getByRole("button", { name: /retake quiz/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /go to dashboard/i }),
    ).toBeVisible();

    // 6. Test 'Go to Dashboard' navigation
    await page.getByRole("button", { name: /go to dashboard/i }).click();
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("retake quiz restarts assessment back to question 1", async ({
    page,
  }) => {
    await page.goto("/pattern-quiz", { waitUntil: "domcontentloaded" });

    // Start quiz
    await page.getByRole("button", { name: /start assessment/i }).click();

    // Quickly answer and advance through 5 questions
    for (let q = 1; q <= 4; q++) {
      const option = page.locator("button").filter({ hasText: /^A/ }).first();
      await option.click();
      await page.getByRole("button", { name: /^next$/i }).click();
    }

    // Question 5 submit
    await page.locator("button").filter({ hasText: /^A/ }).first().click();
    await page.getByRole("button", { name: /submit quiz/i }).click();

    // On results screen, click Retake Quiz
    const retakeBtn = page.getByRole("button", { name: /retake quiz/i });
    await expect(retakeBtn).toBeVisible({ timeout: 10_000 });
    await retakeBtn.click();

    // Should be back at Question 1
    await expect(page.getByText("1 / 5")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /DSA Pattern Challenge/i }),
    ).toBeVisible();
  });
});
