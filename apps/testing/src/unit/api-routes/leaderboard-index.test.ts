import type { NextApiRequest, NextApiResponse } from "next";
import { createMocks } from "node-mocks-http";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGenerateLeaderboard = vi.fn();
const mockGetLeaderboardWithUsersFromDB = vi.fn();
const mockSaveLeaderboardToDB = vi.fn();

vi.mock("../../../../api/src/lib/constants", () => ({
  apiStatusCodes: {
    OKAY: 200,
    BAD_REQUEST: 400,
    INTERNAL_SERVER_ERROR: 500,
  },
  LEADERBOARD_TYPES: ["DAILY", "WEEKLY", "MONTHLY"],
}));

vi.mock("../../../../api/src/lib/database", () => ({
  generateLeaderboard: (...args: unknown[]) => mockGenerateLeaderboard(...args),
  getLeaderboardWithUsersFromDB: (...args: unknown[]) =>
    mockGetLeaderboardWithUsersFromDB(...args),
  saveLeaderboardToDB: (...args: unknown[]) => mockSaveLeaderboardToDB(...args),
}));

vi.mock("../../../../api/src/lib/utils", () => ({
  sendAPIResponse: (payload: unknown) => payload,
}));

vi.mock("../../../../api/src/middleware/requestLogger", () => ({
  withApiHandler: (
    fn: (req: NextApiRequest, res: NextApiResponse) => Promise<void>,
  ) => fn,
}));

import handler from "../../../../api/src/pages/api/v1/leaderboard/index";

describe("Leaderboard API Route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects unsupported methods with 400", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "PUT",
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data.message).toContain("Not Allowed");
  });

  it("POST - successful generation of all types returns 200", async () => {
    const validEntries = [
      { userId: "u1", points: 100 },
      { userId: "u2", points: 90 },
    ];
    mockGenerateLeaderboard
      .mockResolvedValueOnce({ data: validEntries, error: null })
      .mockResolvedValueOnce({ data: validEntries, error: null })
      .mockResolvedValueOnce({ data: validEntries, error: null });
    mockSaveLeaderboardToDB.mockResolvedValue({ error: null });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.status).toBe(true);
    expect(mockGenerateLeaderboard).toHaveBeenCalledTimes(3);
    expect(mockSaveLeaderboardToDB).toHaveBeenCalledTimes(3);
  });

  it("POST - generate fails for one type returns 500", async () => {
    const validEntries = [{ userId: "u1", points: 100 }];
    mockGenerateLeaderboard
      .mockResolvedValueOnce({ data: validEntries, error: null })
      .mockResolvedValueOnce({
        data: null,
        error: new Error("Generate failed"),
      });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    const data = JSON.parse(res._getData());
    expect(data.status).toBe(false);
  });

  it("POST - generate returns invalid data (fails type guard) returns 500", async () => {
    mockGenerateLeaderboard.mockResolvedValueOnce({
      data: [{ userId: "u1" }],
      error: null,
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    const data = JSON.parse(res._getData());
    expect(data.status).toBe(false);
  });

  it("POST - save fails returns 500", async () => {
    const validEntries = [{ userId: "u1", points: 100 }];
    mockGenerateLeaderboard.mockResolvedValue({
      data: validEntries,
      error: null,
    });
    mockSaveLeaderboardToDB
      .mockResolvedValueOnce({ error: null })
      .mockResolvedValueOnce({ error: "Save failed" });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    const data = JSON.parse(res._getData());
    expect(data.status).toBe(false);
  });

  it("GET - missing type returns 400", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      query: {},
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data.message).toContain("Missing or invalid");
  });

  it("GET - successful fetch returns 200", async () => {
    const leaderboard = [
      { userId: "u1", points: 100, user: { name: "User 1" } },
    ];
    mockGetLeaderboardWithUsersFromDB.mockResolvedValue({
      data: leaderboard,
      error: null,
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      query: { type: "DAILY" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.status).toBe(true);
    expect(data.data).toEqual(leaderboard);
  });

  it("GET - no leaderboard snapshot returns 200 with empty entries shape", async () => {
    mockGetLeaderboardWithUsersFromDB.mockResolvedValue({
      data: {
        type: "DAILY",
        app: null,
        entries: [],
      },
      error: null,
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      query: { type: "DAILY" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const parsed = JSON.parse(res._getData());
    expect(parsed.status).toBe(true);
    expect(parsed.data).toEqual({
      type: "DAILY",
      app: null,
      entries: [],
    });
  });

  it("GET - fetch error returns 500", async () => {
    mockGetLeaderboardWithUsersFromDB.mockResolvedValue({
      data: null,
      error: "DB error",
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      query: { type: "WEEKLY" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    const data = JSON.parse(res._getData());
    expect(data.status).toBe(false);
  });
});
