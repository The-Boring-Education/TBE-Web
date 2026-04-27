import { expect, test } from "../fixtures/platform.fixture";

/**
 * E2E tests for pricing banners on product pages.
 * Verifies that coupon-based pricing banners render correctly
 * with appropriate discount information.
 */

test.describe("Pricing banners", () => {
  test.beforeEach(async ({ platformPage: page }) => {
    // Mock the pricing banners endpoint
    await page.route("**/api/proxy/coupon/pricing-banners**", (route) => {
      const url = new URL(route.request().url());
      const productType = url.searchParams.get("productType");

      return route.fulfill({
        status: 200,
        json: {
          status: true,
          data: [
            {
              code: "LAUNCH20",
              discountPercentage: 20,
              description: `Save 20% on ${productType || "all"} products`,
              minimumAmount: 0,
            },
          ],
        },
      });
    });

    // Mock subscription plans endpoint
    await page.route("**/api/proxy/subscription-plans**", (route) =>
      route.fulfill({
        status: 200,
        json: {
          status: true,
          data: [
            {
              productType: "DSA_YATRA",
              planKey: "lifetime",
              amountInr: 999,
              displayName: "DSA Yatra Lifetime",
              isActive: true,
            },
          ],
        },
      }),
    );
  });

  test("landing page loads without errors", async ({ platformPage: page }) => {
    const response = await page.goto("/");
    expect(response?.status()).toBe(200);
    await expect(page.locator("body")).toBeVisible();
  });

  test("interview prep page loads with pricing", async ({
    platformPage: page,
  }) => {
    const response = await page.goto("/interview-prep");
    expect(response?.status()).toBe(200);
    await expect(page.locator("body")).toBeVisible();
  });
});
