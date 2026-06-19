import type { Page } from "@playwright/test";

import { expect, test } from "../fixtures/public.fixture";

test.describe("Prep Yatra smoke flow", () => {
  const getJourneyCTA = (page: Page) =>
    page
      .locator("button, a", {
        hasText: /Start Your (Prep )?Journey|Get Started for Free/i,
      })
      .first();

  test("landing loads and journey CTA is visible", async ({
    publicPage: page,
  }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    await expect(getJourneyCTA(page)).toBeVisible();
  });

  test("user can navigate from landing to login", async ({
    publicPage: page,
  }) => {
    await page.goto("/");

    const journeyCTA = getJourneyCTA(page);
    await expect(journeyCTA).toBeVisible();
    await expect(journeyCTA).toBeEnabled();

    await journeyCTA.click();
    await expect(page).toHaveURL(/\/(login|auth)(\/|\?|$)/, {
      timeout: 30_000,
    });

    await expect(
      page.getByRole("heading", { name: "The Boring Education" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Continue with Google" }),
    ).toBeVisible();
  });

  test("login page renders core auth UI", async ({ publicPage: page }) => {
    await page.goto("/login");

    await expect(
      page.getByRole("heading", { name: "The Boring Education" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Continue with Google" }),
    ).toBeVisible();
  });

  test("pricing is accessible to unauthenticated users", async ({
    publicPage: page,
  }) => {
    await page.goto("/pricing");

    await expect(page).toHaveURL(/\/pricing(\/|\?|$)/, {
      timeout: 20_000,
    });
    await expect(
      page.getByRole("heading", { name: /One plan for everything/i }),
    ).toBeVisible();
  });
});
