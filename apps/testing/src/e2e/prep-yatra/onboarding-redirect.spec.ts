import { expect, test } from "@playwright/test";

import {
  installOnboardingRedirectMocks,
  ONBOARDING_GATE_E2E_USER,
  onboardingAppUrlPattern,
} from "../fixtures/onboarding-redirect";

test.describe("Prep Yatra → onboarding app redirect", () => {
  test.beforeEach(async ({ page }) => {
    await installOnboardingRedirectMocks(page, {
      prepYatra: { pyOnboarded: false },
    });
  });

  test("redirects authenticated user with incomplete product onboarding to onboarding app", async ({
    page,
  }) => {
    await page.goto("/dashboard", {
      waitUntil: "domcontentloaded",
    });

    await expect(page).toHaveURL(onboardingAppUrlPattern, {
      timeout: 45_000,
    });

    const u = new URL(page.url());
    expect(u.searchParams.get("productId")).toBe("prepyatra");
    expect(u.searchParams.get("from")).toBe("prepyatra");
    expect(u.searchParams.get("userId")).toBe(ONBOARDING_GATE_E2E_USER.id);
    expect(u.searchParams.get("redirect")).toContain("/dashboard");
  });
});
