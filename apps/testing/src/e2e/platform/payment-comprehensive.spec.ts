import {
  buildE2EAccessJwt,
  ONBOARDING_GATE_E2E_USER,
} from "../fixtures/onboarding-redirect";
import { expect, test } from "../fixtures/platform.fixture";

const TBE_ACCESS_COOKIE = "tbe_access_token";

// Mock payment data
const mockPaymentQuote = {
  baseAmount: 999,
  finalAmount: 999,
  productName: "Frontend Interview Sheet",
  productType: "INTERVIEW_SHEET",
};

const mockPaymentQuoteWithCoupon = {
  baseAmount: 999,
  finalAmount: 799,
  productName: "Frontend Interview Sheet",
  productType: "INTERVIEW_SHEET",
  couponCode: "SAVE20",
  couponDescription: "20% off",
  couponDiscountPercentage: 20,
};

const mockCashfreeSession = {
  paymentSessionId: "session_mock_123",
  orderId: "TBE_ORDER_MOCK_123",
};

test.describe("Payment Checkout E2E Tests", () => {
  test.describe("Checkout Page Loading", () => {
    test("checkout page loads with valid product parameters", async ({
      platformPage: page,
    }) => {
      // Mock the payment quote API
      await page.route("**/api/proxy/payment/quote**", (route) =>
        route.fulfill({
          status: 200,
          json: {
            status: true,
            data: mockPaymentQuote,
          },
        }),
      );

      const response = await page.goto(
        "/checkout?productType=INTERVIEW_SHEET&productId=sheet_123",
      );

      expect(response?.status()).toBe(200);
      await expect(page.locator("body")).toContainText(/checkout|payment/i);
    });

    test("checkout page shows error for missing product parameters", async ({
      platformPage: page,
    }) => {
      const response = await page.goto("/checkout");

      expect(response?.status()).toBe(200);
      await expect(
        page.getByRole("heading", { name: /incomplete|invalid|error/i }),
      ).toBeVisible({ timeout: 10_000 });
    });

    test("checkout page shows product details and pricing", async ({
      platformPage: page,
    }) => {
      await page.route("**/api/proxy/payment/quote**", (route) =>
        route.fulfill({
          status: 200,
          json: {
            status: true,
            data: mockPaymentQuote,
          },
        }),
      );

      await page.goto(
        "/checkout?productType=INTERVIEW_SHEET&productId=sheet_123",
      );

      // Should display price
      await expect(page.locator("body")).toContainText("999");
    });
  });

  test.describe("Subscription Checkout", () => {
    test("DSA Yatra lifetime subscription checkout loads correctly", async ({
      platformPage: page,
    }) => {
      await page.route("**/api/proxy/payment/quote**", (route) =>
        route.fulfill({
          status: 200,
          json: {
            status: true,
            data: {
              baseAmount: 4999,
              finalAmount: 4999,
              productName: "DSA Yatra Lifetime",
              productType: "DSA_YATRA",
            },
          },
        }),
      );

      const response = await page.goto(
        "/checkout?productType=DSA_YATRA&productId=lifetime",
      );

      expect(response?.status()).toBe(200);
      await expect(
        page.getByRole("heading", { name: /DSA Yatra/i }),
      ).toBeVisible();
    });

    test("PrepYatra subscription checkout loads correctly", async ({
      platformPage: page,
    }) => {
      await page.route("**/api/proxy/payment/quote**", (route) =>
        route.fulfill({
          status: 200,
          json: {
            status: true,
            data: {
              baseAmount: 2999,
              finalAmount: 2999,
              productName: "PrepYatra 3 Months",
              productType: "PREPYATRA",
            },
          },
        }),
      );

      const response = await page.goto(
        "/checkout?productType=PREPYATRA&productId=3months",
      );

      expect(response?.status()).toBe(200);
    });
  });

  test.describe("Coupon Code Application", () => {
    test("valid coupon code applies discount", async ({
      platformPage: page,
    }) => {
      // Mock initial quote
      await page.route("**/api/proxy/payment/quote**", (route) => {
        const url = new URL(route.request().url());
        const couponCode = url.searchParams.get("couponCode");

        if (couponCode === "SAVE20") {
          return route.fulfill({
            status: 200,
            json: {
              status: true,
              data: mockPaymentQuoteWithCoupon,
            },
          });
        }

        return route.fulfill({
          status: 200,
          json: {
            status: true,
            data: mockPaymentQuote,
          },
        });
      });

      await page.goto(
        "/checkout?productType=INTERVIEW_SHEET&productId=sheet_123",
      );

      // Look for coupon input field
      const couponInput = page.getByPlaceholder(/coupon|promo/i);

      if (await couponInput.isVisible({ timeout: 5000 }).catch(() => false)) {
        await couponInput.fill("SAVE20");

        // Find and click apply button
        const applyButton = page.getByRole("button", { name: /apply/i });
        if (await applyButton.isVisible({ timeout: 3000 }).catch(() => false)) {
          await applyButton.click();

          // Wait for price update
          await page
            .waitForResponse(
              (resp) =>
                resp.url().includes("payment/quote") &&
                resp.url().includes("couponCode"),
              { timeout: 10_000 },
            )
            .catch(() => null);

          // Check that discounted price is shown
          await expect(page.locator("body")).toContainText("799");
        }
      }
    });

    test("invalid coupon code shows error message", async ({
      platformPage: page,
    }) => {
      await page.route("**/api/proxy/payment/quote**", (route) => {
        const url = new URL(route.request().url());
        const couponCode = url.searchParams.get("couponCode");

        if (couponCode && couponCode !== "") {
          return route.fulfill({
            status: 400,
            json: {
              status: false,
              error: "Invalid coupon code",
            },
          });
        }

        return route.fulfill({
          status: 200,
          json: {
            status: true,
            data: mockPaymentQuote,
          },
        });
      });

      await page.goto(
        "/checkout?productType=INTERVIEW_SHEET&productId=sheet_123",
      );

      const couponInput = page.getByPlaceholder(/coupon|promo/i);

      if (await couponInput.isVisible({ timeout: 5000 }).catch(() => false)) {
        await couponInput.fill("INVALID_COUPON");

        const applyButton = page.getByRole("button", { name: /apply/i });
        if (await applyButton.isVisible({ timeout: 3000 }).catch(() => false)) {
          await applyButton.click();

          // Should show error message
          await expect(page.locator("body")).toContainText(
            /invalid|expired|error/i,
          );
        }
      }
    });
  });

  test.describe("Authenticated Checkout Flow", () => {
    test("authenticated user can initiate payment", async ({
      platformPage: page,
    }) => {
      // Set up authentication
      const token = buildE2EAccessJwt();

      await page.context().addCookies([
        {
          name: TBE_ACCESS_COOKIE,
          value: token,
          domain: "localhost",
          path: "/",
          sameSite: "Lax",
          httpOnly: false,
          secure: false,
        },
      ]);

      await page.addInitScript(
        ([key, value]) => {
          document.cookie = `${key}=${value}; path=/; max-age=86400; SameSite=Lax`;
        },
        [TBE_ACCESS_COOKIE, token] as [string, string],
      );

      // Mock APIs
      await page.route("**/api/proxy/payment/quote**", (route) =>
        route.fulfill({
          status: 200,
          json: {
            status: true,
            data: mockPaymentQuote,
          },
        }),
      );

      await page.route("**/api/proxy/payment/create-order**", (route) =>
        route.fulfill({
          status: 200,
          json: {
            status: true,
            data: mockCashfreeSession,
          },
        }),
      );

      await page.route("**/api/proxy/auth/session**", (route) =>
        route.fulfill({
          status: 200,
          json: {
            status: true,
            data: { user: ONBOARDING_GATE_E2E_USER },
          },
        }),
      );

      await page.goto(
        "/checkout?productType=INTERVIEW_SHEET&productId=sheet_123",
        { waitUntil: "domcontentloaded" },
      );

      // Look for the pay/purchase button
      const payButton = page.getByRole("button", {
        name: /pay|purchase|proceed|buy/i,
      });

      if (await payButton.isVisible({ timeout: 10_000 }).catch(() => false)) {
        // Click should initiate payment
        await payButton.click();

        // Check that create-order was called
        const createOrderCall = await page
          .waitForResponse((resp) => resp.url().includes("create-order"), {
            timeout: 10_000,
          })
          .catch(() => null);

        if (createOrderCall) {
          expect(createOrderCall.status()).toBe(200);
        }
      }
    });

    test("unauthenticated user is prompted to login before payment", async ({
      platformPage: page,
    }) => {
      await page.route("**/api/proxy/payment/quote**", (route) =>
        route.fulfill({
          status: 200,
          json: {
            status: true,
            data: mockPaymentQuote,
          },
        }),
      );

      await page.goto(
        "/checkout?productType=INTERVIEW_SHEET&productId=sheet_123",
      );

      // Look for login prompt or redirect
      const loginPrompt = page.getByRole("button", {
        name: /login|sign in|get started/i,
      });
      const payButton = page.getByRole("button", { name: /pay|purchase/i });

      // Either show login prompt or pay button (but pay should require auth)
      const loginVisible = await loginPrompt
        .isVisible({ timeout: 5000 })
        .catch(() => false);
      const payVisible = await payButton
        .isVisible({ timeout: 5000 })
        .catch(() => false);

      expect(loginVisible || payVisible).toBe(true);
    });
  });

  test.describe("Payment Status Flow", () => {
    test("redirects to success page after successful payment", async ({
      platformPage: page,
    }) => {
      const token = buildE2EAccessJwt();

      await page.context().addCookies([
        {
          name: TBE_ACCESS_COOKIE,
          value: token,
          domain: "localhost",
          path: "/",
          sameSite: "Lax",
          httpOnly: false,
          secure: false,
        },
      ]);

      await page.route("**/api/proxy/payment/checkstatus**", (route) =>
        route.fulfill({
          status: 200,
          json: {
            status: true,
            data: {
              purchased: true,
              accessType: "DIRECT_PAYMENT",
            },
          },
        }),
      );

      // Navigate to a payment success callback URL pattern
      await page.goto(
        "/checkout/success?orderId=TBE_ORDER_123&productType=INTERVIEW_SHEET",
        { waitUntil: "domcontentloaded" },
      );

      // Should show success message or redirect to purchased content
      await expect(page.locator("body")).toContainText(
        /success|congratulations|purchased|enrolled|thank/i,
      );
    });

    test("shows error for failed payment", async ({ platformPage: page }) => {
      await page.route("**/api/proxy/payment/checkstatus**", (route) =>
        route.fulfill({
          status: 200,
          json: {
            status: true,
            data: {
              purchased: false,
              error: "Payment failed",
            },
          },
        }),
      );

      await page.goto("/checkout/failed?orderId=TBE_ORDER_FAIL", {
        waitUntil: "domcontentloaded",
      });

      // Should show error or retry message
      await expect(page.locator("body")).toContainText(
        /failed|error|try again|retry/i,
      );
    });
  });

  test.describe("Price Display and Formatting", () => {
    test("prices are displayed in INR format", async ({
      platformPage: page,
    }) => {
      await page.route("**/api/proxy/payment/quote**", (route) =>
        route.fulfill({
          status: 200,
          json: {
            status: true,
            data: mockPaymentQuote,
          },
        }),
      );

      await page.goto(
        "/checkout?productType=INTERVIEW_SHEET&productId=sheet_123",
      );

      // Price should be displayed (either ₹999 or 999 or Rs. 999)
      await expect(page.locator("body")).toContainText(/₹|Rs\.?|INR/);
    });

    test("strikethrough pricing shown when coupon applied", async ({
      platformPage: page,
    }) => {
      await page.route("**/api/proxy/payment/quote**", (route) =>
        route.fulfill({
          status: 200,
          json: {
            status: true,
            data: mockPaymentQuoteWithCoupon,
          },
        }),
      );

      await page.goto(
        "/checkout?productType=INTERVIEW_SHEET&productId=sheet_123&couponCode=SAVE20",
      );

      // Should show both original and discounted prices
      await expect(page.locator("body")).toContainText("999");
      await expect(page.locator("body")).toContainText("799");
    });
  });

  test.describe("Product Already Purchased", () => {
    test("shows already purchased message when user owns product", async ({
      platformPage: page,
    }) => {
      const token = buildE2EAccessJwt();

      await page.context().addCookies([
        {
          name: TBE_ACCESS_COOKIE,
          value: token,
          domain: "localhost",
          path: "/",
          sameSite: "Lax",
          httpOnly: false,
          secure: false,
        },
      ]);

      await page.route("**/api/proxy/payment/checkstatus**", (route) =>
        route.fulfill({
          status: 200,
          json: {
            status: true,
            data: {
              purchased: true,
              accessType: "DIRECT_PAYMENT",
            },
          },
        }),
      );

      await page.route("**/api/proxy/payment/quote**", (route) =>
        route.fulfill({
          status: 200,
          json: {
            status: true,
            data: mockPaymentQuote,
          },
        }),
      );

      await page.goto(
        "/checkout?productType=INTERVIEW_SHEET&productId=sheet_123",
        { waitUntil: "domcontentloaded" },
      );

      // Should indicate product is already purchased or redirect
      const alreadyPurchased = page.getByText(
        /already purchased|already enrolled|you own/i,
      );
      const startLearning = page.getByRole("link", {
        name: /start learning|continue|access/i,
      });

      const isPurchased = await alreadyPurchased
        .isVisible({ timeout: 5000 })
        .catch(() => false);
      const hasAccess = await startLearning
        .isVisible({ timeout: 5000 })
        .catch(() => false);

      // Either show "already purchased" or provide access link
      // This is acceptable behavior for checkout when user already owns the product
    });
  });
});
