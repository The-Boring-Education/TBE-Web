import type { NextApiRequest, NextApiResponse } from "next";
import { createMocks } from "node-mocks-http";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockListSubscriptionPlansFromDB = vi.fn();

vi.mock("../../../../api/src/lib/constants", () => ({
  apiStatusCodes: {
    OKAY: 200,
    INTERNAL_SERVER_ERROR: 500,
    METHOD_NOT_ALLOWED: 405,
  },
  isDevelopmentEnv: false,
}));

vi.mock("../../../../api/src/lib/database", () => ({
  listSubscriptionPlansFromDB: () => mockListSubscriptionPlansFromDB(),
}));

vi.mock("../../../../api/src/lib/utils", () => ({
  sendAPIResponse: (payload: Record<string, unknown>) => payload,
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

import handler from "../../../../api/src/pages/api/v1/subscription-plans/index";

describe("Public subscription-plans API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects non-GET methods", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
  });

  it("filters by productType and active when query param is set", async () => {
    mockListSubscriptionPlansFromDB.mockResolvedValue({
      data: [
        {
          productType: "DSA_YATRA",
          planKey: "lifetime",
          amountInr: 100,
          isActive: true,
        },
        {
          productType: "ONCAMPUS",
          planKey: "3months",
          amountInr: 50,
          isActive: true,
        },
        {
          productType: "DSA_YATRA",
          planKey: "old",
          amountInr: 1,
          isActive: false,
        },
      ],
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      query: { productType: "DSA_YATRA" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData() as string);
    expect(data.status).toBe(true);
    expect(data.data).toHaveLength(1);
    expect(data.data[0].planKey).toBe("lifetime");
  });

  it("returns only active plans when productType is omitted", async () => {
    mockListSubscriptionPlansFromDB.mockResolvedValue({
      data: [
        { productType: "DSA_YATRA", planKey: "a", isActive: true },
        { productType: "DSA_YATRA", planKey: "b", isActive: false },
      ],
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      query: {},
    });

    await handler(req, res);

    const data = JSON.parse(res._getData() as string);
    expect(data.data).toHaveLength(1);
    expect(data.data[0].planKey).toBe("a");
  });
});
