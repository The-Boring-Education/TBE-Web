import { type Page, test as base } from "@playwright/test";

export interface MockUser {
  id: string;
  name: string;
  email: string;
  image: string | null;
  isOnboarded: boolean;
}

export const TEST_USER: MockUser = {
  id: "test-user-id-123",
  name: "Test User",
  email: "test@theboringeducation.com",
  image: null,
  isOnboarded: true,
};

/**
 * Mock NextAuth session so `useSession()` returns an authenticated user.
 * Also mocks common endpoints that fire on every authenticated page load.
 */
async function mockAuthSession(page: Page, user: MockUser = TEST_USER) {
  await page.route("**/api/auth/session", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        user,
        expires: new Date(Date.now() + 86_400_000).toISOString(),
      }),
    }),
  );

  await page.route("**/api/auth/csrf", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ csrfToken: "mock-csrf-token" }),
    }),
  );

  await page.route("**/api/auth/providers", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        google: {
          id: "google",
          name: "Google",
          type: "oauth",
          signinUrl: "/api/auth/signin/google",
          callbackUrl: "/api/auth/callback/google",
        },
      }),
    }),
  );
}

/**
 * Mock common background API calls that fire on most authenticated pages.
 */
async function mockCommonAPIs(page: Page) {
  await page.route("**/api/proxy/notification**", (route) =>
    route.fulfill({ status: 200, json: { status: true, data: [] } }),
  );

  await page.route("**/api/proxy/gamification**", (route) =>
    route.fulfill({ status: 200, json: { status: true, data: null } }),
  );

  await page.route("**/api/proxy/leaderboard**", (route) =>
    route.fulfill({ status: 200, json: { status: true, data: [] } }),
  );

  await page.route("**/api/proxy/user/dashboard**", (route) =>
    route.fulfill({
      status: 200,
      json: {
        status: true,
        data: {
          enrolledCourses: [],
          enrolledProjects: [],
          enrolledSheets: [],
          playlists: [],
        },
      },
    }),
  );

  await page.route("**/api/proxy/feedback**", (route) =>
    route.fulfill({ status: 200, json: { status: true, data: null } }),
  );
}

/**
 * Playwright fixture providing an authenticated page.
 * Usage: `test("my test", async ({ authedPage }) => { ... })`
 */
export const test = base.extend<{ authedPage: Page }>({
  authedPage: async ({ page }, use) => {
    await mockAuthSession(page);
    await mockCommonAPIs(page);
    await use(page);
  },
});

export { expect } from "@playwright/test";
