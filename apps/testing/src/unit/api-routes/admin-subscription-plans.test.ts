import type { NextApiRequest, NextApiResponse } from "next";
import { createMocks } from "node-mocks-http";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

const mockListSubscriptionPlansFromDB = vi.fn();
const mockUpsertSubscriptionPlansInDB = vi.fn();
const mockDeleteSubscriptionPlanFromDB = vi.fn();

vi.mock("../../../../api/src/lib/database", () => ({
  listSubscriptionPlansFromDB: (...args: unknown[]) =>
    mockListSubscriptionPlansFromDB(...args),
  upsertSubscriptionPlansInDB: (...args: unknown[]) =>
    mockUpsertSubscriptionPlansInDB(...args),
  deleteSubscriptionPlanFromDB: (...args: unknown[]) =>
    mockDeleteSubscriptionPlanFromDB(...args),
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
  envConfig: {},
  isDevelopmentEnv: true,
}));

vi.mock("../../../../api/src/lib/constants/products", () => ({
  isValidProductType: (t: string) =>
    ["DSA_YATRA", "PREPYATRA", "ONCAMPUS"].includes(t),
}));

const mockAdminMiddleware = vi.fn();
vi.mock("../../../../api/src/middleware/api", () => ({
  adminMiddleware: (...args: unknown[]) => mockAdminMiddleware(...args),
  connectDB: vi.fn().mockResolvedValue(undefined),
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

vi.mock("../../../../api/src/lib/utils", () => ({
  sendAPIResponse: (payload: Record<string, unknown>) => payload,
}));

import handler from "../../../../api/src/pages/api/v1/admin/subscription-plans/index";

describe("Admin subscription-plans API", () => {
  const OLD_ENV = process.env.ADMIN_SECRET;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.ADMIN_SECRET = "test-admin-secret";
    mockAdminMiddleware.mockImplementation(async (req: NextApiRequest) => {
      const h = req.headers["x-admin-secret"];
      return h === process.env.ADMIN_SECRET;
    });
  });

  afterAll(() => {
    process.env.ADMIN_SECRET = OLD_ENV;
  });

  it("GET does not list plans when admin middleware denies", async () => {
    mockAdminMiddleware.mockResolvedValueOnce(false);
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
    });
    await handler(req, res);
    expect(mockListSubscriptionPlansFromDB).not.toHaveBeenCalled();
  });

  it("GET returns plans list", async () => {
    mockListSubscriptionPlansFromDB.mockResolvedValue({
      data: [{ productType: "DSA_YATRA", planKey: "lifetime", amountInr: 100 }],
    });
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      headers: { "x-admin-secret": "test-admin-secret" },
    });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(200);
    const body = JSON.parse(res._getData() as string);
    expect(body.status).toBe(true);
    expect(body.data).toHaveLength(1);
  });

  it("POST upserts plans", async () => {
    mockUpsertSubscriptionPlansInDB.mockResolvedValue({
      data: { matched: 1, modified: 0, upserted: 1 },
    });
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      headers: { "x-admin-secret": "test-admin-secret" },
      body: {
        plans: [
          {
            productType: "DSA_YATRA",
            planKey: "lifetime",
            amountInr: 2999,
          },
        ],
      },
    });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(200);
    expect(mockUpsertSubscriptionPlansInDB).toHaveBeenCalledWith([
      {
        productType: "DSA_YATRA",
        planKey: "lifetime",
        amountInr: 2999,
        isActive: undefined,
      },
    ]);
  });

  it("POST returns 400 for invalid productType", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      headers: { "x-admin-secret": "test-admin-secret" },
      body: {
        plans: [{ productType: "INVALID", planKey: "x", amountInr: 1 }],
      },
    });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(400);
  });

  it("DELETE removes a plan when productType and planKey are valid", async () => {
    mockDeleteSubscriptionPlanFromDB.mockResolvedValue({
      data: { deleted: true },
    });
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "DELETE",
      headers: { "x-admin-secret": "test-admin-secret" },
      query: { productType: "DSA_YATRA", planKey: "lifetime" },
    });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(200);
    expect(mockDeleteSubscriptionPlanFromDB).toHaveBeenCalledWith(
      "DSA_YATRA",
      "lifetime",
    );
  });

  it("DELETE returns 404 when no plan matched", async () => {
    mockDeleteSubscriptionPlanFromDB.mockResolvedValue({
      data: { deleted: false },
    });
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "DELETE",
      headers: { "x-admin-secret": "test-admin-secret" },
      query: { productType: "DSA_YATRA", planKey: "missing" },
    });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(404);
  });

  it("DELETE returns 400 when productType is missing from query", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "DELETE",
      headers: { "x-admin-secret": "test-admin-secret" },
      query: { planKey: "lifetime" },
    });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(400);
    expect(mockDeleteSubscriptionPlanFromDB).not.toHaveBeenCalled();
  });

  it("DELETE returns 400 for invalid productType", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "DELETE",
      headers: { "x-admin-secret": "test-admin-secret" },
      query: { productType: "NOT_A_TYPE", planKey: "x" },
    });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(400);
    expect(mockDeleteSubscriptionPlanFromDB).not.toHaveBeenCalled();
  });

  it("returns 405 for unsupported methods", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "PATCH",
      headers: { "x-admin-secret": "test-admin-secret" },
    });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(405);
  });

  it("POST maps full seed fields into SubscriptionPlanInput", async () => {
    mockUpsertSubscriptionPlansInDB.mockResolvedValue({
      data: { matched: 1, modified: 1, upserted: 0 },
    });
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      headers: { "x-admin-secret": "test-admin-secret" },
      body: {
        plans: [
          {
            productType: "PREPYATRA",
            planKey: "3months",
            amountInr: 499,
            planUuid: "a1a1a1a1-a1a1-41a1-a1a1-a1a1a1a1a1a1",
            displayName: "3-Month",
            description: "Quarter access",
            originalAmountInr: 999,
            accessType: "SUBSCRIPTION",
            durationMonths: 3,
            features: ["All courses", "All sheets"],
            isPopular: true,
            isActive: true,
            sortOrder: 2,
          },
        ],
      },
    });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(200);
    expect(mockUpsertSubscriptionPlansInDB).toHaveBeenCalledWith([
      {
        productType: "PREPYATRA",
        planKey: "3months",
        planUuid: "a1a1a1a1-a1a1-41a1-a1a1-a1a1a1a1a1a1",
        displayName: "3-Month",
        description: "Quarter access",
        amountInr: 499,
        originalAmountInr: 999,
        accessType: "SUBSCRIPTION",
        durationMonths: 3,
        features: ["All courses", "All sheets"],
        isPopular: true,
        isActive: true,
        sortOrder: 2,
      },
    ]);
  });
});
