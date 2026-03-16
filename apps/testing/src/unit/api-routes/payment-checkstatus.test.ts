import type { NextApiRequest, NextApiResponse } from "next";
import { createMocks } from "node-mocks-http";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockCheckPaymentStatusFromDB = vi.fn();

vi.mock("../../../../api/src/lib/constants", () => ({
  apiStatusCodes: {
    OKAY: 200,
    BAD_REQUEST: 400,
    INTERNAL_SERVER_ERROR: 500,
    METHOD_NOT_ALLOWED: 405,
  },
}));

vi.mock("../../../../api/src/lib/database", () => ({
  checkPaymentStatusFromDB: (...args: any[]) =>
    mockCheckPaymentStatusFromDB(...args),
}));

vi.mock("../../../../api/src/lib/utils", () => ({
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

import handler from "../../../../api/src/pages/api/v1/payment/checkstatus";

describe("Payment Check Status API Route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should reject non-GET methods", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
    const data = JSON.parse(res._getData());
    expect(data.message).toContain("Not Allowed");
  });

  it("should return 400 when userId is missing", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      query: { productId: "prod_123" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data.message).toContain("userId and productId are required");
  });

  it("should return 400 when productId is missing", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      query: { userId: "user_123" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
  });

  it("should return purchased=true for paid direct payment", async () => {
    mockCheckPaymentStatusFromDB.mockResolvedValue({
      data: { purchased: true, accessType: "DIRECT_PAYMENT" },
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      query: { userId: "user_123", productId: "prod_456" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.status).toBe(true);
    expect(data.data.purchased).toBe(true);
    expect(data.data.accessType).toBe("DIRECT_PAYMENT");
    expect(data.message).toBe("Payment completed");
  });

  it("should return purchased=true for active subscription", async () => {
    mockCheckPaymentStatusFromDB.mockResolvedValue({
      data: { purchased: true, accessType: "PREPYATRA_SUBSCRIPTION" },
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      query: { userId: "user_123", productId: "prod_456" },
    });

    await handler(req, res);

    const data = JSON.parse(res._getData());
    expect(data.status).toBe(true);
    expect(data.data.accessType).toBe("PREPYATRA_SUBSCRIPTION");
  });

  it("should return purchased=false when payment not completed", async () => {
    mockCheckPaymentStatusFromDB.mockResolvedValue({
      data: { purchased: false },
      error: "Payment not completed",
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      query: { userId: "user_123", productId: "prod_456" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.status).toBe(false);
    expect(data.message).toBe("Payment not completed");
  });

  it("should return purchased=false when no payment record exists", async () => {
    mockCheckPaymentStatusFromDB.mockResolvedValue({
      data: { purchased: false },
      error: "No payment record found",
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      query: { userId: "user_123", productId: "prod_456" },
    });

    await handler(req, res);

    const data = JSON.parse(res._getData());
    expect(data.status).toBe(false);
  });

  it("should pass productType when provided", async () => {
    mockCheckPaymentStatusFromDB.mockResolvedValue({
      data: { purchased: true },
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      query: {
        userId: "user_123",
        productId: "prod_456",
        productType: "INTERVIEW_SHEET",
      },
    });

    await handler(req, res);

    expect(mockCheckPaymentStatusFromDB).toHaveBeenCalledWith(
      "user_123",
      "prod_456",
      "INTERVIEW_SHEET",
    );
  });

  it("should pass undefined productType when not provided", async () => {
    mockCheckPaymentStatusFromDB.mockResolvedValue({
      data: { purchased: false },
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      query: { userId: "user_123", productId: "prod_456" },
    });

    await handler(req, res);

    expect(mockCheckPaymentStatusFromDB).toHaveBeenCalledWith(
      "user_123",
      "prod_456",
      undefined,
    );
  });

  it("should handle DB errors gracefully", async () => {
    mockCheckPaymentStatusFromDB.mockResolvedValue({
      error: "Failed to check payment status",
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      query: { userId: "user_123", productId: "prod_456" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.status).toBe(false);
    expect(data.message).toBe("Failed to check payment status");
  });
});
