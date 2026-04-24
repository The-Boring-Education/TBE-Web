import type { Page } from "@playwright/test";

/**
 * Network stubs so authenticated app dashboards render their primary shell instead of
 * hanging on missing backends. Pair with a visible heading/assertion so missing React
 * providers (wrong context tree) fail the test instead of only checking the URL.
 */

export async function mockPrepYatraChallengesEmpty(page: Page): Promise<void> {
  await page.route("**/prepyatra/challenges**", (route) => {
    if (route.request().method() !== "GET") {
      return route.continue();
    }
    return route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ status: true, data: [] }),
    });
  });
}

export async function mockDsayatraDashboardApis(page: Page): Promise<void> {
  await page.route("**/api/proxy/interview-prep/dsa-sheet**", (route) => {
    if (route.request().method() !== "GET") {
      return route.continue();
    }
    return route.fulfill({
      status: 200,
      json: {
        status: true,
        data: { topics: [], questions: [] },
      },
    });
  });

  await page.route("**/api/proxy/user/dsayatra/progress**", (route) => {
    if (route.request().method() !== "GET") {
      return route.continue();
    }
    return route.fulfill({
      status: 200,
      json: {
        status: true,
        data: { completedQuestionIds: [], solvedToday: 0 },
      },
    });
  });

  await page.route("**/api/proxy/user/prepyatra/progress**", (route) => {
    if (route.request().method() !== "GET") {
      return route.continue();
    }
    return route.fulfill({
      status: 200,
      json: {
        status: true,
        data: {
          currentStreak: 0,
          longestStreak: 0,
          lastLoggedDate: "",
          totalLogs: 0,
          hasLoggedToday: false,
          recentLogs: 0,
          weeklyLogs: [],
        },
      },
    });
  });
}

export async function mockOnCampusDashboardApis(page: Page): Promise<void> {
  await page.route("**/api/proxy/user/interview-prep**", (route) => {
    if (route.request().method() !== "GET") {
      return route.continue();
    }
    return route.fulfill({
      status: 200,
      json: { status: true, data: [] },
    });
  });

  await page.route("**/api/proxy/quiz/performance/**", (route) => {
    if (route.request().method() !== "GET") {
      return route.continue();
    }
    return route.fulfill({
      status: 200,
      json: {
        status: true,
        data: {
          success: true,
          data: {
            totalAttempts: 0,
            totalQuizzes: 0,
            averageScore: 0,
            bestScore: 0,
            totalTimeSpent: 0,
            categoryBreakdown: [],
            recentAttempts: [],
          },
        },
      },
    });
  });
}
