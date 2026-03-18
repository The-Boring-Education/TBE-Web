import type { NextApiRequest, NextApiResponse } from "next";
import { createMocks } from "node-mocks-http";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockValidateCouponForProductFromDB = vi.fn();

vi.mock("../../../../api/src/lib/constants", () => ({
  apiStatusCodes: {
    OKAY: 200,
    BAD_REQUEST: 400,
    INTERNAL_SERVER_ERROR: 500,
    METHOD_NOT_ALLOWED: 405,
  },
}));

vi.mock("../../../../api/src/lib/database", () => ({
  validateCouponForProductFromDB: (...args: any[]) =>
    mockValidateCouponForProductFromDB(...args),
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

vi.mock("../../../../api/src/lib/utils/functions", () => ({
  sendAPIResponse: (payload: any) => payload,
}));

vi.mock("../../../../api/src/middleware/api", () => ({
  connectDB: vi.fn().mockResolvedValue(undefined),
}));

import handler from "../../../../api/src/pages/api/v1/coupon/validate";

const mockCoupon = {
  _id: { toString: () => "coupon_123" },
  code: "SAVE20",
  discountPercentage: 20,
  description: "Save 20% on your purchase",
  isActive: true,
  expiryDate: { toISOString: () => "2027-12-31T00:00:00.000Z" },
  maxUsage: 100,
  currentUsage: 5,
  applicableProducts: ["prod_456"],
  minimumAmount: 500,
  isValid: true,
};

describe("Coupon Validate API Route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should reject non-POST methods", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
  });

  it("should return 400 when code is missing", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      body: { productId: "prod_456", productType: "SHIKSHA" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data.message).toContain("required");
  });

  it("should return 400 when productId is missing", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      body: { code: "SAVE20", productType: "SHIKSHA" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
  });

  it("should return 400 when productType is missing", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      body: { code: "SAVE20", productId: "prod_456" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
  });

  it("should validate coupon successfully", async () => {
    mockValidateCouponForProductFromDB.mockResolvedValue({
      data: mockCoupon,
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      body: {
        code: "SAVE20",
        productId: "prod_456",
        productType: "SHIKSHA",
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.status).toBe(true);
    expect(data.message).toBe("Coupon validated successfully");
    expect(data.data.code).toBe("SAVE20");
    expect(data.data.discountPercentage).toBe(20);
    expect(data.data.isActive).toBe(true);
    expect(data.data.isValid).toBe(true);
  });

  it("should pass all parameters to DB query including userId", async () => {
    mockValidateCouponForProductFromDB.mockResolvedValue({
      data: mockCoupon,
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      body: {
        code: "SAVE20",
        productId: "prod_456",
        productType: "SHIKSHA",
        userId: "user_789",
      },
    });

    await handler(req, res);

    expect(mockValidateCouponForProductFromDB).toHaveBeenCalledWith(
      "SAVE20",
      "prod_456",
      "SHIKSHA",
      "user_789",
    );
  });

  it("should return 400 for invalid coupon code", async () => {
    mockValidateCouponForProductFromDB.mockResolvedValue({
      error: "Coupon not found",
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      body: {
        code: "INVALID",
        productId: "prod_456",
        productType: "SHIKSHA",
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data.message).toBe("Coupon not found");
  });

  it("should return 400 for expired coupon", async () => {
    mockValidateCouponForProductFromDB.mockResolvedValue({
      error: "Coupon has expired",
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      body: {
        code: "EXPIRED",
        productId: "prod_456",
        productType: "SHIKSHA",
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data.message).toBe("Coupon has expired");
  });

  it("should return 400 for inactive coupon", async () => {
    mockValidateCouponForProductFromDB.mockResolvedValue({
      error: "Coupon is inactive",
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      body: {
        code: "INACTIVE",
        productId: "prod_456",
        productType: "SHIKSHA",
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data.message).toBe("Coupon is inactive");
  });

  it("should return 400 for coupon with usage limit reached", async () => {
    mockValidateCouponForProductFromDB.mockResolvedValue({
      error: "Coupon usage limit reached",
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      body: {
        code: "MAXED",
        productId: "prod_456",
        productType: "SHIKSHA",
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data.message).toBe("Coupon usage limit reached");
  });

  it("should return 400 for coupon not applicable to product", async () => {
    mockValidateCouponForProductFromDB.mockResolvedValue({
      error: "Coupon not applicable to this product",
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      body: {
        code: "WRONG_PRODUCT",
        productId: "other_prod",
        productType: "SHIKSHA",
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
  });

  it("should return 400 when DB returns null coupon", async () => {
    mockValidateCouponForProductFromDB.mockResolvedValue({
      data: null,
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      body: {
        code: "NULL",
        productId: "prod_456",
        productType: "SHIKSHA",
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data.message).toBe("Invalid coupon code");
  });

  it("should handle DB exceptions gracefully", async () => {
    mockValidateCouponForProductFromDB.mockRejectedValue(
      new Error("DB connection failed"),
    );

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      body: {
        code: "SAVE20",
        productId: "prod_456",
        productType: "SHIKSHA",
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    const data = JSON.parse(res._getData());
    expect(data.message).toBe("Internal server error");
  });
});
