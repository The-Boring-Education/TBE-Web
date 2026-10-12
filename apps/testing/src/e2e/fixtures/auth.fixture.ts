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
  const header = Buffer.from(
    JSON.stringify({ alg: "none", typ: "JWT" }),
  ).toString("base64url");
  const payload = Buffer.from(
    JSON.stringify({
      sub: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      isOnboarded: user.isOnboarded,
      exp: Math.floor(Date.now() / 1000) + 86_400,
    }),
  ).toString("base64url");
  const accessToken = [header, payload, "e2e"].join(".");

  await page.context().addCookies([
    {
      name: "tbe_access_token",
      value: accessToken,
      url: "http://localhost:3000",
    },
  ]);
  await page.addInitScript(
    ([key, token]) => {
      document.cookie =
        key + "=" + token + "; path=/; max-age=86400; SameSite=Lax";
    },
    ["tbe_access_token", accessToken],
  );

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
    route.fulfill({
      status: 200,
      json: { status: true, data: { entries: [] } },
    }),
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
