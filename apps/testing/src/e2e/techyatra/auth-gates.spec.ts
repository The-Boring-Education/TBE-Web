import { expect, test } from "@playwright/test";

import {
  fullyOnboardedProductFieldsByApp,
  installOnboardingRedirectMocks,
  onboardingAppUrlPattern,
} from "../fixtures/onboarding-redirect";

const mockAuthRefreshUnavailable = async (
  page: import("@playwright/test").Page,
) => {
  await page.route("**/auth/refresh", (route) =>
    route.fulfill({
      status: 401,
      contentType: "application/json",
      body: JSON.stringify({ status: false, message: "No refresh token" }),
    }),
  );
};

test.describe("Tech Yatra auth and onboarding gate", () => {
  test("unauthenticated user cannot stay on dashboard (redirected to home)", async ({
    page,
  }) => {
    await page.context().clearCookies();
    await mockAuthRefreshUnavailable(page);

    await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/(\?.*)?$/, { timeout: 45_000 });
  });

  test("authenticated and product-onboarded user remains on dashboard", async ({
    page,
  }) => {
    await installOnboardingRedirectMocks(
      page,
      fullyOnboardedProductFieldsByApp.techyatra,
    );
    await page.goto("/dashboard", { waitUntil: "domcontentloaded" });

    await expect(page).not.toHaveURL(onboardingAppUrlPattern, {
      timeout: 45_000,
    });
    await expect(page).toHaveURL(/\/dashboard\/?$/, { timeout: 45_000 });
    await expect(page.getByRole("main")).toBeVisible({ timeout: 45_000 });
  });
});
