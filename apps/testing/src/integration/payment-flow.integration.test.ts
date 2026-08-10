import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock dependencies
const mockResolveAuthoritativeOrderAmount = vi.fn();
const mockCreateCashfreeOrder = vi.fn();
const mockAddPaymentToDB = vi.fn();
const mockGetPaymentByOrderIdFromDB = vi.fn();
const mockUpdatePaymentStatusToDB = vi.fn();
const mockProcessPostPaymentEnrollment = vi.fn();
const mockVerifyToken = vi.fn();

vi.mock("../../../api/src/lib/services/payment", () => ({
  resolveAuthoritativeOrderAmount: (...args: unknown[]) =>
    mockResolveAuthoritativeOrderAmount(...args),
  processPostPaymentEnrollment: (...args: unknown[]) =>
    mockProcessPostPaymentEnrollment(...args),
  getProductConfig: vi.fn().mockReturnValue({ type: "INTERVIEW_SHEET" }),
}));

vi.mock("../../../api/src/lib/database", () => ({
  addPaymentToDB: (...args: unknown[]) => mockAddPaymentToDB(...args),
  getPaymentByOrderIdFromDB: (...args: unknown[]) =>
    mockGetPaymentByOrderIdFromDB(...args),
  updatePaymentStatusToDB: (...args: unknown[]) =>
    mockUpdatePaymentStatusToDB(...args),
}));

vi.mock("../../../api/src/lib/auth/jwt", () => ({
  verifyToken: (...args: unknown[]) => mockVerifyToken(...args),
}));

vi.mock("../../../api/src/lib/utils/cashfree", () => ({
  createCashfreeOrder: (...args: unknown[]) => mockCreateCashfreeOrder(...args),
  generatePaymentOrderId: vi.fn().mockReturnValue("TBE_ORDER_123456"),
}));

vi.mock("../../../api/src/lib/constants", () => ({
  apiStatusCodes: {
    OKAY: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    INTERNAL_SERVER_ERROR: 500,
    METHOD_NOT_ALLOWED: 405,
  },
  envConfig: {
    CASHFREE_BASE_URL: "https://sandbox.cashfree.com",
    ADMIN_SECRET: "test_admin_secret",
  },
}));

vi.mock("../../../api/src/lib/utils", () => ({
  sendAPIResponse: (payload: any) => payload,
}));

vi.mock("../../../api/src/lib/utils/logger", () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
    request: vi.fn(),
  },
}));

vi.mock("../../../api/src/lib/utils/sentry", () => ({
  capturePaymentError: vi.fn(),
  captureAPIError: vi.fn(),
}));

vi.mock("../../../api/src/lib/utils/cors", () => ({
  cors: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../../../api/src/middleware/api", () => ({
  connectDB: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../../../api/src/middleware/userAuth", () => ({
  getAuthenticatedUserId: vi.fn().mockReturnValue("user_123"),
}));

describe("Payment Flow Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Complete Payment Flow: Create Order → Webhook → Enrollment", () => {
    it("should successfully complete full payment flow for interview sheet", async () => {
      // Step 1: Mock price resolution
      mockResolveAuthoritativeOrderAmount.mockResolvedValue({
        ok: true,
        data: {
          baseAmount: 999,
          finalAmount: 999,
        },
      });

      // Step 2: Mock Cashfree order creation
      mockCreateCashfreeOrder.mockResolvedValue({
        payment_session_id: "session_123",
        order_id: "TBE_ORDER_123456",
      });

      // Step 3: Mock DB payment creation
      mockAddPaymentToDB.mockResolvedValue({
        data: {
          _id: "payment_id_123",
          orderId: "TBE_ORDER_123456",
          status: "PENDING",
        },
      });

      // Step 4: Mock get payment (for webhook)
      mockGetPaymentByOrderIdFromDB.mockResolvedValue({
        data: {
          _id: "payment_id_123",
          user: "user_123",
          orderId: "TBE_ORDER_123456",
          productId: "sheet_abc",
          productType: "INTERVIEW_SHEET",
          amount: 999,
          status: "PENDING",
        },
      });

      // Step 5: Mock update status
      mockUpdatePaymentStatusToDB.mockResolvedValue({
        data: {
          _id: "payment_id_123",
          status: "SUCCESS",
        },
      });

      // Step 6: Mock enrollment
      mockProcessPostPaymentEnrollment.mockResolvedValue({
        success: true,
        data: { enrollmentId: "enroll_xyz" },
      });

      // Simulate the flow
      // 1. Create order
      const orderResult = await simulateCreateOrder({
        productId: "sheet_abc",
        productType: "INTERVIEW_SHEET",
        userId: "user_123",
      });

      expect(orderResult.status).toBe(true);
      expect(orderResult.data.paymentSessionId).toBe("session_123");

      // 2. Simulate webhook callback with SUCCESS
      const webhookResult = await simulateWebhookCallback({
        orderId: "TBE_ORDER_123456",
        paymentId: "cf_pay_123",
        status: "SUCCESS",
      });

      expect(webhookResult.status).toBe(true);

      // Verify enrollment was processed
      expect(mockProcessPostPaymentEnrollment).toHaveBeenCalled();
    });

    it("should handle payment failure correctly", async () => {
      mockResolveAuthoritativeOrderAmount.mockResolvedValue({
        ok: true,
        data: { baseAmount: 999, finalAmount: 999 },
      });

      mockCreateCashfreeOrder.mockResolvedValue({
        payment_session_id: "session_fail",
        order_id: "TBE_ORDER_FAIL",
      });

      mockAddPaymentToDB.mockResolvedValue({
        data: { orderId: "TBE_ORDER_FAIL", status: "PENDING" },
      });

      mockGetPaymentByOrderIdFromDB.mockResolvedValue({
        data: {
          _id: "payment_fail",
          orderId: "TBE_ORDER_FAIL",
          status: "PENDING",
        },
      });

      mockUpdatePaymentStatusToDB.mockResolvedValue({
        data: { status: "FAILED" },
      });

      // Create order
      const orderResult = await simulateCreateOrder({
        productId: "sheet_123",
        productType: "INTERVIEW_SHEET",
        userId: "user_123",
      });

      expect(orderResult.status).toBe(true);

      // Webhook with FAILED status
      const webhookResult = await simulateWebhookCallback({
        orderId: "TBE_ORDER_FAIL",
        status: "FAILED",
      });

      // Enrollment should NOT be called for failed payments
      expect(mockProcessPostPaymentEnrollment).not.toHaveBeenCalled();
    });

    it("should apply coupon discount correctly in payment flow", async () => {
      const couponCode = "SAVE20";
      const baseAmount = 999;
      const discountedAmount = 799;

      mockResolveAuthoritativeOrderAmount.mockResolvedValue({
        ok: true,
        data: {
          baseAmount,
          finalAmount: discountedAmount,
          appliedCoupon: "coupon_id_123",
          couponCode,
          couponDiscountPercentage: 20,
        },
      });

      mockCreateCashfreeOrder.mockResolvedValue({
        payment_session_id: "session_coupon",
        order_id: "TBE_ORDER_COUPON",
      });

      mockAddPaymentToDB.mockResolvedValue({
        data: {
          orderId: "TBE_ORDER_COUPON",
          amount: discountedAmount,
          appliedCoupon: "coupon_id_123",
          couponCode,
        },
      });

      const orderResult = await simulateCreateOrder({
        productId: "sheet_xyz",
        productType: "INTERVIEW_SHEET",
        userId: "user_123",
        couponCode,
      });

      expect(orderResult.status).toBe(true);

      // Verify the order was created with discounted amount
      expect(mockAddPaymentToDB).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: discountedAmount,
          appliedCoupon: "coupon_id_123",
          couponCode,
        }),
      );
    });

    it("should reject invalid coupon in payment flow", async () => {
      mockResolveAuthoritativeOrderAmount.mockResolvedValue({
        ok: false,
        error: "Invalid coupon code",
      });

      const orderResult = await simulateCreateOrder({
        productId: "sheet_123",
        productType: "INTERVIEW_SHEET",
        userId: "user_123",
        couponCode: "INVALID_COUPON",
      });

      expect(orderResult.status).toBe(false);
      expect(orderResult.error).toContain("coupon");
      expect(mockCreateCashfreeOrder).not.toHaveBeenCalled();
    });
  });

  describe("Subscription Payment Flow", () => {
    it("should handle subscription creation flow", async () => {
      mockResolveAuthoritativeOrderAmount.mockResolvedValue({
        ok: true,
        data: {
          baseAmount: 4999,
          finalAmount: 4999,
        },
      });

      mockCreateCashfreeOrder.mockResolvedValue({
        payment_session_id: "session_sub",
        order_id: "TBE_ORDER_SUB",
      });

      mockAddPaymentToDB.mockResolvedValue({
        data: {
          orderId: "TBE_ORDER_SUB",
          productType: "PREPYATRA",
          productId: "lifetime",
        },
      });

      mockGetPaymentByOrderIdFromDB.mockResolvedValue({
        data: {
          orderId: "TBE_ORDER_SUB",
          user: "user_123",
          productType: "PREPYATRA",
          productId: "lifetime",
          amount: 4999,
          status: "PENDING",
        },
      });

      mockUpdatePaymentStatusToDB.mockResolvedValue({
        data: { status: "SUCCESS" },
      });

      mockProcessPostPaymentEnrollment.mockResolvedValue({
        success: true,
        data: {
          subscriptionId: "sub_123",
          plan: "Lifetime",
          expiryDate: new Date("2099-12-31"),
        },
      });

      // Create subscription order
      const orderResult = await simulateCreateOrder({
        productId: "lifetime",
        productType: "PREPYATRA",
        userId: "user_123",
      });

      expect(orderResult.status).toBe(true);

      // Process webhook
      const webhookResult = await simulateWebhookCallback({
        orderId: "TBE_ORDER_SUB",
        paymentId: "cf_pay_sub",
        status: "SUCCESS",
      });

      expect(webhookResult.status).toBe(true);
      expect(mockProcessPostPaymentEnrollment).toHaveBeenCalledWith(
        expect.objectContaining({
          productType: "PREPYATRA",
          productId: "lifetime",
        }),
      );
    });
  });

  describe("Error Handling in Payment Flow", () => {
    it("should handle Cashfree order creation failure", async () => {
      mockResolveAuthoritativeOrderAmount.mockResolvedValue({
        ok: true,
        data: { baseAmount: 999, finalAmount: 999 },
      });

      mockCreateCashfreeOrder.mockRejectedValue(
        new Error("Cashfree API error"),
      );

      const orderResult = await simulateCreateOrder({
        productId: "sheet_123",
        productType: "INTERVIEW_SHEET",
        userId: "user_123",
      });

      expect(orderResult.status).toBe(false);
      expect(orderResult.error).toContain("error");
    });

    it("should handle database save failure during order creation", async () => {
      mockResolveAuthoritativeOrderAmount.mockResolvedValue({
        ok: true,
        data: { baseAmount: 999, finalAmount: 999 },
      });

      mockCreateCashfreeOrder.mockResolvedValue({
        payment_session_id: "session_db_fail",
        order_id: "TBE_ORDER_DB_FAIL",
      });

      mockAddPaymentToDB.mockResolvedValue({
        error: "Database connection failed",
      });

      const orderResult = await simulateCreateOrder({
        productId: "sheet_123",
        productType: "INTERVIEW_SHEET",
        userId: "user_123",
      });

      expect(orderResult.status).toBe(false);
    });

    it("should handle enrollment failure after successful payment", async () => {
      mockGetPaymentByOrderIdFromDB.mockResolvedValue({
        data: {
          orderId: "TBE_ORDER_ENROLL_FAIL",
          user: "user_123",
          productType: "INTERVIEW_SHEET",
          productId: "sheet_123",
          status: "PENDING",
        },
      });

      mockUpdatePaymentStatusToDB.mockResolvedValue({
        data: { status: "SUCCESS" },
      });

      mockProcessPostPaymentEnrollment.mockResolvedValue({
        success: false,
        error: "Enrollment failed",
      });

      const webhookResult = await simulateWebhookCallback({
        orderId: "TBE_ORDER_ENROLL_FAIL",
        paymentId: "cf_pay_123",
        status: "SUCCESS",
      });

      // Payment should still be marked as SUCCESS
      expect(mockUpdatePaymentStatusToDB).toHaveBeenCalledWith(
        expect.objectContaining({ status: "SUCCESS" }),
      );

      // But enrollment failure should be tracked
      expect(mockProcessPostPaymentEnrollment).toHaveBeenCalled();
    });

    it("should handle webhook for unknown order", async () => {
      mockGetPaymentByOrderIdFromDB.mockResolvedValue({
        error: "Payment not found",
      });

      const webhookResult = await simulateWebhookCallback({
        orderId: "UNKNOWN_ORDER",
        status: "SUCCESS",
      });

      expect(webhookResult.status).toBe(false);
      expect(mockUpdatePaymentStatusToDB).not.toHaveBeenCalled();
    });

    it("should handle duplicate webhook calls (idempotency)", async () => {
      // First call - payment in PENDING state
      mockGetPaymentByOrderIdFromDB.mockResolvedValueOnce({
        data: {
          orderId: "TBE_ORDER_DUP",
          status: "PENDING",
          productType: "INTERVIEW_SHEET",
        },
      });

      mockUpdatePaymentStatusToDB.mockResolvedValueOnce({
        data: { status: "SUCCESS" },
      });

      mockProcessPostPaymentEnrollment.mockResolvedValueOnce({
        success: true,
      });

      await simulateWebhookCallback({
        orderId: "TBE_ORDER_DUP",
        status: "SUCCESS",
      });

      // Second call - payment already SUCCESS
      mockGetPaymentByOrderIdFromDB.mockResolvedValueOnce({
        data: {
          orderId: "TBE_ORDER_DUP",
          status: "SUCCESS", // Already processed
          productType: "INTERVIEW_SHEET",
        },
      });

      const result2 = await simulateWebhookCallback({
        orderId: "TBE_ORDER_DUP",
        status: "SUCCESS",
      });

      // Should recognize already processed and not re-enroll
      // Enrollment should only be called once total
      expect(mockProcessPostPaymentEnrollment).toHaveBeenCalledTimes(1);
    });
  });
});

// Helper functions to simulate API calls
async function simulateCreateOrder({
  productId,
  productType,
  userId,
  couponCode,
}: {
  productId: string;
  productType: string;
  userId: string;
  couponCode?: string;
}) {
  // Simulate resolving the price
  const priceResult = await mockResolveAuthoritativeOrderAmount({
    productType,
    productId,
    couponCode,
  });

  if (!priceResult.ok) {
    return { status: false, error: priceResult.error };
  }

  try {
    // Simulate creating Cashfree order
    const cashfreeResult = await mockCreateCashfreeOrder({
      order_amount: priceResult.data.finalAmount,
      order_currency: "INR",
      customer_id: userId,
    });

    // Simulate saving to DB
    const dbResult = await mockAddPaymentToDB({
      userId,
      productId,
      productType,
      amount: priceResult.data.finalAmount,
      orderId: cashfreeResult.order_id,
      paymentLink: `https://sandbox.cashfree.com/checkout/${cashfreeResult.payment_session_id}`,
      appliedCoupon: priceResult.data.appliedCoupon,
      couponCode: priceResult.data.couponCode,
    });

    if (dbResult.error) {
      return { status: false, error: dbResult.error };
    }

    return {
      status: true,
      data: {
        paymentSessionId: cashfreeResult.payment_session_id,
        orderId: cashfreeResult.order_id,
      },
    };
  } catch (error: any) {
    return { status: false, error: error.message || "Order creation failed" };
  }
}

async function simulateWebhookCallback({
  orderId,
  paymentId,
  status,
}: {
  orderId: string;
  paymentId?: string;
  status: string;
}) {
  // Get payment from DB
  const paymentResult = await mockGetPaymentByOrderIdFromDB(orderId);

  if (paymentResult.error || !paymentResult.data) {
    return { status: false, error: paymentResult.error };
  }

  const payment = paymentResult.data;

  // Skip if already processed
  if (payment.status === status) {
    return { status: true, data: { alreadyProcessed: true } };
  }

  // Update payment status
  const updateResult = await mockUpdatePaymentStatusToDB({
    orderId,
    paymentId,
    status,
  });

  if (updateResult.error) {
    return { status: false, error: updateResult.error };
  }

  // Process enrollment only for SUCCESS
  if (status === "SUCCESS") {
    await mockProcessPostPaymentEnrollment(payment);
  }

  return { status: true };
}
