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
 */
export async function installOnboardingRedirectMocks(
  page: Page,
  productFields: Record<string, unknown>,
): Promise<void> {
  const accessToken = buildE2EAccessJwt();

  await page.addInitScript(
    ([key, token]) => {
      document.cookie = `${key}=${token}; path=/; max-age=86400; SameSite=Lax`;
    },
    [TBE_ACCESS_COOKIE, accessToken] as [string, string],
  );

  await page.route("**/api/proxy/user**", (route) => {
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
  });

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

/** Matches onboarding app dev/preview (see apps/testing/playwright.config.ts `onboarding` port). */
export const onboardingAppUrlPattern = /http:\/\/(127\.0\.0\.1|localhost):5173/;

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
