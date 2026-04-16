import type { Page } from "@playwright/test";

/** Must match [@tbe/auth AUTH_CONFIG.ACCESS_TOKEN_KEY](packages/auth/src/config.ts). */
const TBE_ACCESS_COOKIE = "tbe_access_token";

/**
 * Stable user id shared between JWT `sub` and `/api/proxy/user` payload
 * so `useProductOnboardingGate` query matches.
 */
export const ONBOARDING_GATE_E2E_USER = {
  id: "e2e-onboarding-gate-user",
  name: "Onboarding Gate User",
  email: "onboarding-gate@e2e.tbe",
  image: null as string | null,
  isOnboarded: true,
};

/**
 * Unsigned JWT shape sufficient for `decodeToken` in [@tbe/auth](packages/auth/src/token.ts)
 * (client does not verify signature).
 */
export function buildE2EAccessJwt(): string {
  const header = Buffer.from(
    JSON.stringify({ alg: "none", typ: "JWT" }),
  ).toString("base64url");
  const payload = Buffer.from(
    JSON.stringify({
      sub: ONBOARDING_GATE_E2E_USER.id,
      email: ONBOARDING_GATE_E2E_USER.email,
      name: ONBOARDING_GATE_E2E_USER.name,
      isOnboarded: ONBOARDING_GATE_E2E_USER.isOnboarded,
      exp: Math.floor(Date.now() / 1000) + 7200,
    }),
  ).toString("base64url");
  return `${header}.${payload}.e2e`;
}

/**
 * Sets cookie JWT + mocks user API for apps using `useProductOnboardingGate`.
 * `productFields` should include the nested flags the gate checks (e.g. `prepYatra.pyOnboarded`).
 *
 * Uses BOTH `context.addCookies()` AND `page.addInitScript()` for belt-and-suspenders reliability:
 * - `context.addCookies()` ensures the auth token is present in HTTP request headers from the very
 *   first navigation — required for apps with server-side middleware (e.g. dsayatra) that checks
 *   the cookie before serving protected routes.
 * - `page.addInitScript()` sets the cookie in `document.cookie` directly, ensuring it is available
 *   to client-side JavaScript (e.g. `AuthProvider.initializeAuth`) on the very first script execution.
 */
export async function installOnboardingRedirectMocks(
  page: Page,
  productFields: Record<string, unknown>,
): Promise<void> {
  const accessToken = buildE2EAccessJwt();

  await page.context().addCookies([
    {
      name: TBE_ACCESS_COOKIE,
      value: accessToken,
      domain: "localhost",
      path: "/",
      sameSite: "Lax",
      httpOnly: false,
      secure: false,
      expires: Math.floor(Date.now() / 1000) + 86400,
    },
    {
      name: TBE_ACCESS_COOKIE,
      value: accessToken,
      domain: "127.0.0.1",
      path: "/",
      sameSite: "Lax",
      httpOnly: false,
      secure: false,
      expires: Math.floor(Date.now() / 1000) + 86400,
    },
  ]);

  await page.addInitScript(
    ([key, token]) => {
      document.cookie = `${key}=${token}; path=/; max-age=86400; SameSite=Lax`;
    },
    [TBE_ACCESS_COOKIE, accessToken] as [string, string],
  );

  // The glob `**/api/proxy/user**` also matches `/api/proxy/user/dashboard`, so the profile mock
  // was served for dashboard requests and broke apps that load `/dashboard` (e.g. dsayatra in CI).
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

  await page.route(
    (url) => {
      const path = url.pathname.replace(/\/$/, "") || "/";
      return path === "/api/proxy/user";
    },
    (route) => {
      if (route.request().method() !== "GET") {
        return route.continue();
      }
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          status: true,
          data: {
            _id: ONBOARDING_GATE_E2E_USER.id,
            email: ONBOARDING_GATE_E2E_USER.email,
            name: ONBOARDING_GATE_E2E_USER.name,
            ...productFields,
          },
        }),
      });
    },
  );

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

  await page.route("**/api/proxy/feedback**", (route) =>
    route.fulfill({ status: 200, json: { status: true, data: null } }),
  );

  // Keep redirect tests stable even when onboarding preview server is slow/unavailable in CI.
  await page.route("http://localhost:5173/**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "text/html",
      body: "<!doctype html><html><body>Onboarding App</body></html>",
    }),
  );
  await page.route("http://127.0.0.1:5173/**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "text/html",
      body: "<!doctype html><html><body>Onboarding App</body></html>",
    }),
  );
  await page.route("http://[::1]:5173/**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "text/html",
      body: "<!doctype html><html><body>Onboarding App</body></html>",
    }),
  );
}

/** Matches onboarding app dev/preview (see apps/testing/playwright.config.ts `onboarding` port). */
export const onboardingAppUrlPattern =
  /http:\/\/(\[::1\]|127\.0\.0\.1|localhost):5173/;

/**
 * User payload fragments for `installOnboardingRedirectMocks` when the product gate
 * should treat onboarding as complete (user stays on the app).
 */
export const fullyOnboardedProductFieldsByApp = {
  "prep-yatra": { prepYatra: { pyOnboarded: true } },
  techyatra: { techYatra: { tyOnboarded: true } },
  dsayatra: { dsaYatra: { dyOnboarded: true } },
  oncampus: { oncampus: { onboardingCompleted: true } },
  "resume-yatra": { resumeYatra: { ryOnboarded: true } },
} as const;

export type AppKeyWithOnboardingGate =
  keyof typeof fullyOnboardedProductFieldsByApp;
