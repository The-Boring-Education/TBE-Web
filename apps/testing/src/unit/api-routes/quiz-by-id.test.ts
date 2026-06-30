import type { NextApiRequest, NextApiResponse } from "next";
import { createMocks } from "node-mocks-http";
import { beforeEach, describe, expect, it, vi } from "vitest";

import handler from "../../../../api/src/pages/api/v1/quiz/[id]";

const mockGetQuizByIdFromDB = vi.fn();
const mockUpdateAQuizInDB = vi.fn();
const mockAppendQuestionsToQuizInDB = vi.fn();

vi.mock("../../../../api/src/lib/database", () => ({
  getQuizByIdFromDB: (...args: unknown[]) => mockGetQuizByIdFromDB(...args),
  updateAQuizInDB: (...args: unknown[]) => mockUpdateAQuizInDB(...args),
  appendQuestionsToQuizInDB: (...args: unknown[]) =>
    mockAppendQuestionsToQuizInDB(...args),
}));

vi.mock("../../../../api/src/lib/utils", () => ({
  sendAPIResponse: (payload: unknown) => payload,
}));

vi.mock("../../../../api/src/middleware/requestLogger", () => ({
  withApiHandler: (h: typeof handler) => h,
}));

describe("GET /api/v1/quiz/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns at most 10 questions for default client GET", async () => {
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
        categoryName: "Cat",
        categoryDescription: "D",
        categoryIcon: "i",
        questions,
      },
      error: null,
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      query: { id: "id1", shuffle: "false" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const body = JSON.parse(res._getData());
    expect(body.data.questions).toHaveLength(10);
    expect(body.data.questions[0]).not.toHaveProperty("difficulty");
  });

  it("returns all questions with difficulty when admin=true", async () => {
    const questions = Array.from({ length: 12 }, (_, i) => ({
      question: `Q${i}`,
      options: ["a", "b"],
      correctAnswer: 0,
      explanation: "e",
      detailedExplanation: "d",
      difficulty: "medium",
    }));

    mockGetQuizByIdFromDB.mockResolvedValue({
      data: {
        _id: "id1",
        categoryName: "Cat",
        categoryDescription: "D",
        categoryIcon: "i",
        isActive: true,
        questions,
      },
      error: null,
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      query: { id: "id1", admin: "true", includeInactive: "true" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const body = JSON.parse(res._getData());
    expect(body.data.questions).toHaveLength(12);
    expect(body.data.questions[0].difficulty).toBe("medium");
    expect(body.data.isActive).toBe(true);
  });
});
