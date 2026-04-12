import type { NextApiRequest, NextApiResponse } from "next";
import { createMocks } from "node-mocks-http";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockVerifyToken = vi.fn();
const mockResolveAuthoritativeOrderAmount = vi.fn();
const mockGeneratePaymentOrderId = vi.fn();
const mockBuildOrderPayload = vi.fn();
const mockCreateCashfreeOrder = vi.fn();
const mockAddPaymentToDB = vi.fn();

vi.mock("../../../../api/src/lib/auth/jwt", () => ({
  verifyToken: (...args: unknown[]) => mockVerifyToken(...args),
}));

vi.mock("../../../../api/src/lib/constants", () => ({
  apiStatusCodes: {
    OKAY: 200,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    INTERNAL_SERVER_ERROR: 500,
    METHOD_NOT_ALLOWED: 405,
  },
  envConfig: {
    CASHFREE_BASE_URL: "https://sandbox.cashfree.com",
  },
  isDevelopmentEnv: true,
}));

vi.mock("../../../../api/src/lib/database", () => ({
  addPaymentToDB: (...args: unknown[]) => mockAddPaymentToDB(...args),
}));

vi.mock("../../../../api/src/lib/services/payment", () => ({
  resolveAuthoritativeOrderAmount: (...args: unknown[]) =>
    mockResolveAuthoritativeOrderAmount(...args),
}));

vi.mock("../../../../api/src/lib/utils", () => ({
  sendAPIResponse: (payload: Record<string, unknown>) => payload,
  buildCashfreeHostedCheckoutLink: (paymentSessionId: string) =>
    `https://sandbox.cashfree.com/checkout?paymentSessionId=${paymentSessionId}`,
  buildOrderPayload: (...args: unknown[]) => mockBuildOrderPayload(...args),
  createCashfreeOrder: (...args: unknown[]) => mockCreateCashfreeOrder(...args),
  generatePaymentOrderId: () => mockGeneratePaymentOrderId(),
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
  userId: "user_abc",
  productId: "lifetime",
  productType: "DSA_YATRA",
  customerName: "Test User",
  customerEmail: "test@example.com",
};

describe("Payment Create Order API Route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockResolveAuthoritativeOrderAmount.mockResolvedValue({
      ok: true,
      data: {
        finalAmount: 999,
        appliedCoupon: undefined,
        couponCode: undefined,
      },
    });
    mockGeneratePaymentOrderId.mockReturnValue("order_test_1");
    mockBuildOrderPayload.mockReturnValue({ mock: "payload" });
    mockCreateCashfreeOrder.mockResolvedValue({
      ok: true,
      httpStatus: 200,
      data: { payment_session_id: "ps_test_1" },
    });
    mockAddPaymentToDB.mockResolvedValue({ error: undefined });
  });

  it("rejects non-POST methods", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
  });

  it("returns 401 when Authorization header is missing", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      body: validBody,
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(401);
    expect(mockVerifyToken).not.toHaveBeenCalled();
    const data = JSON.parse(res._getData() as string);
    expect(data.message).toBe("Authentication required");
  });

  it("returns 401 when Bearer token is invalid (verify throws)", async () => {
    mockVerifyToken.mockImplementation(() => {
      throw new Error("invalid jwt");
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      headers: { authorization: "Bearer bad" },
      body: validBody,
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(401);
  });

  it("returns 401 when Bearer token is refresh type, not access", async () => {
    mockVerifyToken.mockReturnValue({
      type: "refresh",
      sub: "user_abc",
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      headers: { authorization: "Bearer refresh.jwt.here" },
      body: validBody,
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(401);
  });

  it("accepts Authorization as string[] (Node header edge case)", async () => {
    mockVerifyToken.mockReturnValue({
      type: "access",
      sub: "user_abc",
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      headers: {
        authorization: ["Bearer valid.access.jwt"] as unknown as string,
      },
      body: validBody,
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
  });

  it("accepts Authorization Bearer access JWT (Platform proxy / cross-origin)", async () => {
    mockVerifyToken.mockReturnValue({
      type: "access",
      sub: "user_abc",
      email: "test@example.com",
      name: "Test",
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      headers: { authorization: "Bearer valid.access.jwt" },
      body: validBody,
    });

    await handler(req, res);

    expect(mockVerifyToken).toHaveBeenCalled();
    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData() as string);
    expect(data.status).toBe(true);
    expect(data.data.paymentSessionId).toBe("ps_test_1");
    expect(data.data.orderId).toBe("order_test_1");
  });

  it("returns 403 when body userId does not match authenticated user", async () => {
    mockVerifyToken.mockReturnValue({
      type: "access",
      sub: "user_abc",
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      headers: { authorization: "Bearer token" },
      body: { ...validBody, userId: "other_user" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(403);
    const data = JSON.parse(res._getData() as string);
    expect(data.message).toContain("another user");
  });

  it("returns 400 with Cashfree error message when gateway rejects order", async () => {
    mockVerifyToken.mockReturnValue({
      type: "access",
      sub: "user_abc",
    });
    mockCreateCashfreeOrder.mockResolvedValue({
      ok: false,
      httpStatus: 400,
      gatewayMessage: "order_amount must be greater than minimum",
      data: { message: "order_amount must be greater than minimum" },
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      headers: { authorization: "Bearer token" },
      body: validBody,
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData() as string);
    expect(data.message).toContain("order_amount must be greater than minimum");
  });
});
