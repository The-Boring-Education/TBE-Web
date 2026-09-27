import type { Page, Route } from "@playwright/test";

import { buildE2EAccessJwt } from "../fixtures/onboarding-redirect";
import { expect, test } from "../fixtures/platform.fixture";

/** [@tbe/auth AUTH_CONFIG.ACCESS_TOKEN_KEY](packages/auth/src/config.ts) */
const TBE_ACCESS_COOKIE = "tbe_access_token";

const boardFor = (type: string) => ({
  type,
  periodKey: type === "DAILY" ? "2026-09-24" : "2026-W39",
  resetsAt: new Date(Date.now() + 36 * 3_600_000).toISOString(),
  totalLearners: 2,
  entries: [
    { rank: 1, userId: "u1", displayName: `${type} Leader`, score: 120 },
    { rank: 2, userId: "u2", displayName: "Runner Up", score: 90 },
  ],
  viewer: {
    rank: 7,
    score: 40,
    nextTarget: { displayName: "Sixth Learner", gap: 11, rank: 6 },
  },
});

/** Registered after the fixture's catch-all mocks, so these take precedence. */
const mockLeaderboardApis = async (page: Page) => {
  let visible = true;

  await page.route("**/api/proxy/leaderboard**", (route: Route) => {
    const url = new URL(route.request().url());
    if (url.pathname.endsWith("/leaderboard/me")) {
      return route.fulfill({
        json: {
          status: true,
          data: {
            standings: { WEEKLY: { rank: 7, score: 40, nextTarget: null } },
            badges: { WEEKLY: 1, MONTHLY: 0 },
            preferences: { visible, emails: true, excluded: false },
          },
        },
      });
    }
    if (url.pathname.endsWith("/leaderboard/champions")) {
      return route.fulfill({ json: { status: true, data: null } });
    }
    const type = url.searchParams.get("type") ?? "WEEKLY";
    return route.fulfill({ json: { status: true, data: boardFor(type) } });
  });

  await page.route("**/api/proxy/user/leaderboard-preferences**", (route) => {
    if (route.request().method() === "PATCH") {
      visible = (route.request().postDataJSON() as { visible?: boolean })
        .visible ?? visible;
    }
    return route.fulfill({
      json: {
        status: true,
        data: { visible, emails: true, excluded: false },
      },
    });
  });
};

const signIn = async (page: Page) => {
  const token = buildE2EAccessJwt();
  await page.addInitScript(
    ([key, value]) => {
      document.cookie = `${key}=${value}; path=/; max-age=86400; SameSite=Lax`;
    },
    [TBE_ACCESS_COOKIE, token] as [string, string],
  );
};

test.describe("Leaderboard", () => {
  test("dashboard card shows the board, the learner's rank and next target", async ({
    platformPage: page,
  }) => {
    await mockLeaderboardApis(page);
    await signIn(page);

    await page.goto("/user/dashboard", { waitUntil: "domcontentloaded" });

    await expect(
      page.getByRole("heading", { name: "Leaderboard", exact: true }),
    ).toBeVisible({ timeout: 25_000 });
    await expect(page.getByText("WEEKLY Leader")).toBeVisible();
    await expect(page.getByText("#7", { exact: true })).toBeVisible();
    // The navbar RankChip shows the same weekly rank everywhere.
    await expect(
      page.getByRole("link", { name: "Leaderboard: #7 this week" }).first(),
    ).toBeVisible();
    await expect(page.getByText(/11 pts/)).toBeVisible();
    await expect(page.getByText(/Resets in/)).toBeVisible();
  });

  test("switching tabs loads that Period's board", async ({
    platformPage: page,
  }) => {
    await mockLeaderboardApis(page);
    await signIn(page);
    await page.goto("/user/dashboard", { waitUntil: "domcontentloaded" });

    await expect(page.getByText("WEEKLY Leader")).toBeVisible({
      timeout: 25_000,
    });
    await page.getByRole("tab", { name: "Daily" }).click();
    await expect(page.getByText("DAILY Leader")).toBeVisible();
  });

  test("full leaderboard page loads from the dashboard link", async ({
    platformPage: page,
  }) => {
    await mockLeaderboardApis(page);
    await signIn(page);
    await page.goto("/user/dashboard", { waitUntil: "domcontentloaded" });

    await page
      .getByRole("link", { name: /View full leaderboard/ })
      .click({ timeout: 25_000 });
    await expect(page).toHaveURL(/\/leaderboard\/?$/);
    // First hit compiles the page in `next dev`.
    await expect(
      page.getByRole("heading", { name: "TBE Leaderboard" }),
    ).toBeVisible({ timeout: 25_000 });
  });

  test("visitors are sent home from the leaderboard page", async ({
    platformPage: page,
  }) => {
    await page.goto("/leaderboard", { waitUntil: "domcontentloaded" });
    await page.waitForURL((url) => new URL(url).pathname === "/", {
      timeout: 20_000,
    });
  });

  test("Leaderboard Visibility toggle persists across reloads", async ({
    platformPage: page,
  }) => {
    await mockLeaderboardApis(page);
    await signIn(page);
    await page.goto("/user/profile", { waitUntil: "domcontentloaded" });

    const toggle = page.getByLabel(/Show me on leaderboards/);
    await expect(toggle).toBeChecked({ timeout: 25_000 });
    await toggle.click();
    await expect(toggle).not.toBeChecked();

    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page.getByLabel(/Show me on leaderboards/)).not.toBeChecked({
      timeout: 25_000,
    });
  });
});
