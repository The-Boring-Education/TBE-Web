import type { NextApiRequest, NextApiResponse } from "next";
import { createMocks } from "node-mocks-http";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockListSubscriptionPlansFromDB = vi.fn();

vi.mock("../../../../api/src/lib/database", () => ({
  listSubscriptionPlansFromDB: (...args: unknown[]) =>
    mockListSubscriptionPlansFromDB(...args),
}));

vi.mock("../../../../api/src/lib/constants", () => ({
  apiStatusCodes: {
    OKAY: 200,
    BAD_REQUEST: 400,
    INTERNAL_SERVER_ERROR: 500,
    METHOD_NOT_ALLOWED: 405,
  },
}));

vi.mock("../../../../api/src/lib/constants/products", () => ({
  isValidProductType: (t: string) =>
    ["DSA_YATRA", "PREPYATRA", "ONCAMPUS"].includes(t),
}));

vi.mock("../../../../api/src/lib/utils", () => ({
  sendAPIResponse: (payload: Record<string, unknown>) => payload,
}));

vi.mock("../../../../api/src/lib/utils/logger", () => ({
  logger: { error: vi.fn(), info: vi.fn(), warn: vi.fn(), request: vi.fn() },
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

import handler from "../../../../api/src/pages/api/v1/subscription-plans/index";

describe("Public subscription-plans API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 405 for non-GET methods", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
    });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(405);
  });

  it("returns 400 for invalid productType filter", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      query: { productType: "INVALID" },
    });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(400);
  });

  it("returns only active plans and respects productType filter", async () => {
    mockListSubscriptionPlansFromDB.mockResolvedValue({
      data: [
        {
          productType: "DSA_YATRA",
          planKey: "monthly",
          amountInr: 499,
          isActive: true,
        },
        {
          productType: "DSA_YATRA",
          planKey: "legacy",
          amountInr: 299,
          isActive: false,
        },
        {
          productType: "PREPYATRA",
          planKey: "monthly",
          amountInr: 999,
          isActive: true,
        },
      ],
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      query: { productType: "DSA_YATRA" },
    });
    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const body = JSON.parse(res._getData() as string);
    expect(body.status).toBe(true);
    expect(body.data).toEqual([
      {
        productType: "DSA_YATRA",
        planKey: "monthly",
        amountInr: 499,
        isActive: true,
      },
    ]);
  });

  it("returns 500 when listing plans fails", async () => {
    mockListSubscriptionPlansFromDB.mockResolvedValue({
      error: "Failed to list subscription plans",
    });
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
    });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(500);
  });
});
