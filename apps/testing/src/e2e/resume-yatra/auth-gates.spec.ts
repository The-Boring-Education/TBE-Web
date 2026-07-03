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

test.describe("Resume Yatra auth and onboarding gate", () => {
  test("unauthenticated user cannot stay on builder (sent to login)", async ({
    page,
  }) => {
    await page.context().clearCookies();
    await mockAuthRefreshUnavailable(page);

    await page.goto("/builder", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/login/, { timeout: 35_000 });
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
