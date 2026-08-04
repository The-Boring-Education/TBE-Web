import type { NextApiRequest, NextApiResponse } from "next";
import { createMocks } from "node-mocks-http";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockQuizFindById = vi.fn();
const mockSessionSave = vi.fn();

vi.mock("../../../../api/src/lib/database", () => ({
  Quiz: {
    findById: (...args: unknown[]) => ({
      lean: () => mockQuizFindById(...args),
    }),
  },
  QuizSession: vi.fn().mockImplementation((data: Record<string, unknown>) => ({
    ...data,
    _id: "session-123",
    save: mockSessionSave,
  })),
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
  withApiHandler: (handler: unknown) => handler,
}));

vi.mock("../../../../api/src/middleware/userAuth", () => ({
  getAuthenticatedUserId: vi.fn().mockReturnValue("u1"),
  verifyOwnership: vi.fn().mockReturnValue(true),
}));

vi.mock("mongoose", () => ({
  Types: {
    ObjectId: vi.fn((id?: string) => id || "generated-id"),
  },
}));

import handler from "../../../../api/src/pages/api/v1/quiz/session/start";

describe("Quiz Session Start API Route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSessionSave.mockResolvedValue(undefined);
  });

  it("rejects non-POST methods", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
  });

  it("returns 400 when userId or quizId is missing", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      body: { quizId: "quiz-1" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data.message).toContain("userId");
    expect(data.message).toContain("quizId");
  });

  it("returns 400 for invalid difficulty", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      body: { userId: "u1", quizId: "q1", difficulty: "invalid" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data.message).toContain("Invalid difficulty");
  });

  it("returns 400 when questionCount is out of range", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      body: { userId: "u1", quizId: "q1", questionCount: 0 },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data.message).toContain("1 and 50");
  });

  it("returns 404 when quiz is not found", async () => {
    mockQuizFindById.mockResolvedValue(null);

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      body: { userId: "u1", quizId: "q1" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(404);
  });

  it("returns 404 when quiz is inactive", async () => {
    mockQuizFindById.mockResolvedValue({
      _id: "q1",
      isActive: false,
      questions: [
        {
          question: "Q1",
          options: ["A"],
          correctAnswer: 0,
          difficulty: "easy",
        },
      ],
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      body: { userId: "u1", quizId: "q1" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(404);
  });

  it("returns 400 when quiz has no questions", async () => {
    mockQuizFindById.mockResolvedValue({
      _id: "q1",
      isActive: true,
      categoryName: "JS",
      questions: [],
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      body: { userId: "u1", quizId: "q1" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data.message).toContain("no questions");
  });

  it("returns 400 when no questions match difficulty filter", async () => {
    mockQuizFindById.mockResolvedValue({
      _id: "q1",
      isActive: true,
      categoryName: "JS",
      questions: [
        {
          question: "Q1",
          options: ["A"],
          correctAnswer: 0,
          difficulty: "easy",
        },
      ],
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      body: { userId: "u1", quizId: "q1", difficulty: "hard" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data.message).toContain("No questions available");
  });

  it("creates session successfully with mixed difficulty", async () => {
    mockQuizFindById.mockResolvedValue({
      _id: "q1",
      isActive: true,
      categoryName: "JavaScript",
      questions: [
        {
          question: "Q1?",
          options: ["A", "B"],
          correctAnswer: 0,
          difficulty: "easy",
          explanation: "E",
          detailedExplanation: "DE",
        },
      ],
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      body: { userId: "u1", quizId: "q1" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(201);
    const data = JSON.parse(res._getData());
    expect(data.status).toBe(true);
    expect(data.data.sessionId).toBe("session-123");
    expect(data.data.difficulty).toBe("mixed");
    expect(data.data.currentQuestion).toEqual({
      question: "Q1?",
      options: ["A", "B"],
      difficulty: "easy",
    });
    expect(data.data.progress.answered).toBe(0);
    expect(data.data.progress.total).toBe(1);
  });

  it("creates session with specific difficulty filter", async () => {
    mockQuizFindById.mockResolvedValue({
      _id: "q1",
      isActive: true,
      categoryName: "JS",
      questions: [
        {
          question: "Q1",
          options: ["A"],
          correctAnswer: 0,
          difficulty: "medium",
          explanation: "E",
          detailedExplanation: "DE",
        },
      ],
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      body: { userId: "u1", quizId: "q1", difficulty: "medium" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(201);
    const data = JSON.parse(res._getData());
    expect(data.data.difficulty).toBe("medium");
  });

  it("slices questions when more than requested", async () => {
    const questions = Array.from({ length: 20 }, (_, i) => ({
      question: `Q${i + 1}`,
      options: ["A", "B"],
      correctAnswer: 0,
      difficulty: "easy" as const,
      explanation: "E",
      detailedExplanation: "DE",
    }));
    mockQuizFindById.mockResolvedValue({
      _id: "q1",
      isActive: true,
      categoryName: "JS",
      questions,
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      body: { userId: "u1", quizId: "q1", questionCount: 5 },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(201);
    const data = JSON.parse(res._getData());
    expect(data.data.questionCount).toBe(5);
    expect(data.data.progress.total).toBe(5);
  });

  it("returns 500 on internal server error", async () => {
    mockQuizFindById.mockRejectedValue(new Error("DB connection failed"));

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      body: { userId: "u1", quizId: "q1" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    const data = JSON.parse(res._getData());
    expect(data.message).toBe("Internal server error");
  });
});
