import type { NextApiRequest, NextApiResponse } from "next";
import { createMocks } from "node-mocks-http";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockChallengeSave, mockChallengeFind, mockUserFindOne } = vi.hoisted(
  () => ({
    mockChallengeSave: vi.fn(),
    mockChallengeFind: vi.fn(),
    mockUserFindOne: vi.fn(),
  }),
);

vi.mock("@/lib/constants", () => ({
  apiStatusCodes: {
    OKAY: 200,
    BAD_REQUEST: 400,
    METHOD_NOT_ALLOWED: 405,
    RESOURCE_CREATED: 201,
    INTERNAL_SERVER_ERROR: 500,
  },
}));

vi.mock("@/lib/database", () => {
  const MockChallenge = vi.fn().mockImplementation(function (
    data: Record<string, unknown>,
  ) {
    return {
      ...data,
      save: mockChallengeSave,
    };
  });
  (MockChallenge as unknown as { find: typeof mockChallengeFind }).find =
    mockChallengeFind;
  return {
    Challenge: MockChallenge,
    User: { findOne: mockUserFindOne },
  };
});

vi.mock("@/lib/utils", () => ({
  sendAPIResponse: (payload: unknown) => payload,
}));

vi.mock("@/lib/utils/logger", () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    request: vi.fn(),
  },
}));

vi.mock("@/middleware/requestLogger", () => ({
  withApiHandler: (
    fn: (req: NextApiRequest, res: NextApiResponse) => Promise<void>,
  ) => fn,
}));

import handler from "../../../../api/src/pages/api/v1/prepyatra/challenges/index";

describe("PrepYatra Challenges API Route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockChallengeSave.mockResolvedValue(undefined);
    mockChallengeFind.mockReturnValue({
      sort: vi.fn().mockResolvedValue([]),
    });
  });

  it("rejects unsupported methods with 405", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "PUT",
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
  });

  it("GET - missing userId returns 400", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      query: {},
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data.message).toContain("User ID");
  });

  it("GET - valid ObjectId userId returns challenges (200)", async () => {
    const challenges = [{ _id: "c1", name: "Challenge 1" }];
    mockChallengeFind.mockReturnValue({
      sort: vi.fn().mockResolvedValue(challenges),
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      query: { userId: "507f1f77bcf86cd799439011" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.data).toEqual(challenges);
  });

  it("GET - non-ObjectId userId, user found by email returns 200", async () => {
    const challenges = [{ _id: "c1", name: "Challenge 1" }];
    mockUserFindOne.mockResolvedValue({ _id: "user-mongo-id" });
    mockChallengeFind.mockReturnValue({
      sort: vi.fn().mockResolvedValue(challenges),
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      query: { userId: "test@example.com" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.data).toEqual(challenges);
    expect(mockUserFindOne).toHaveBeenCalled();
  });

  it("GET - non-ObjectId userId, user not found returns empty array (200)", async () => {
    mockUserFindOne.mockResolvedValue(null);

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      query: { userId: "unknown@example.com" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.data).toEqual([]);
  });

  it("POST - missing required fields returns 400", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      body: { name: "Challenge" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data.message).toContain("required");
  });

  it("POST - valid ObjectId user creates challenge (201)", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      body: {
        name: "30 Days",
        totalDays: 30,
        userId: "507f1f77bcf86cd799439011",
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(201);
    const data = JSON.parse(res._getData());
    expect(data.status).toBe(true);
    expect(data.data).toBeDefined();
    expect(mockChallengeSave).toHaveBeenCalled();
    expect(mockUserFindOne).not.toHaveBeenCalled();
  });

  it("POST - non-ObjectId user, user found creates challenge (201)", async () => {
    mockUserFindOne.mockResolvedValue({ _id: "user-123" });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      body: {
        name: "30 Days",
        totalDays: 30,
        user: "test@example.com",
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(201);
    expect(mockUserFindOne).toHaveBeenCalled();
    expect(mockChallengeSave).toHaveBeenCalled();
  });

  it("POST - non-ObjectId user, user not found returns 400", async () => {
    mockUserFindOne.mockResolvedValue(null);

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      body: {
        name: "30 Days",
        totalDays: 30,
        user: "unknown@example.com",
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data.message).toContain("User not found");
  });

  it("POST - internal error returns 500", async () => {
    mockChallengeSave.mockRejectedValue(new Error("DB error"));

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      body: {
        name: "30 Days",
        totalDays: 30,
        userId: "507f1f77bcf86cd799439011",
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    const data = JSON.parse(res._getData());
    expect(data.status).toBe(false);
  });
});
