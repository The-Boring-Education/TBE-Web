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
  await page.route("**/auth/token", (route) =>
    route.fulfill({
      status: 401,
      contentType: "application/json",
      body: JSON.stringify({ status: false, message: "Unauthorized" }),
    }),
  );
  await page.route("**/api/proxy/user**", (route) =>
    route.fulfill({
      status: 401,
      contentType: "application/json",
      body: JSON.stringify({ status: false, message: "Unauthorized" }),
    }),
  );
};

test.describe("Tech Yatra auth and onboarding gate", () => {
  test("unauthenticated user cannot stay on dashboard (redirected to home)", async ({
    page,
  }) => {
    await page.context().clearCookies();
    await mockAuthRefreshUnavailable(page);

    // `ProtectedRoute` sends unauthenticated visitors to `/`. Warm that route first:
    // the URL only settles once the dev server has compiled it, and a cold compile
    // under parallel CI workers can outlast the assertion timeout.
    await page.goto("/", { waitUntil: "domcontentloaded" });

    await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(
      (url) => {
        const str = typeof url === "string" ? url : url.toString();
        const { pathname } = new URL(str);
        return pathname === "/" || pathname === "";
      },
      { timeout: 60_000 },
    );
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
      timeout: 30_000,
    });
    await expect(page).toHaveURL(/\/dashboard\/?$/, { timeout: 20_000 });
    await expect(page.getByRole("heading", { name: "Tech Yatra" })).toBeVisible(
      { timeout: 20_000 },
    );
  });
});
