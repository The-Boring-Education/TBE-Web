import type { NextApiRequest, NextApiResponse } from "next";
import { createMocks } from "node-mocks-http";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockAddGamificationDocInDB = vi.fn();
const mockGetUserPointsFromDB = vi.fn();
const mockUpdateUserPointsInDB = vi.fn();
const mockAuthUserId = vi.fn<() => string | null>();

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
  USER_POINTS_ACTION: ["ENROLL_COURSE", "FEEDBACK_SUBMIT", "COMPLETE_QUIZ"],
}));

vi.mock("../../../../api/src/middleware/userAuth", () => ({
  getAuthenticatedUserId: (_req: unknown, res: NextApiResponse) => {
    const id = mockAuthUserId();
    if (!id) res.status(401).json({ success: false });
    return id;
  },
  verifyOwnership: (auth: string, requested: string, res: NextApiResponse) => {
    if (requested && requested !== auth) {
      res.status(403).json({ success: false });
      return false;
    }
    return true;
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

  describe("POST (Engagement Actions only, authenticated)", () => {
    beforeEach(() => mockAuthUserId.mockReturnValue("u1"));

    const post = async (query: Record<string, string>, body: unknown) => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        query,
        body: body as Record<string, unknown>,
      });
      await handler(req, res);
      return res;
    };

    it("awards an Engagement Action to the signed-in learner (200)", async () => {
      mockUpdateUserPointsInDB.mockResolvedValue({ data: { points: 150 } });

      const res = await post({ userId: "u1" }, { actionType: "ENROLL_COURSE" });

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(data.data).toEqual({ data: { points: 150 } });
      expect(mockUpdateUserPointsInDB).toHaveBeenCalledWith(
        "u1",
        "ENROLL_COURSE",
      );
    });

    it("reports a failed award instead of claiming success (500)", async () => {
      mockUpdateUserPointsInDB.mockResolvedValue({ error: "db down" });

      const res = await post({ userId: "u1" }, { actionType: "ENROLL_COURSE" });

      expect(res._getStatusCode()).toBe(500);
      expect(JSON.parse(res._getData()).success).toBe(false);
    });

    it("requires authentication (401)", async () => {
      mockAuthUserId.mockReturnValue(null);
      const res = await post({ userId: "u1" }, { actionType: "ENROLL_COURSE" });
      expect(res._getStatusCode()).toBe(401);
      expect(mockUpdateUserPointsInDB).not.toHaveBeenCalled();
    });

    it("refuses to award points to another learner (403)", async () => {
      const res = await post({ userId: "u2" }, { actionType: "ENROLL_COURSE" });
      expect(res._getStatusCode()).toBe(403);
      expect(mockUpdateUserPointsInDB).not.toHaveBeenCalled();
    });

    it("refuses Learning Actions, which only the server awards (403)", async () => {
      const res = await post({ userId: "u1" }, { actionType: "COMPLETE_QUIZ" });
      expect(res._getStatusCode()).toBe(403);
      expect(JSON.parse(res._getData()).message).toBe(
        "Learning actions are awarded by the server",
      );
      expect(mockUpdateUserPointsInDB).not.toHaveBeenCalled();
    });

    it("rejects a missing or unknown actionType (400)", async () => {
      for (const body of [{}, { actionType: "MADE_UP" }, { actionType: 7 }]) {
        const res = await post({ userId: "u1" }, body);
        expect(res._getStatusCode()).toBe(400);
        expect(JSON.parse(res._getData()).message).toBe(
          "Missing or invalid actionType",
        );
      }
      expect(mockUpdateUserPointsInDB).not.toHaveBeenCalled();
    });
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
