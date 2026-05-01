import type { NextApiRequest, NextApiResponse } from "next";
import { createMocks } from "node-mocks-http";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetPaymentByOrderIdFromDB = vi.fn();
const mockUpdatePaymentStatusToDB = vi.fn();
const mockProcessPostPaymentEnrollment = vi.fn();
const mockVerifyWebhookSignature = vi.fn();
const mockGetRawBody = vi.fn();

vi.mock("raw-body", () => ({
  default: (...args: any[]) => mockGetRawBody(...args),
}));

vi.mock("../../../../api/src/lib/constants", () => ({
  apiStatusCodes: {
    OKAY: 200,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500,
    METHOD_NOT_ALLOWED: 405,
  },
  envConfig: {
    NODE_ENV: "test",
  },
  isDevelopmentEnv: false,
  PAYMENT_STATUS: ["PENDING", "SUCCESS", "FAILED", "REFUNDED"],
}));

vi.mock("@tbe/constants", async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    paymentConfig: {
      getCashfreeMode: () => "sandbox",
      isCashfreeSandbox: () => true,
      getCashfreePgBaseUrl: () => "https://sandbox.cashfree.com/pg",
      CASHFREE_BASE_URL: "https://sandbox.cashfree.com/pg",
      CASHFREE_CLIENT_ID: "test-client-id",
      CASHFREE_SECRET_KEY: "test-webhook-secret",
    },
  };
});

vi.mock("../../../../api/src/lib/database", () => ({
  getPaymentByOrderIdFromDB: (...args: any[]) =>
    mockGetPaymentByOrderIdFromDB(...args),
  updatePaymentStatusToDB: (...args: any[]) =>
    mockUpdatePaymentStatusToDB(...args),
}));

vi.mock("../../../../api/src/lib/services/payment", () => ({
  processPostPaymentEnrollment: (...args: any[]) =>
    mockProcessPostPaymentEnrollment(...args),
}));

vi.mock("../../../../api/src/lib/utils", () => ({
  sendAPIResponse: (payload: any) => payload,
  verifyWebhookSignature: (...args: any[]) =>
    mockVerifyWebhookSignature(...args),
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

import handler from "../../../../api/src/pages/api/v1/payment/webhook";

const buildValidPayload = (overrides = {}) => ({
  data: {
    order: { order_id: "order_123" },
    payment: {
      payment_status: "SUCCESS",
      cf_payment_id: "cf_pay_456",
    },
  },
  ...overrides,
});

describe("Payment Webhook API Route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockVerifyWebhookSignature.mockReturnValue({ isValid: true });
  });

  it("should reject non-POST methods", async () => {
    const payload = JSON.stringify(buildValidPayload());
    mockGetRawBody.mockResolvedValue(Buffer.from(payload));

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      headers: {
        "x-webhook-signature": "sig",
        "x-webhook-timestamp": "ts",
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
    const data = JSON.parse(res._getData());
    expect(data.message).toContain("Not Allowed");
  });

  it("should return error for invalid JSON payload", async () => {
    mockGetRawBody.mockResolvedValue(Buffer.from("not-valid-json"));

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      headers: {
        "x-webhook-signature": "sig",
        "x-webhook-timestamp": "ts",
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data.message).toContain("Invalid JSON");
  });

  it("should return error for missing data object in payload", async () => {
    const payload = JSON.stringify({ type: "PAYMENT_SUCCESS" });
    mockGetRawBody.mockResolvedValue(Buffer.from(payload));

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      headers: {
        "x-webhook-signature": "sig",
        "x-webhook-timestamp": "ts",
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data.message).toContain("Missing data object");
  });

  it("should return error for missing order or payment in payload", async () => {
    const payload = JSON.stringify({
      data: { order: { order_id: "order_123" } },
    });
    mockGetRawBody.mockResolvedValue(Buffer.from(payload));

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      headers: {
        "x-webhook-signature": "sig",
        "x-webhook-timestamp": "ts",
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data.message).toContain("Missing order or payment");
  });

  it("should return error for missing order_id", async () => {
    const payload = JSON.stringify({
      data: {
        order: {},
        payment: { payment_status: "SUCCESS" },
      },
    });
    mockGetRawBody.mockResolvedValue(Buffer.from(payload));

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      headers: {
        "x-webhook-signature": "sig",
        "x-webhook-timestamp": "ts",
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data.message).toContain("Missing order_id");
  });

  it("should return 401 for invalid webhook signature", async () => {
    mockVerifyWebhookSignature.mockReturnValue({
      isValid: false,
      error: "Invalid webhook signature",
    });

    const payload = JSON.stringify(buildValidPayload());
    mockGetRawBody.mockResolvedValue(Buffer.from(payload));

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      headers: {
        "x-webhook-signature": "bad-sig",
        "x-webhook-timestamp": "ts",
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(401);
    const data = JSON.parse(res._getData());
    expect(data.message).toContain("Invalid webhook signature");
  });

  it("should return 404 when payment not found in DB", async () => {
    const payload = JSON.stringify(buildValidPayload());
    mockGetRawBody.mockResolvedValue(Buffer.from(payload));
    mockGetPaymentByOrderIdFromDB.mockResolvedValue({
      error: "Payment not found",
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      headers: {
        "x-webhook-signature": "valid-sig",
        "x-webhook-timestamp": "ts",
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(404);
    expect(mockGetPaymentByOrderIdFromDB).toHaveBeenCalledWith("order_123");
  });

  it("should return 500 when payment status update fails", async () => {
    const payload = JSON.stringify(buildValidPayload());
    mockGetRawBody.mockResolvedValue(Buffer.from(payload));
    mockGetPaymentByOrderIdFromDB.mockResolvedValue({
      data: { orderId: "order_123", productType: "SHIKSHA" },
    });
    mockUpdatePaymentStatusToDB.mockResolvedValue({
      error: "DB write failed",
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      headers: {
        "x-webhook-signature": "valid-sig",
        "x-webhook-timestamp": "ts",
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    expect(mockUpdatePaymentStatusToDB).toHaveBeenCalledWith({
      orderId: "order_123",
      paymentId: "cf_pay_456",
      status: "SUCCESS",
    });
  });

  it("should process successful payment with enrollment", async () => {
    const mockPayment = {
      orderId: "order_123",
      productType: "SHIKSHA",
      user: "user_1",
    };
    const payload = JSON.stringify(buildValidPayload());
    mockGetRawBody.mockResolvedValue(Buffer.from(payload));
    mockGetPaymentByOrderIdFromDB.mockResolvedValue({
      data: mockPayment,
    });
    mockUpdatePaymentStatusToDB.mockResolvedValue({
      data: { ...mockPayment, status: "SUCCESS" },
    });
    mockProcessPostPaymentEnrollment.mockResolvedValue({
      success: true,
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      headers: {
        "x-webhook-signature": "valid-sig",
        "x-webhook-timestamp": "ts",
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(mockProcessPostPaymentEnrollment).toHaveBeenCalledWith(mockPayment);
  });

  it("should return 200 even when enrollment fails (webhook must not fail)", async () => {
    const mockPayment = {
      orderId: "order_123",
      productType: "SHIKSHA",
    };
    const payload = JSON.stringify(buildValidPayload());
    mockGetRawBody.mockResolvedValue(Buffer.from(payload));
    mockGetPaymentByOrderIdFromDB.mockResolvedValue({
      data: mockPayment,
    });
    mockUpdatePaymentStatusToDB.mockResolvedValue({ data: mockPayment });
    mockProcessPostPaymentEnrollment.mockResolvedValue({
      success: false,
      error: "Enrollment handler not found",
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      headers: {
        "x-webhook-signature": "valid-sig",
        "x-webhook-timestamp": "ts",
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
  });

  it("should not process enrollment for failed payments", async () => {
    const failedPayload = buildValidPayload();
    failedPayload.data.payment.payment_status = "FAILED";
    const payload = JSON.stringify(failedPayload);
    mockGetRawBody.mockResolvedValue(Buffer.from(payload));
    mockGetPaymentByOrderIdFromDB.mockResolvedValue({
      data: { orderId: "order_123" },
    });
    mockUpdatePaymentStatusToDB.mockResolvedValue({
      data: { orderId: "order_123", status: "FAILED" },
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      headers: {
        "x-webhook-signature": "valid-sig",
        "x-webhook-timestamp": "ts",
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(mockProcessPostPaymentEnrollment).not.toHaveBeenCalled();
  });

  it("should extract payment_id from alternative field names", async () => {
    const altPayload = {
      data: {
        order: { orderId: "order_alt_123" },
        payment: {
          status: "SUCCESS",
          gateway_payment_id: "gw_789",
        },
      },
    };
    const payload = JSON.stringify(altPayload);
    mockGetRawBody.mockResolvedValue(Buffer.from(payload));
    mockGetPaymentByOrderIdFromDB.mockResolvedValue({
      data: { orderId: "order_alt_123" },
    });
    mockUpdatePaymentStatusToDB.mockResolvedValue({
      data: { orderId: "order_alt_123" },
    });
    mockProcessPostPaymentEnrollment.mockResolvedValue({
      success: true,
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      headers: {
        "x-webhook-signature": "valid-sig",
        "x-webhook-timestamp": "ts",
      },
    });

    await handler(req, res);

    expect(mockUpdatePaymentStatusToDB).toHaveBeenCalledWith({
      orderId: "order_alt_123",
      paymentId: "gw_789",
      status: "SUCCESS",
    });
  });

  it("should handle null/non-object payloads", async () => {
    const payload = JSON.stringify(null);
    mockGetRawBody.mockResolvedValue(Buffer.from(payload));

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      headers: {
        "x-webhook-signature": "sig",
        "x-webhook-timestamp": "ts",
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
  });
});
