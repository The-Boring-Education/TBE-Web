import { expect, test } from "@playwright/test";

import {
  fullyOnboardedProductFieldsByApp,
  installOnboardingRedirectMocks,
  onboardingAppUrlPattern,
} from "../fixtures/onboarding-redirect";

test.describe("Tech Yatra auth and onboarding gate", () => {
  test("unauthenticated user cannot stay on dashboard (redirected to home)", async ({
    page,
  }) => {
    await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
    await page.waitForURL((url) => new URL(url).pathname === "/", {
      timeout: 20_000,
    });
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
      timeout: 15_000,
    });
    await expect(
      page.getByRole("heading", { name: "Tech Yatra", exact: true }),
    ).toBeVisible({ timeout: 15_000 });
  });
});
