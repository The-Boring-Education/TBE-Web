import type { NextApiRequest, NextApiResponse } from "next";
import { createMocks } from "node-mocks-http";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockAddGamificationDocInDB = vi.fn();
const mockGetUserPointsFromDB = vi.fn();
const mockUpdateUserPointsInDB = vi.fn();

vi.mock("../../../../api/src/lib/constants", () => ({
  apiStatusCodes: {
    OKAY: 200,
    RESOURCE_CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500,
    METHOD_NOT_ALLOWED: 405,
  },
}));

vi.mock("../../../../api/src/lib/database", () => ({
  addGamificationDocInDB: (...args: unknown[]) =>
    mockAddGamificationDocInDB(...args),
  getUserPointsFromDB: (...args: unknown[]) => mockGetUserPointsFromDB(...args),
  updateUserPointsInDB: (...args: unknown[]) =>
    mockUpdateUserPointsInDB(...args),
}));

vi.mock("../../../../api/src/middleware/requestLogger", () => ({
  withApiHandler: (
    handler: (req: NextApiRequest, res: NextApiResponse) => Promise<unknown>,
  ) => handler,
}));

import handler from "../../../../api/src/pages/api/v1/gamification/index";

describe("Gamification Index API Route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("reject unsupported methods (400)", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "PUT",
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data.success).toBe(false);
    expect(data.message).toContain("not allowed");
  });

  it("GET - user has gamification data (200)", async () => {
    const pointsData = { userId: "u1", points: 100, lastUpdated: new Date() };
    mockGetUserPointsFromDB.mockResolvedValue({
      data: pointsData,
      error: null,
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      query: { userId: "u1" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.success).toBe(true);
    expect(data.message).toBe("Gamification records fetched successfully");
    expect(data.data).toMatchObject({ userId: "u1", points: 100 });
    expect(data.data.lastUpdated).toBeDefined();
    expect(mockAddGamificationDocInDB).not.toHaveBeenCalled();
  });

  it("GET - user has no data, auto-creates (200)", async () => {
    const newDoc = { userId: "u1", points: 0 };
    mockGetUserPointsFromDB.mockResolvedValue({
      data: null,
      error: new Error("Not found"),
    });
    mockAddGamificationDocInDB.mockResolvedValue({
      data: newDoc,
      error: null,
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      query: { userId: "u1" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.success).toBe(true);
    expect(data.message).toBe("Gamification record created successfully");
    expect(data.data).toEqual(newDoc);
    expect(mockAddGamificationDocInDB).toHaveBeenCalledWith("u1");
  });

  it("POST - update points successfully (200)", async () => {
    const updatedResult = { points: 150 };
    mockUpdateUserPointsInDB.mockResolvedValue(updatedResult);

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      query: { userId: "u1" },
      body: { actionType: "ENROLL_COURSE" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.success).toBe(true);
    expect(data.message).toBe("Gamification record updated successfully");
    expect(mockUpdateUserPointsInDB).toHaveBeenCalledWith(
      "u1",
      "ENROLL_COURSE",
    );
  });

  it("POST - missing actionType (400)", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      query: { userId: "u1" },
      body: {},
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data.success).toBe(false);
    expect(data.message).toBe("Missing required fields");
    expect(mockUpdateUserPointsInDB).not.toHaveBeenCalled();
  });

  it("POST - update returns data (200)", async () => {
    const updatedResult = { points: 200, level: 2 };
    mockUpdateUserPointsInDB.mockResolvedValue(updatedResult);

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      query: { userId: "u2" },
      body: { actionType: "COMPLETE_QUIZ" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.success).toBe(true);
    expect(data.data).toEqual(updatedResult);
  });

  it("GET - auto-create returns new doc (200)", async () => {
    const newDoc = { _id: "gm1", userId: "u1", points: 0 };
    mockGetUserPointsFromDB.mockResolvedValue({
      data: null,
      error: new Error("No document"),
    });
    mockAddGamificationDocInDB.mockResolvedValue({
      data: newDoc,
      error: null,
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      query: { userId: "u1" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.data).toEqual(newDoc);
    expect(data.message).toBe("Gamification record created successfully");
  });
});
