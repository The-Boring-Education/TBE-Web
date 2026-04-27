import type { NextApiRequest, NextApiResponse } from "next";
import { createMocks } from "node-mocks-http";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetPricingBannersForProductTypeFromDB = vi.fn();

vi.mock("../../../../api/src/lib/constants", () => ({
  apiStatusCodes: {
    OKAY: 200,
    BAD_REQUEST: 400,
    INTERNAL_SERVER_ERROR: 500,
    METHOD_NOT_ALLOWED: 405,
  },
}));

vi.mock("../../../../api/src/lib/database", () => ({
  getPricingBannersForProductTypeFromDB: (...args: unknown[]) =>
    mockGetPricingBannersForProductTypeFromDB(...args),
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

vi.mock("../../../../api/src/middleware/api", () => ({
  connectDB: vi.fn().mockResolvedValue(undefined),
}));

import handler from "../../../../api/src/pages/api/v1/coupon/pricing-banners";

describe("Coupon pricing-banners API Route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should reject non-GET methods", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
  });

  it("should return 400 when productType is missing", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      query: {},
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data.message).toContain("productType");
  });

  it("should return banners for valid productType", async () => {
    const rows = [
      {
        code: "LAUNCH10",
        discountPercentage: 10,
        description: "Launch offer",
        expiryDate: "2027-01-01T00:00:00.000Z",
        minimumAmount: 0,
      },
    ];
    mockGetPricingBannersForProductTypeFromDB.mockResolvedValue({ data: rows });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      query: { productType: "PREPYATRA" },
    });

    await handler(req, res);

    expect(mockGetPricingBannersForProductTypeFromDB).toHaveBeenCalledWith(
      "PREPYATRA",
    );
    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.status).toBe(true);
    expect(data.data).toEqual(rows);
  });

  it("should return 500 when DB returns error", async () => {
    mockGetPricingBannersForProductTypeFromDB.mockResolvedValue({
      error: "db down",
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      query: { productType: "PREPYATRA" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
  });
});
