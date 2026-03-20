import { type Page, test as base } from "@playwright/test";

import { mockCourses, mockInterviewSheets, mockProjects } from "./api-mocks";

/**
 * Intercept the platform's proxy API routes and return mock data.
 * This lets us test UI flows without a running API server.
 */
async function mockPlatformAPIs(page: Page) {
  await page.route("**/api/proxy/shiksha", (route) => {
    if (route.request().method() === "GET") {
      return route.fulfill({ status: 200, json: mockCourses });
    }
    return route.continue();
  });

  await page.route("**/api/proxy/interview-prep", (route) => {
    if (route.request().method() === "GET") {
      return route.fulfill({ status: 200, json: mockInterviewSheets });
    }
    return route.continue();
  });

  await page.route("**/api/proxy/projects", (route) => {
    if (route.request().method() === "GET") {
      return route.fulfill({ status: 200, json: mockProjects });
    }
    return route.continue();
  });

  // Mock notification endpoint to avoid errors on pages that load it
  await page.route("**/api/proxy/notification**", (route) =>
    route.fulfill({ status: 200, json: { status: true, data: [] } }),
  );

  // Mock gamification endpoint
  await page.route("**/api/proxy/gamification**", (route) =>
    route.fulfill({ status: 200, json: { status: true, data: null } }),
  );

  // Mock user-related endpoints for unauthenticated state
  await page.route("**/api/proxy/user**", (route) =>
    route.fulfill({ status: 200, json: { status: true, data: null } }),
  );

  // Mock leaderboard
  await page.route("**/api/proxy/leaderboard**", (route) =>
    route.fulfill({ status: 200, json: { status: true, data: [] } }),
  );
}

export const test = base.extend<{ platformPage: Page }>({
  platformPage: async ({ page, baseURL }, use) => {
    // Wait for the server to be ready before each test
    // We use a retry loop because initial startup can be slow in CI
    const MAX_RETRIES = 5;
    for (let i = 0; i < MAX_RETRIES; i++) {
      try {
        await page.goto("/", { waitUntil: "commit", timeout: 10_000 });
        break;
      } catch (e) {
        if (i === MAX_RETRIES - 1) throw e;
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }
    await mockPlatformAPIs(page);
    await use(page);
  },
});

export { expect } from "@playwright/test";
