import { expect, test } from "@playwright/test";

import {
  installOnboardingRedirectMocks,
  ONBOARDING_GATE_E2E_USER,
  onboardingAppUrlPattern,
} from "../fixtures/onboarding-redirect";

test.describe("Tech Yatra → onboarding app redirect", () => {
  test.beforeEach(async ({ page }) => {
    await installOnboardingRedirectMocks(page, {
      techYatra: { tyOnboarded: false },
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
    expect(u.searchParams.get("productId")).toBe("tech-yatra");
    expect(u.searchParams.get("from")).toBe("techyatra");
    expect(u.searchParams.get("userId")).toBe(ONBOARDING_GATE_E2E_USER.id);
  });
});
