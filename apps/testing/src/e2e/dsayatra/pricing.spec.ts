import { expect, test } from "../fixtures/public.fixture";

test.describe("DSA Yatra pricing page", () => {
  test("pricing page loads successfully", async ({ publicPage: page }) => {
    // Mock subscription plans API
    await page.route("**/api/proxy/subscription-plans**", (route) =>
      route.fulfill({
        status: 200,
        json: {
          status: true,
          data: [
            {
              productType: "DSA_YATRA",
              planKey: "lifetime",
              displayName: "Lifetime Access",
              description: "One-time payment for permanent access",
              amountInr: 499,
              originalAmountInr: 1999,
              accessType: "ONE_TIME",
              durationMonths: 0,
              features: [
                "Complete DSA question bank",
                "Topic-wise practice sheets",
                "Progress tracking",
              ],
              isPopular: true,
              isActive: true,
              sortOrder: 1,
            },
          ],
        },
      }),
    );

    const response = await page.goto("/pricing");
    expect(response?.status()).toBe(200);

    // Verify hero section
    await expect(
      page.getByRole("heading", { name: /invest in your/i }),
    ).toBeVisible();
  });

  test("pricing page displays plan cards from API", async ({
    publicPage: page,
  }) => {
    await page.route("**/api/proxy/subscription-plans**", (route) =>
      route.fulfill({
        status: 200,
        json: {
          status: true,
          data: [
            {
              productType: "DSA_YATRA",
              planKey: "lifetime",
              displayName: "Lifetime Access",
              description: "One-time payment",
              amountInr: 499,
              originalAmountInr: 1999,
              accessType: "ONE_TIME",
              durationMonths: 0,
              features: ["Complete DSA question bank", "Lifetime access"],
              isPopular: true,
              isActive: true,
              sortOrder: 1,
            },
          ],
        },
      }),
    );

    await page.goto("/pricing");

    // Verify plan card content
    await expect(page.getByText("₹499")).toBeVisible();
    await expect(page.getByText("Complete DSA question bank")).toBeVisible();
  });

  test("pricing page shows error state on API failure", async ({
    publicPage: page,
  }) => {
    await page.route("**/api/proxy/subscription-plans**", (route) =>
      route.fulfill({
        status: 500,
        json: { status: false, message: "Internal server error" },
      }),
    );

    await page.goto("/pricing");

    // Should show error message
    await expect(page.getByText(/try again/i)).toBeVisible();
  });

  test("pricing page shows FAQ section", async ({ publicPage: page }) => {
    await page.route("**/api/proxy/subscription-plans**", (route) =>
      route.fulfill({
        status: 200,
        json: {
          status: true,
          data: [
            {
              productType: "DSA_YATRA",
              planKey: "lifetime",
              displayName: "Lifetime Access",
              amountInr: 499,
              originalAmountInr: 1999,
              features: ["All content"],
              isPopular: true,
              isActive: true,
              sortOrder: 1,
            },
          ],
        },
      }),
    );

    await page.goto("/pricing");

    // Verify FAQ section exists
    await expect(
      page.getByRole("heading", { name: /frequently asked questions/i }),
    ).toBeVisible();
    await expect(page.getByText(/is this a one-time payment/i)).toBeVisible();
  });
});
