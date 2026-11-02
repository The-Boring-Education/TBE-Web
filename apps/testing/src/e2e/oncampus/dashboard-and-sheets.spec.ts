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

    // Mock published interview sheets catalog, specific sheet topic, and aptitude topics
    await page.route("**/api/proxy/interview-prep**", (route) => {
      const url = route.request().url();
      if (route.request().method() !== "GET") {
        return route.continue();
      }
      if (url.includes("user/interview-prep")) {
        return route.continue();
      }
      if (url.includes("/core-subjects")) {
        return route.fulfill({
          status: 200,
          json: {
            status: true,
            data: [],
          },
        });
      }
      if (url.includes("roadmap=APTITUDE")) {
        return route.fulfill({
          status: 200,
          json: {
            status: true,
            data: [
              {
                slug: "percentages",
                name: "Percentages",
                questionCount: 20,
                category: "QUANTITATIVE",
                isLocked: false,
              },
              {
                slug: "blood-relations",
                name: "Blood Relations",
                questionCount: 15,
                category: "LOGICAL",
                isLocked: false,
              },
            ],
          },
        });
      }

      const sheetObj = {
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
      };

      if (url.includes("slug=") || url.includes("topic=")) {
        return route.fulfill({
          status: 200,
          json: {
            status: true,
            data: sheetObj,
          },
        });
      }

      return route.fulfill({
        status: 200,
        json: {
          status: true,
          data: [sheetObj],
        },
      });
    });

    // Mock quiz categories and quiz performance
    await page.route("**/api/proxy/quiz**", (route) => {
      const url = route.request().url();
      if (url.includes("/performance")) {
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
      }
      return route.fulfill({
        status: 200,
        json: {
          status: true,
          success: true,
          data: [
            {
              _id: "quiz-cat-1",
              categoryName: "JavaScript Basics",
              categoryDescription: "Test your JS fundamentals",
              quizzesCount: 10,
            },
            {
              _id: "quiz-cat-2",
              categoryName: "React Mastery",
              categoryDescription: "Test your React fundamentals",
              quizzesCount: 15,
            },
          ],
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

    await Promise.all([
      page.waitForURL(/\/interview-sheets\?topic=frontend-system-design/, {
        timeout: 15_000,
      }),
      resumeBtn.click(),
    ]);
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
      timeout: 20_000,
    });
  });

  test("quizzes page renders catalog and launches quiz assessment", async ({
    page,
  }) => {
    await page.goto("/dashboard/quizzes", { waitUntil: "domcontentloaded" });

    await expect(page).toHaveURL(/\/dashboard\/quizzes/);
    await expect(page.getByText("JavaScript Basics").first()).toBeVisible({
      timeout: 15_000,
    });
  });

  test("aptitude page renders category filters and topic list", async ({
    page,
  }) => {
    await page.goto("/aptitude", { waitUntil: "domcontentloaded" });

    await expect(page).toHaveURL(/\/aptitude/);
    await expect(page.getByRole("heading", { name: /Aptitude/i })).toBeVisible({
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
    await expect(page.getByText("Core Subjects").first()).toBeVisible({
      timeout: 20_000,
    });
    await expect(page.getByText("Operating System").first()).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByText("DBMS").first()).toBeVisible({
      timeout: 15_000,
    });
  });
});
