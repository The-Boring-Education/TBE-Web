import { expect, test } from "@playwright/test";

import {
  fullyOnboardedProductFieldsByApp,
  installOnboardingRedirectMocks,
  onboardingAppUrlPattern,
} from "../fixtures/onboarding-redirect";

test.describe("Resume Yatra auth and onboarding gate", () => {
  test("unauthenticated user cannot stay on builder (sent to login)", async ({
    page,
  }) => {
    await page.goto("/builder", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/login/, { timeout: 20_000 });
  });

  test("authenticated and product-onboarded user remains on builder", async ({
    page,
  }) => {
    await installOnboardingRedirectMocks(
      page,
      fullyOnboardedProductFieldsByApp["resume-yatra"],
    );
    await page.goto("/builder", { waitUntil: "domcontentloaded" });

    await expect(page).not.toHaveURL(onboardingAppUrlPattern, {
      timeout: 15_000,
    });
    await expect(page).toHaveURL(/\/builder\/?$/);

    await expect(
      page.getByRole("heading", {
        name: "Let's Build Your Perfect Resume",
      }),
    ).toBeVisible({ timeout: 25_000 });
  });
});
