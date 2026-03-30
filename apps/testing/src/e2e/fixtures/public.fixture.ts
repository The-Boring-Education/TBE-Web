import { type Page, test as base } from "@playwright/test";

async function mockPublicAuthSession(page: Page) {
  await page.route("**/api/auth/session", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({}),
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

async function mockCommonPublicAPIs(page: Page) {
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

  await page.route("**/api/proxy/user**", (route) =>
    route.fulfill({ status: 200, json: { status: true, data: null } }),
  );
}

export const test = base.extend<{ publicPage: Page }>({
  publicPage: async ({ page }, use) => {
    await mockPublicAuthSession(page);
    await mockCommonPublicAPIs(page);

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

    await use(page);
  },
});

export { expect } from "@playwright/test";
