import { expect, test } from "@playwright/test";

import { mockPrepYatraChallengesEmpty } from "../fixtures/authenticated-dashboard-smoke";
import {
  fullyOnboardedProductFieldsByApp,
  installOnboardingRedirectMocks,
  onboardingAppUrlPattern,
} from "../fixtures/onboarding-redirect";

test.describe("Prep Yatra auth and onboarding gate", () => {
  test("unauthenticated user cannot stay on dashboard (sent to login)", async ({
    page,
  }) => {
    await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/login/, { timeout: 20_000 });
  });

  test("authenticated and product-onboarded user remains on dashboard (not sent to onboarding app)", async ({
    page,
  }) => {
    await installOnboardingRedirectMocks(
      page,
      fullyOnboardedProductFieldsByApp["prep-yatra"],
    );

    // Empty challenges → ChallengeSection + CreateChallengeModal (needs PrepYatraGamificationProvider).
    await mockPrepYatraChallengesEmpty(page);

    await page.goto("/dashboard", { waitUntil: "domcontentloaded" });

    await expect(page).not.toHaveURL(onboardingAppUrlPattern, {
      timeout: 15_000,
    });
    await expect(page).toHaveURL(/\/dashboard\/?$/);

    await expect(
      page.getByRole("button", { name: /open sidebar|close sidebar/i }),
    ).toBeVisible({ timeout: 20_000 });
  });
});
