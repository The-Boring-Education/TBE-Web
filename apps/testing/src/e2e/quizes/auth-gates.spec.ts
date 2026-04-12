import { expect, test } from "@playwright/test";

import { buildE2EAccessJwt } from "../fixtures/onboarding-redirect";

/** [@tbe/auth AUTH_CONFIG.ACCESS_TOKEN_KEY](packages/auth/src/config.ts) */
const TBE_ACCESS_COOKIE = "tbe_access_token";

test.describe("Quizes auth gate", () => {
  test("unauthenticated user cannot stay on dashboard (sent to login)", async ({
    page,
  }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.context().clearCookies();
    await page.evaluate(() => {
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch {
        /* ignore */
      }
    });
    await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/login/, { timeout: 20_000 });
  });

  test("authenticated user with quiz onboarding complete can load dashboard", async ({
    page,
  }) => {
    const token = buildE2EAccessJwt();
    await page.addInitScript(
      ([key, value]) => {
        document.cookie = `${key}=${value}; path=/; max-age=86400; SameSite=Lax`;
      },
      [TBE_ACCESS_COOKIE, token] as [string, string],
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
            _id: "e2e-onboarding-gate-user",
            isOnboarded: true,
            quiz: { onboarded: true },
          },
        }),
      });
    });

    await page.route("**/api/proxy/gamification**", (route) =>
      route.fulfill({ status: 200, json: { status: true, data: null } }),
    );

    await page.route("**/api/proxy/notification**", (route) =>
      route.fulfill({ status: 200, json: { status: true, data: [] } }),
    );

    // Quiz app calls the central API base URL for categories (not the Next proxy).
    await page.route(
      (url) => {
        try {
          const u = new URL(url);
          return (
            u.pathname.endsWith("/quiz") || u.pathname.endsWith("/api/v1/quiz")
          );
        } catch {
          return false;
        }
      },
      async (route) => {
        if (route.request().method() !== "GET") {
          return route.continue();
        }
        return route.fulfill({
          status: 200,
          json: { success: true, data: [] },
        });
      },
    );

    await page.route(
      (url) => {
        try {
          const u = new URL(url);
          return u.pathname.includes("/gamification");
        } catch {
          return false;
        }
      },
      async (route) => {
        if (route.request().method() !== "GET") {
          return route.continue();
        }
        return route.fulfill({
          status: 200,
          json: { success: true, data: { points: 0 } },
        });
      },
    );

    await page.goto("/dashboard", { waitUntil: "domcontentloaded" });

    await expect(page).toHaveURL(/\/dashboard\/?$/);
    await expect(
      page.getByRole("heading", {
        name: /Welcome back,/,
      }),
    ).toBeVisible({ timeout: 25_000 });
  });
});
