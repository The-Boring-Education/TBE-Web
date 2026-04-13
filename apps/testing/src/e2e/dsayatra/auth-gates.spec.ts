import { expect, test } from "@playwright/test";

import { mockDsayatraDashboardApis } from "../fixtures/authenticated-dashboard-smoke";
import {
  fullyOnboardedProductFieldsByApp,
  installOnboardingRedirectMocks,
  onboardingAppUrlPattern,
} from "../fixtures/onboarding-redirect";

test.describe("DSA Yatra auth and onboarding gate", () => {
  test("unauthenticated user cannot stay on dashboard (sent to login)", async ({
    page,
  }) => {
    await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/login/, { timeout: 20_000 });
  });

  test("authenticated and product-onboarded user remains on dashboard", async ({
    page,
  }) => {
    await installOnboardingRedirectMocks(
      page,
      fullyOnboardedProductFieldsByApp.dsayatra,
    );
    await mockDsayatraDashboardApis(page);

    await page.goto("/dashboard", { waitUntil: "domcontentloaded" });

    await expect(page).not.toHaveURL(onboardingAppUrlPattern, {
      timeout: 15_000,
    });
    await expect(page).toHaveURL(/\/dashboard\/?$/);

    await expect(
      page.getByRole("heading", { name: /Welcome back,/ }),
    ).toBeVisible({ timeout: 25_000 });
  });
});
