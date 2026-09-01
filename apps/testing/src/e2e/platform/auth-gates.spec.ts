import { buildE2EAccessJwt } from "../fixtures/onboarding-redirect";
import { expect, test } from "../fixtures/platform.fixture";

/** [@tbe/auth AUTH_CONFIG.ACCESS_TOKEN_KEY](packages/auth/src/config.ts) */
const TBE_ACCESS_COOKIE = "tbe_access_token";

test.describe("Platform user dashboard gate", () => {
  test("unauthenticated visitor cannot stay on /user/dashboard (sent home)", async ({
    platformPage: page,
  }) => {
    await page.context().clearCookies();
    await page.route("**/api/proxy/auth/refresh", (route) =>
      route.fulfill({
        status: 401,
        json: { status: false, message: "No refresh token" },
      }),
    );
    await page.goto("/user/dashboard", { waitUntil: "commit" });
    await page.waitForURL((url) => new URL(url).pathname === "/", {
      timeout: 30_000,
    });
  });

  test("authenticated user can load /user/dashboard", async ({
    platformPage: page,
  }) => {
    const token = buildE2EAccessJwt();
    await page.context().addCookies([
      {
        name: TBE_ACCESS_COOKIE,
        value: token,
        domain: "localhost",
        path: "/",
        sameSite: "Lax",
        httpOnly: false,
        secure: false,
        expires: Math.floor(Date.now() / 1000) + 86400,
      },
      {
        name: TBE_ACCESS_COOKIE,
        value: token,
        domain: "127.0.0.1",
        path: "/",
        sameSite: "Lax",
        httpOnly: false,
        secure: false,
        expires: Math.floor(Date.now() / 1000) + 86400,
      },
    ]);

    await page.addInitScript(
      ([key, value]) => {
        document.cookie = `${key}=${value}; path=/; max-age=86400; SameSite=Lax`;
      },
      [TBE_ACCESS_COOKIE, token] as [string, string],
    );

    await page.route("**/api/proxy/auth/refresh", (route) =>
      route.fulfill({
        status: 200,
        json: { status: true, data: { token } },
      }),
    );

    await page.route("**/api/proxy/user**", (route) =>
      route.fulfill({
        status: 200,
        json: {
          status: true,
          data: {
            enrolledCourses: [],
            enrolledProjects: [],
            enrolledSheets: [],
            enrolledPlaylists: [],
          },
        },
      }),
    );

    await page.route("**/api/proxy/notification**", (route) =>
      route.fulfill({ status: 200, json: { status: true, data: [] } }),
    );

    await page.goto("/user/dashboard", { waitUntil: "domcontentloaded" });

    await expect(page).toHaveURL(/\/user\/dashboard\/?$/);
    // Empty dashboard mock: copy stresses "no enrollments" path; enrolled mock would show "Learning Space"
    await expect(
      page.getByRole("heading", { name: "Leaderboard", exact: true }),
    ).toBeVisible({ timeout: 30_000 });
  });
});
