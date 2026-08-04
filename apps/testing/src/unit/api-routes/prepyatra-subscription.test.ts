import type { NextApiRequest, NextApiResponse } from "next";
import { createMocks } from "node-mocks-http";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockPrepYatraSubscriptionCreate = vi.fn();
const mockPrepYatraSubscriptionFindOne = vi.fn();
const mockUserUpdateOne = vi.fn();
const mockUserFindOne = vi.fn();

vi.mock("../../../../api/src/lib/constants", () => ({
  apiStatusCodes: {
    OKAY: 200,
    BAD_REQUEST: 400,
    INTERNAL_SERVER_ERROR: 500,
  },
}));

vi.mock("../../../../api/src/lib/database", () => ({
  User: {
    updateOne: (...args: unknown[]) => mockUserUpdateOne(...args),
    findOne: (...args: unknown[]) => mockUserFindOne(...args),
  },
  Subscription: {
    create: (...args: unknown[]) => mockPrepYatraSubscriptionCreate(...args),
    findOne: (...args: unknown[]) => ({
      sort: (...sortArgs: unknown[]) =>
        mockPrepYatraSubscriptionFindOne(...args, ...sortArgs),
    }),
  },
}));

vi.mock("../../../../api/src/lib/utils", () => ({
  sendAPIResponse: (payload: unknown) => payload,
}));

vi.mock("../../../../api/src/lib/utils/logger", () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    request: vi.fn(),
  },
}));

vi.mock("../../../../api/src/middleware/requestLogger", () => ({
  withApiHandler: (
    handler: (req: NextApiRequest, res: NextApiResponse) => Promise<unknown>,
  ) => handler,
}));

vi.mock("../../../../api/src/middleware/admin", () => ({
  ensureAdminAccess: vi.fn().mockResolvedValue(true),
}));

import handler from "../../../../api/src/pages/api/v1/prepyatra/subscription";

describe("PrepYatra Subscription API Route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUserUpdateOne.mockResolvedValue({ acknowledged: true });
    mockUserFindOne.mockResolvedValue({ userId: "user-1", name: "Test" });
  });

  it("rejects unsupported methods", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "PATCH",
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data.message).toContain("Not Allowed");
  });

  it("POST - missing required fields returns 400", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      body: { userId: "u1" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data.message).toContain("Required fields");
    expect(mockPrepYatraSubscriptionCreate).not.toHaveBeenCalled();
  });

  it("POST - Lifetime subscription returns 200 with expiry far future and 7 features", async () => {
    const mockSub = {
      _id: "sub-1",
      userId: "u1",
      type: "Lifetime",
      amount: 9999,
      duration: 0,
      expiryDate: new Date("2099-12-31"),
      features: [
        "InterviewQuestions",
        "SystemDesignResources",
        "DSAResources",
        "ResumeWorkshop",
        "JobApplicationWorkshop",
        "ColdEmailAutomation",
        "LinkedInAutomation",
      ],
    };
    mockPrepYatraSubscriptionCreate.mockResolvedValue(mockSub);

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      body: {
        userId: "u1",
        type: "Lifetime",
        amount: 9999,
        duration: 12,
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.status).toBe(true);
    expect(data.data.features).toHaveLength(7);
    expect(data.data.features).toContain("ColdEmailAutomation");
    expect(data.data.features).toContain("LinkedInAutomation");
    const createCall = mockPrepYatraSubscriptionCreate.mock.calls[0][0];
    expect(createCall.expiryDate.getFullYear()).toBe(2099);
  });

  it("POST - non-Lifetime subscription returns 200 with expiry now + duration months and 5 features", async () => {
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 6);
    const mockSub = {
      _id: "sub-2",
      userId: "u1",
      type: "Monthly",
      amount: 499,
      duration: 6,
      expiryDate: futureDate,
      features: [
        "InterviewQuestions",
        "SystemDesignResources",
        "DSAResources",
        "ResumeWorkshop",
        "JobApplicationWorkshop",
      ],
    };
    mockPrepYatraSubscriptionCreate.mockResolvedValue(mockSub);

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      body: {
        userId: "u1",
        type: "Monthly",
        amount: 499,
        duration: 6,
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.status).toBe(true);
    expect(data.data.features).toHaveLength(5);
    expect(data.data.features).not.toContain("ColdEmailAutomation");
    const createCall = mockPrepYatraSubscriptionCreate.mock.calls[0][0];
    const expectedExpiry = new Date();
    expectedExpiry.setMonth(expectedExpiry.getMonth() + 6);
    expect(createCall.expiryDate.getMonth()).toBe(expectedExpiry.getMonth());
  });

  it("POST - create error returns 500", async () => {
    mockPrepYatraSubscriptionCreate.mockRejectedValue(new Error("DB error"));

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      body: {
        userId: "u1",
        type: "Monthly",
        amount: 499,
        duration: 6,
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    const data = JSON.parse(res._getData());
    expect(data.message).toBe("Failed to create subscription");
  });

  it("GET - missing userId returns 400", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      query: {},
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data.message).toBe("User ID is required");
  });

  it("GET - user with active subscription returns 200 with hasActiveSubscription true", async () => {
    const mockSub = {
      _id: "sub-1",
      userId: "u1",
      isActive: true,
      expiryDate: new Date(Date.now() + 86400000),
    };
    mockPrepYatraSubscriptionFindOne.mockResolvedValue(mockSub);
    mockUserFindOne.mockResolvedValue({ userId: "u1", name: "Test" });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      query: { userId: "u1" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.status).toBe(true);
    expect(data.data.hasActiveSubscription).toBe(true);
    expect(data.data.subscription._id).toBe("sub-1");
  });

  it("GET - user without subscription returns 200 with hasActiveSubscription false", async () => {
    mockPrepYatraSubscriptionFindOne.mockResolvedValue(null);
    mockUserFindOne.mockResolvedValue({ userId: "u1", name: "Test" });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      query: { userId: "u1" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.status).toBe(true);
    expect(data.data.hasActiveSubscription).toBe(false);
    expect(data.data.subscription).toBeNull();
  });

  it("GET - internal error returns 500", async () => {
    mockPrepYatraSubscriptionFindOne.mockRejectedValue(new Error("DB error"));

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      query: { userId: "u1" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    const data = JSON.parse(res._getData());
    expect(data.message).toBe("Failed to get subscription status");
  });
});
