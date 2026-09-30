import type { NextApiRequest, NextApiResponse } from "next";
import { createMocks } from "node-mocks-http";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetDSATopicSummaries = vi.fn();

vi.mock("../../../api/src/middleware/requestLogger", () => ({
  withApiHandler: (handler: unknown) => handler,
}));

vi.mock("../../../api/src/lib/database", () => ({
  addDSAQuestionToDB: vi.fn(),
  getAllDSAQuestionsFromDB: vi.fn(),
  getDSASheetMetadataFromDB: vi.fn(),
  getDSATopicSummariesFromDB: (...args: unknown[]) =>
    mockGetDSATopicSummaries(...args),
  checkPaymentStatusFromDB: vi.fn(),
}));

vi.mock("../../../api/src/lib/utils", () => ({
  sendAPIResponse: (data: unknown) => data,
}));

vi.mock("../../../api/src/middleware/api", () => ({
  adminMiddleware: vi.fn().mockResolvedValue(true),
}));

vi.mock("../../../api/src/lib/constants", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../../../api/src/lib/constants")>();
  return {
    ...actual,
    apiStatusCodes: {
      OKAY: 200,
      RESOURCE_CREATED: 201,
      BAD_REQUEST: 400,
      INTERNAL_SERVER_ERROR: 500,
    },
    PAGINATION_LIMITS: { DEFAULT: 50 },
  };
});

import handler from "../../../api/src/pages/api/v1/interview-prep/dsa-sheet/index";

const MOCK_USER_ID = "507f1f77bcf86cd799439011";

describe("DSA sheet free access integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("topics route returns 200 for free-tier topic summaries (not 500)", async () => {
    mockGetDSATopicSummaries.mockResolvedValue({
      data: {
        topics: [{ topic: "ARRAY", count: 3, solved: 0, accessibleCount: 1 }],
      },
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      query: {
        query: "topics",
        userId: MOCK_USER_ID,
        productType: "DSA_YATRA",
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const body = JSON.parse(res._getData());
    expect(body.status).toBe(true);
    expect(body.data.topics).toHaveLength(1);
  });

  it("topics route surfaces only real DB failures from summaries query", async () => {
    mockGetDSATopicSummaries.mockResolvedValue({
      error: "Failed to check payment status",
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      query: {
        query: "topics",
        userId: MOCK_USER_ID,
        productType: "DSA_YATRA",
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    const body = JSON.parse(res._getData());
    expect(body.status).toBe(false);
  });
});
