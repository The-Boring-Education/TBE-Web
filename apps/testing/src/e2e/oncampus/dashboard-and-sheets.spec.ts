import { expect, test } from "@playwright/test";

import { mockOnCampusDashboardApis } from "../fixtures/authenticated-dashboard-smoke";
import {
  fullyOnboardedProductFieldsByApp,
  installOnboardingRedirectMocks,
} from "../fixtures/onboarding-redirect";

test.describe("OnCampus — Full Platform E2E Flow", () => {
  test.beforeEach(async ({ page }) => {
    await installOnboardingRedirectMocks(
      page,
      fullyOnboardedProductFieldsByApp.oncampus,
    );
    await mockOnCampusDashboardApis(page);

    // Mock enrolled sheets with progress
    await page.route("**/api/proxy/user/interview-prep**", (route) => {
      if (route.request().method() !== "GET") {
        return route.continue();
      }
      return route.fulfill({
        status: 200,
        json: {
          status: true,
          data: [
            {
              _id: "sheet-frontend-1",
              name: "Frontend System Design",
              slug: "frontend-system-design",
              progress: { completed: 3, total: 10, percentage: 30 },
            },
          ],
        },
      });
    });

    // Mock published interview sheets catalog and specific sheet topic
    await page.route("**/api/proxy/interview-prep**", (route) => {
      const url = route.request().url();
      if (
        route.request().method() === "GET" &&
        !url.includes("user/interview-prep")
      ) {
        return route.fulfill({
          status: 200,
          json: {
            status: true,
            data: [
              {
                _id: "sheet-frontend-1",
                name: "Frontend System Design",
                slug: "frontend-system-design",
                roadmap: "Tech",
                questions: [
                  {
                    _id: "q-1",
                    title: "Design a News Feed",
                    question: "Design a News Feed",
                    answer: "News Feed architecture details",
                    isCompleted: false,
                  },
                ],
              },
            ],
          },
        });
      }
      return route.continue();
    });

    // Mock quiz performance & quiz categories
    await page.route("**/api/proxy/quiz/performance/**", (route) => {
      return route.fulfill({
        status: 200,
        json: {
          status: true,
          data: {
            totalAttempts: 12,
            totalQuizzes: 4,
            averageScore: 78,
            bestScore: 95,
            recentAttempts: [
              {
                id: "att-1",
                quizTitle: "JavaScript Fundamentals",
                score: 85,
                categoryName: "Frontend",
                completedAt: new Date().toISOString(),
              },
            ],
          },
        },
      });
    });

    await page.route("**/api/proxy/quiz/categories**", (route) => {
      return route.fulfill({
        status: 200,
        json: {
          status: true,
          data: [
            {
              _id: "quiz-cat-1",
              categoryName: "JavaScript Basics",
              quizzesCount: 10,
            },
            {
              _id: "quiz-cat-2",
              categoryName: "React Mastery",
              quizzesCount: 15,
            },
          ],
        },
      });
    });

    // Mock Aptitude topics & progress
    await page.route("**/api/proxy/interview-prep/aptitude**", (route) => {
      return route.fulfill({
        status: 200,
        json: {
          status: true,
          data: {
            topics: [
              {
                topic: "percentages",
                count: 20,
                label: "Percentages",
                category: "QUANTITATIVE",
              },
              {
                topic: "blood-relations",
                count: 15,
                label: "Blood Relations",
                category: "LOGICAL",
              },
            ],
          },
        },
      });
    });
  });

  test("dashboard renders welcome hero, continue learning, and quiz stats", async ({
    page,
  }) => {
    await page.goto("/dashboard", { waitUntil: "domcontentloaded" });

    await expect(page).toHaveURL(/\/dashboard\/?$/);
    await expect(page.getByText(/Welcome back,/i)).toBeVisible({
      timeout: 20_000,
    });
    await expect(
      page.getByText(/Ready to master your interviews today\?/i),
    ).toBeVisible();

    // Check enrolled sheet card
    await expect(page.getByText("Frontend System Design")).toBeVisible();
    await expect(page.getByText("30%")).toBeVisible();

    // Check Quiz performance stats
    await expect(page.getByText("12")).toBeVisible();
    await expect(page.getByText("78%")).toBeVisible();
  });

  test("Resume button on dashboard navigates to interview sheet workspace", async ({
    page,
  }) => {
    await page.goto("/dashboard", { waitUntil: "domcontentloaded" });

    const resumeBtn = page.getByRole("button", { name: /resume/i });
    await expect(resumeBtn).toBeVisible({ timeout: 15_000 });

    await resumeBtn.click();
    await expect(page).toHaveURL(
      /\/interview-sheets\?topic=frontend-system-design/,
    );
  });

  test("Practice modules Explore button navigates to Quizzes", async ({
    page,
  }) => {
    await page.goto("/dashboard", { waitUntil: "domcontentloaded" });

    const exploreBtn = page.getByRole("button", { name: /explore →/i });
    await expect(exploreBtn).toBeVisible({ timeout: 15_000 });

    await exploreBtn.click();
    await expect(page).toHaveURL(/\/dashboard\/quizzes/);
  });

  test("interview-sheets page renders roadmap filters and opens sheet workspace", async ({
    page,
  }) => {
    await page.goto("/interview-sheets", { waitUntil: "domcontentloaded" });

    await expect(page.getByText(/Crack Tech Interviews/i)).toBeVisible({
      timeout: 20_000,
    });
    await expect(page.getByText("Frontend System Design")).toBeVisible();

    // Click on Resume / Start Sheet to enter SheetLearningSpace
    const startSheetBtn = page
      .getByRole("button", { name: /resume sheet|start sheet|start learning/i })
      .first();
    await startSheetBtn.click();

    await expect(page).toHaveURL(
      /\/interview-sheets\?topic=frontend-system-design/,
    );
    await expect(page.getByText(/Questions \(1\)/i)).toBeVisible({
      timeout: 10_000,
    });
  });

  test("quizzes page renders catalog and launches quiz assessment", async ({
    page,
  }) => {
    await page.goto("/dashboard/quizzes", { waitUntil: "domcontentloaded" });

    await expect(page).toHaveURL(/\/dashboard\/quizzes/);
    await expect(page.getByText("JavaScript Basics")).toBeVisible({
      timeout: 15_000,
    });
  });

  test("aptitude page renders category filters and topic list", async ({
    page,
  }) => {
    await page.goto("/aptitude", { waitUntil: "domcontentloaded" });

    await expect(page).toHaveURL(/\/aptitude/);
    await expect(page.getByText(/Campus Aptitude Prep/i)).toBeVisible({
      timeout: 20_000,
    });
    await expect(
      page.getByRole("button", { name: /quantitative/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /logical reasoning/i }),
    ).toBeVisible();
  });

  test("core subjects page renders subjects list", async ({ page }) => {
    await page.goto("/coresubjects", { waitUntil: "domcontentloaded" });

    await expect(page).toHaveURL(/\/coresubjects/);
    await expect(page.getByText(/Core CS Subjects/i)).toBeVisible({
      timeout: 20_000,
    });
    await expect(page.getByText(/Operating System/i)).toBeVisible();
    await expect(page.getByText(/Database Management System/i)).toBeVisible();
  });
});
