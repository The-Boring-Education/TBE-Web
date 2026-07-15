import type { NextApiRequest, NextApiResponse } from "next";
import { createMocks } from "node-mocks-http";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetUserStreakFromDB = vi.fn();
const mockLogUserActivityForStreak = vi.fn();

vi.mock("../../../../api/src/lib/constants", () => ({
  apiStatusCodes: {
    OKAY: 200,
    RESOURCE_CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500,
    METHOD_NOT_ALLOWED: 405,
  },
  TBE_APP: ["PLATFORM", "PREPYATRA", "DSA_YATRA", "ONCAMPUS", "QUIZ"],
}));

vi.mock("../../../../api/src/lib/database", () => ({
  getUserStreakFromDB: (...args: unknown[]) => mockGetUserStreakFromDB(...args),
  logUserActivityForStreak: (...args: unknown[]) =>
    mockLogUserActivityForStreak(...args),
}));

vi.mock("../../../../api/src/lib/utils", () => ({
  sendAPIResponse: (payload: unknown) => payload,
}));

vi.mock("../../../../api/src/middleware/requestLogger", () => ({
  withApiHandler: (
    fn: (req: NextApiRequest, res: NextApiResponse) => Promise<void>,
  ) => fn,
}));

vi.mock("../../../../api/src/lib/services/admin-cache", () => ({
  isAdminEmail: vi.fn().mockResolvedValue(false),
  warmAdminEmailCache: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../../../../api/src/middleware/admin", () => ({
  verifyAuthenticatedUser: vi.fn().mockImplementation((req) => {
    const userId = req.query?.userId || req.body?.userId || "user123";
    return {
      sub: userId,
      email: "test@example.com",
      name: "Test User",
      type: "access",
    };
  }),
  withUserAuth: (handler: any) => handler,
  isAdminEmail: vi.fn().mockResolvedValue(false),
}));

import handler from "../../../../api/src/pages/api/v1/user/streak";

describe("Streak API Route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects unsupported methods with 405", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "PUT",
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
    const data = JSON.parse(res._getData());
    expect(data.status).toBe(false);
    expect(data.message).toContain("not allowed");
  });

  // =====================
  // GET /api/v1/user/streak
  // =====================

  it("GET - missing userId returns 400", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      query: {},
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data.status).toBe(false);
    expect(data.message).toContain("userId");
  });

  it("GET - successful streak fetch returns 200", async () => {
    const streakData = {
      currentStreak: 7,
      longestStreak: 14,
      last30Days: [],
      totalActiveDays: 20,
    };
    mockGetUserStreakFromDB.mockResolvedValue({
      data: streakData,
      error: null,
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      query: { userId: "user123" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.status).toBe(true);
    expect(data.data).toEqual(streakData);
    expect(mockGetUserStreakFromDB).toHaveBeenCalledWith("user123", undefined);
  });

  it("GET - with valid app filter passes app to query", async () => {
    const streakData = {
      currentStreak: 3,
      longestStreak: 5,
      last30Days: [],
      totalActiveDays: 8,
    };
    mockGetUserStreakFromDB.mockResolvedValue({
      data: streakData,
      error: null,
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      query: { userId: "user123", app: "DSA_YATRA" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(mockGetUserStreakFromDB).toHaveBeenCalledWith(
      "user123",
      "DSA_YATRA",
    );
  });

  it("GET - with invalid app filter ignores it (no filter)", async () => {
    const streakData = {
      currentStreak: 1,
      longestStreak: 2,
      last30Days: [],
      totalActiveDays: 3,
    };
    mockGetUserStreakFromDB.mockResolvedValue({
      data: streakData,
      error: null,
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      query: { userId: "user123", app: "INVALID_APP" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(mockGetUserStreakFromDB).toHaveBeenCalledWith("user123", undefined);
  });

  it("GET - DB error returns 500", async () => {
    mockGetUserStreakFromDB.mockResolvedValue({
      data: null,
      error: "DB error",
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      query: { userId: "user123" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    const data = JSON.parse(res._getData());
    expect(data.status).toBe(false);
  });

  // =====================
  // POST /api/v1/user/streak
  // =====================

  it("POST - missing userId returns 400", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      body: { app: "DSA_YATRA", actionType: "COMPLETE_DSA_QUESTION" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data.status).toBe(false);
    expect(data.message).toContain("userId");
  });

  it("POST - invalid app returns 400", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      body: {
        userId: "user123",
        app: "INVALID",
        actionType: "COMPLETE_DSA_QUESTION",
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data.status).toBe(false);
    expect(data.message).toContain("Invalid app");
  });

  it("POST - missing actionType returns 400", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      body: { userId: "user123", app: "DSA_YATRA" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data.status).toBe(false);
    expect(data.message).toContain("actionType");
  });

  it("POST - successful activity log returns 201", async () => {
    mockLogUserActivityForStreak.mockResolvedValue({
      data: { logged: true },
      error: null,
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      body: {
        userId: "user123",
        app: "DSA_YATRA",
        actionType: "COMPLETE_DSA_QUESTION",
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(201);
    const data = JSON.parse(res._getData());
    expect(data.status).toBe(true);
    expect(data.message).toBe("Activity logged successfully");
    expect(mockLogUserActivityForStreak).toHaveBeenCalledWith(
      "user123",
      "DSA_YATRA",
      "COMPLETE_DSA_QUESTION",
      undefined,
    );
  });

  it("POST - DB error returns 500", async () => {
    mockLogUserActivityForStreak.mockResolvedValue({
      data: null,
      error: "Failed to log",
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      body: {
        userId: "user123",
        app: "PLATFORM",
        actionType: "COMPLETE_COURSE_CHAPTER",
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    const data = JSON.parse(res._getData());
    expect(data.status).toBe(false);
  });

  it("POST - with optional metadata passes it through", async () => {
    mockLogUserActivityForStreak.mockResolvedValue({
      data: { logged: true },
      error: null,
    });

    const metadata = { questionId: "q1", difficulty: "EASY" };
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      body: {
        userId: "user456",
        app: "DSA_YATRA",
        actionType: "COMPLETE_DSA_QUESTION",
        metadata,
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(201);
    expect(mockLogUserActivityForStreak).toHaveBeenCalledWith(
      "user456",
      "DSA_YATRA",
      "COMPLETE_DSA_QUESTION",
      metadata,
    );
  });
});
