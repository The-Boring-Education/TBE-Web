import { buildE2EAccessJwt } from "../fixtures/onboarding-redirect";
import { expect, test } from "../fixtures/platform.fixture";

/** [@tbe/auth AUTH_CONFIG.ACCESS_TOKEN_KEY](packages/auth/src/config.ts) */
const TBE_ACCESS_COOKIE = "tbe_access_token";

test.describe("Platform user dashboard gate", () => {
  test("unauthenticated visitor cannot stay on /user/dashboard (sent home)", async ({
    platformPage: page,
  }) => {
    await page.goto("/user/dashboard", { waitUntil: "domcontentloaded" });
    await page.waitForURL((url) => new URL(url).pathname === "/", {
      timeout: 20_000,
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
      },
    ]);
    await page.addInitScript(
      ([key, value]) => {
        document.cookie = `${key}=${value}; path=/; max-age=86400; SameSite=Lax`;
      },
      [TBE_ACCESS_COOKIE, token] as [string, string],
    );

    await page.goto("/user/dashboard", { waitUntil: "domcontentloaded" });

    await expect(page).toHaveURL(/\/user\/dashboard\/?$/);
    // Empty dashboard mock: copy stresses "no enrollments" path; enrolled mock would show "Learning Space"
    await expect(
      page.getByRole("heading", { name: "Leaderboard", exact: true }),
    ).toBeVisible({ timeout: 25_000 });
  });
});
