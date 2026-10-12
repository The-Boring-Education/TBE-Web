import { expect, test } from "@playwright/test";

import { mockDsayatraDashboardApis } from "../fixtures/authenticated-dashboard-smoke";
import {
  fullyOnboardedProductFieldsByApp,
  installOnboardingRedirectMocks,
} from "../fixtures/onboarding-redirect";

/**
 * Regression: PENDING / unpaid payment must not break the dashboard (topics API 200 + freemium data).
 */
test.describe("DSA Yatra dashboard — pending payment (free tier)", () => {
  test("dashboard renders when topics API succeeds for unpaid user", async ({
    page,
  }) => {
    await installOnboardingRedirectMocks(
      page,
      fullyOnboardedProductFieldsByApp.dsayatra,
    );
    await mockDsayatraDashboardApis(page);

    await page.route("**/api/proxy/payment/checkstatus**", (route) => {
      if (route.request().method() !== "GET") {
        return route.continue();
      }
      return route.fulfill({
        status: 200,
        json: {
          status: false,
          message: "Payment not completed",
          data: { purchased: false },
        },
      });
    });

    await page.route("**/api/proxy/interview-prep/dsa-sheet**", (route) => {
      if (route.request().method() !== "GET") {
        return route.continue();
      }
      if (!route.request().url().includes("query=topics")) {
        return route.continue();
      }
      return route.fulfill({
        status: 200,
        json: {
          status: true,
          data: {
            topics: [
              {
                topic: "ARRAY",
                count: 10,
                solved: 0,
                accessibleCount: 3,
                accessibleSolved: 0,
              },
            ],
          },
        },
      });
    });

    await page.goto("/dashboard", { waitUntil: "domcontentloaded" });

    await expect(page).toHaveURL(/\/dashboard\/?$/);
    await expect(
      page.getByRole("heading", { name: /Welcome back,/ }),
    ).toBeVisible({ timeout: 25_000 });
  });
});
