import type { NextApiRequest, NextApiResponse } from "next";
import { createMocks } from "node-mocks-http";
import { beforeEach, describe, expect, it, vi } from "vitest";

import handler from "../../../../api/src/pages/api/v1/admin/quiz/[id]";

const mockGetQuizByIdFromDB = vi.fn();
const mockAdminMiddleware = vi.fn();

vi.mock("../../../../api/src/lib/database", () => ({
  getQuizByIdFromDB: (...args: unknown[]) => mockGetQuizByIdFromDB(...args),
}));

vi.mock("../../../../api/src/middleware/api", () => ({
  adminMiddleware: (...args: unknown[]) => mockAdminMiddleware(...args),
}));

vi.mock("../../../../api/src/lib/utils", () => ({
  sendAPIResponse: (payload: unknown) => payload,
}));

vi.mock("../../../../api/src/middleware/requestLogger", () => ({
  withApiHandler: (h: typeof handler) => h,
}));

describe("GET /api/v1/admin/quiz/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAdminMiddleware.mockResolvedValue(true);
  });

  it("returns all questions (no 10-cap) for admin", async () => {
    const questions = Array.from({ length: 32 }, (_, i) => ({
      question: `Q${i}`,
      options: ["a", "b"],
      correctAnswer: 0,
      explanation: "e",
      detailedExplanation: "d",
      difficulty: "easy",
    }));

    mockGetQuizByIdFromDB.mockResolvedValue({
      data: {
        _id: "id1",
        categoryName: "Node",
        categoryDescription: "D",
        categoryIcon: "i",
        isActive: true,
        questions,
      },
      error: null,
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      query: { id: "id1", includeInactive: "true" },
    });

    await handler(req, res);

    expect(mockAdminMiddleware).toHaveBeenCalled();
    expect(res._getStatusCode()).toBe(200);
    const body = JSON.parse(res._getData());
    expect(body.data.questions).toHaveLength(32);
    expect(body.data.questions[0].difficulty).toBe("easy");
    expect(body.data.isActive).toBe(true);
  });

  it("rejects non-GET", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      query: { id: "id1" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
  });
});
