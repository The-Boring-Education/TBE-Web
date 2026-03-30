import type { NextApiRequest, NextApiResponse } from "next";
import { createMocks } from "node-mocks-http";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockAddPaymentToDB = vi.fn();
const mockBuildOrderPayload = vi.fn();
const mockCreateCashfreeOrder = vi.fn();
const mockGeneratePaymentOrderId = vi.fn();

vi.mock("../../../../api/src/lib/constants", () => ({
  apiStatusCodes: {
    OKAY: 200,
    BAD_REQUEST: 400,
    INTERNAL_SERVER_ERROR: 500,
    METHOD_NOT_ALLOWED: 405,
  },
  envConfig: {
    CASHFREE_BASE_URL: "https://sandbox.cashfree.com/pg",
    CASHFREE_CLIENT_ID: "test-client",
    CASHFREE_SECRET_KEY: "test-secret",
  },
  isDevelopmentEnv: false,
  PAYMENT_STATUS: ["PENDING", "SUCCESS", "FAILED", "REFUNDED"],
  PRODUCT_TYPE: [
    "INTERVIEW_SHEET",
    "SHIKSHA",
    "PROJECTS",
    "PREPYATRA",
    "DSA_YATRA",
    "ONCAMPUS",
    "WEBINAR",
    "GENERAL",
  ],
}));

vi.mock("../../../../api/src/lib/constants/products", () => ({
  isValidProductType: (type: string) =>
    [
      "INTERVIEW_SHEET",
      "SHIKSHA",
      "PROJECTS",
      "PREPYATRA",
      "DSA_YATRA",
      "ONCAMPUS",
      "WEBINAR",
      "GENERAL",
    ].includes(type),
}));

vi.mock("../../../../api/src/lib/database", () => ({
  addPaymentToDB: (...args: any[]) => mockAddPaymentToDB(...args),
}));

vi.mock("../../../../api/src/lib/utils", () => ({
  buildOrderPayload: (...args: any[]) => mockBuildOrderPayload(...args),
  createCashfreeOrder: (...args: any[]) => mockCreateCashfreeOrder(...args),
  generatePaymentOrderId: () => mockGeneratePaymentOrderId(),
  sendAPIResponse: (payload: any) => payload,
}));

vi.mock("../../../../api/src/lib/utils/logger", () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    request: vi.fn(),
  },
}));

vi.mock("../../../../api/src/lib/utils/sentry", () => ({
  captureAPIError: vi.fn(),
}));

vi.mock("../../../../api/src/lib/utils/cors", () => ({
  cors: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../../../../api/src/middleware/api", () => ({
  connectDB: vi.fn().mockResolvedValue(undefined),
}));

import handler from "../../../../api/src/pages/api/v1/payment/create-order";

const validBody = {
  userId: "user_123",
  productId: "prod_456",
  productType: "SHIKSHA",
  amount: 999,
  customerName: "Test User",
  customerEmail: "test@example.com",
};

describe("Payment Create Order API Route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGeneratePaymentOrderId.mockReturnValue("order_test_123");
    mockBuildOrderPayload.mockReturnValue({
      order_id: "order_test_123",
      order_amount: 999,
      order_currency: "INR",
    });
  });

  it("should reject non-POST methods", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
    const data = JSON.parse(res._getData());
    expect(data.message).toContain("Not Allowed");
  });

  it("should return 400 for missing required fields", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      body: { userId: "user_123" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data.message).toContain("Missing required fields");
  });

  it("should return 400 for each missing required field", async () => {
    const requiredFields = [
      "userId",
      "productId",
      "productType",
      "amount",
      "customerName",
      "customerEmail",
    ];

    for (const field of requiredFields) {
      const body = { ...validBody };
      delete (body as any)[field];

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        body,
      });

      await handler(req, res);
      expect(res._getStatusCode()).toBe(400);
    }
  });

  it("should create order successfully", async () => {
    mockCreateCashfreeOrder.mockResolvedValue({
      data: { payment_session_id: "session_abc" },
      ok: true,
    });
    mockAddPaymentToDB.mockResolvedValue({
      data: { orderId: "order_test_123" },
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      body: validBody,
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.status).toBe(true);
    expect(data.data.orderId).toBe("order_test_123");
    expect(data.data.paymentSessionId).toBe("session_abc");
    expect(data.data.paymentLink).toContain("session_abc");

    expect(mockBuildOrderPayload).toHaveBeenCalledWith({
      orderId: "order_test_123",
      amount: 999,
      userId: "user_123",
      customerName: "Test User",
      customerEmail: "test@example.com",
    });
  });

  it("should return error when Cashfree order creation fails", async () => {
    mockCreateCashfreeOrder.mockResolvedValue({
      data: { message: "Invalid request" },
      ok: false,
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      body: validBody,
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data.message).toContain("Failed to create order");
  });

  it("should return error when Cashfree returns no payment_session_id", async () => {
    mockCreateCashfreeOrder.mockResolvedValue({
      data: {},
      ok: true,
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      body: validBody,
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
  });

  it("should return error when DB save fails", async () => {
    mockCreateCashfreeOrder.mockResolvedValue({
      data: { payment_session_id: "session_abc" },
      ok: true,
    });
    mockAddPaymentToDB.mockResolvedValue({
      error: "Failed to save payment to DB",
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      body: validBody,
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    const data = JSON.parse(res._getData());
    expect(data.message).toContain("Failed to save payment");
  });

  it("should pass coupon info when provided", async () => {
    mockCreateCashfreeOrder.mockResolvedValue({
      data: { payment_session_id: "session_abc" },
      ok: true,
    });
    mockAddPaymentToDB.mockResolvedValue({ data: {} });

    const bodyWithCoupon = {
      ...validBody,
      appliedCoupon: "coupon_id_1",
      couponCode: "SAVE20",
    };

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      body: bodyWithCoupon,
    });

    await handler(req, res);

    expect(mockAddPaymentToDB).toHaveBeenCalledWith(
      expect.objectContaining({
        appliedCoupon: "coupon_id_1",
        couponCode: "SAVE20",
      }),
    );
  });

  it("should store productId and productType in DB", async () => {
    mockCreateCashfreeOrder.mockResolvedValue({
      data: { payment_session_id: "session_abc" },
      ok: true,
    });
    mockAddPaymentToDB.mockResolvedValue({ data: {} });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      body: validBody,
    });

    await handler(req, res);

    expect(mockAddPaymentToDB).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user_123",
        productId: "prod_456",
        productType: "SHIKSHA",
        amount: 999,
        orderId: "order_test_123",
      }),
    );
  });
});
