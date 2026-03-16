import type { NextApiRequest, NextApiResponse } from "next";
import { createMocks } from "node-mocks-http";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetQuizByIdFromDB = vi.fn();
const mockSaveQuizAttemptToDB = vi.fn();

vi.mock("../../../../api/src/lib/database", () => ({
  getQuizByIdFromDB: (...args: unknown[]) => mockGetQuizByIdFromDB(...args),
  saveQuizAttemptToDB: (...args: unknown[]) => mockSaveQuizAttemptToDB(...args),
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
    fn: (req: NextApiRequest, res: NextApiResponse) => Promise<void>,
  ) => fn,
}));

import handler from "../../../../api/src/pages/api/v1/quiz/[id]/attempt";

const makeQuiz = (correctAnswers: number[]) => ({
  _id: "quiz-123",
  categoryName: "JavaScript",
  questions: correctAnswers.map((correctAnswer, i) => ({
    question: `Q${i + 1}`,
    options: ["A", "B", "C", "D"],
    correctAnswer,
    explanation: "",
    detailedExplanation: "",
    difficulty: "easy" as const,
  })),
});

describe("Quiz Attempt API Route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects non-POST with 405", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      query: { id: "quiz-123" },
      body: { userId: "user-1", answers: [0], timeTaken: 30 },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
    const data = JSON.parse(res._getData());
    expect(data.message).toBe("Method not allowed");
  });

  it("returns 400 when quiz ID is missing", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      query: {},
      body: { userId: "user-1", answers: [0], timeTaken: 30 },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data.message).toBe("Quiz ID is required");
  });

  it("returns 400 when required body fields are missing", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      query: { id: "quiz-123" },
      body: {},
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data.message).toContain("Missing required fields");
  });

  it("returns 404 when quiz not found", async () => {
    mockGetQuizByIdFromDB.mockResolvedValue({
      data: null,
      error: new Error("Not found"),
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      query: { id: "quiz-123" },
      body: { userId: "user-1", answers: [0], timeTaken: 30 },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(404);
    const data = JSON.parse(res._getData());
    expect(data.message).toBe("Quiz not found");
  });

  it("score calculation - all correct returns 200 with score 100", async () => {
    const quiz = makeQuiz([0, 1, 2]);
    mockGetQuizByIdFromDB.mockResolvedValue({ data: quiz, error: null });
    mockSaveQuizAttemptToDB.mockResolvedValue({
      data: { _id: "attempt-456" },
      error: null,
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      query: { id: "quiz-123" },
      body: { userId: "user-1", answers: [0, 1, 2], timeTaken: 60 },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.status).toBe(true);
    expect(data.data.score).toBe(100);
    expect(data.data.correctAnswers).toBe(3);
    expect(data.data.totalQuestions).toBe(3);
    expect(data.data.pointsEarned).toBe(30);
    expect(data.data.timeTaken).toBe(60);
    expect(data.data.attemptId).toBe("attempt-456");
  });

  it("score calculation - mixed results", async () => {
    const quiz = makeQuiz([0, 1, 2]);
    mockGetQuizByIdFromDB.mockResolvedValue({ data: quiz, error: null });
    mockSaveQuizAttemptToDB.mockResolvedValue({
      data: { _id: "attempt-789" },
      error: null,
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      query: { id: "quiz-123" },
      body: { userId: "user-1", answers: [0, 0, 2], timeTaken: 45 },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.data.score).toBe(67);
    expect(data.data.correctAnswers).toBe(2);
    expect(data.data.totalQuestions).toBe(3);
  });

  it("score calculation - all wrong returns 200 with score 0", async () => {
    const quiz = makeQuiz([0, 1, 2]);
    mockGetQuizByIdFromDB.mockResolvedValue({ data: quiz, error: null });
    mockSaveQuizAttemptToDB.mockResolvedValue({
      data: { _id: "attempt-000" },
      error: null,
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      query: { id: "quiz-123" },
      body: { userId: "user-1", answers: [1, 2, 0], timeTaken: 30 },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.data.score).toBe(0);
    expect(data.data.correctAnswers).toBe(0);
    expect(data.data.pointsEarned).toBe(0);
  });

  it("points calculation is correctAnswers * 10", async () => {
    const quiz = makeQuiz([0, 1]);
    mockGetQuizByIdFromDB.mockResolvedValue({ data: quiz, error: null });
    mockSaveQuizAttemptToDB.mockResolvedValue({
      data: { _id: "attempt-pts" },
      error: null,
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      query: { id: "quiz-123" },
      body: { userId: "user-1", answers: [0, 0], timeTaken: 20 },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.data.correctAnswers).toBe(1);
    expect(data.data.pointsEarned).toBe(10);
  });

  it("returns 500 when save attempt fails", async () => {
    const quiz = makeQuiz([0]);
    mockGetQuizByIdFromDB.mockResolvedValue({ data: quiz, error: null });
    mockSaveQuizAttemptToDB.mockResolvedValue({
      data: null,
      error: new Error("DB write failed"),
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      query: { id: "quiz-123" },
      body: { userId: "user-1", answers: [0], timeTaken: 10 },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    const data = JSON.parse(res._getData());
    expect(data.message).toBe("Failed to save quiz attempt");
  });

  it("returns 500 on internal server error", async () => {
    mockGetQuizByIdFromDB.mockRejectedValue(new Error("Unexpected error"));

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      query: { id: "quiz-123" },
      body: { userId: "user-1", answers: [0], timeTaken: 10 },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    const data = JSON.parse(res._getData());
    expect(data.message).toBe("Internal server error");
  });
});
