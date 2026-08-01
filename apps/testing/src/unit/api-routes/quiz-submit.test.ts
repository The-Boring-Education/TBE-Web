import type { NextApiRequest, NextApiResponse } from "next";
import { createMocks } from "node-mocks-http";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockAddUserQuizAttemptToDB = vi.fn();
const mockGetQuizByIdFromDB = vi.fn();

vi.mock("../../../../api/src/lib/database", () => ({
  addUserQuizAttemptToDB: (...args: unknown[]) =>
    mockAddUserQuizAttemptToDB(...args),
  getQuizByIdFromDB: (...args: unknown[]) => mockGetQuizByIdFromDB(...args),
}));

vi.mock("../../../../api/src/lib/utils", () => ({
  sendAPIResponse: (payload: unknown) => payload,
}));

vi.mock("../../../../api/src/lib/utils/logger", () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), request: vi.fn() },
}));

vi.mock("../../../../api/src/middleware/requestLogger", () => ({
  withApiHandler: (
    fn: (req: NextApiRequest, res: NextApiResponse) => unknown,
  ) => fn,
}));

vi.mock("../../../../api/src/middleware/userAuth", () => ({
  getAuthenticatedUserId: vi.fn().mockReturnValue("test-user-id"),
  verifyOwnership: vi.fn().mockReturnValue(true),
}));

import handler from "../../../../api/src/pages/api/v1/quiz/[id]/submit";

const mockQuiz = {
  _id: "quiz-123",
  categoryName: "JavaScript",
  questions: [{ correctAnswer: 0 }, { correctAnswer: 1 }, { correctAnswer: 2 }],
};

describe("Quiz Submit API Route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 400 when quiz ID is missing", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      query: {},
      body: {
        userId: "user-1",
        answers: [
          {
            questionIndex: 0,
            selectedAnswer: 0,
            isCorrect: true,
            timeSpent: 10,
          },
        ],
        totalTimeSpent: 30,
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data.message).toContain("Quiz ID");
  });

  it("should reject non-POST methods with 405", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      query: { id: "quiz-123" },
      body: {},
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
    const data = JSON.parse(res._getData());
    expect(data.message).toContain("Method not allowed");
  });

  it("should return 400 when userId is missing", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      query: { id: "quiz-123" },
      body: {
        answers: [
          {
            questionIndex: 0,
            selectedAnswer: 0,
            isCorrect: true,
            timeSpent: 10,
          },
        ],
        totalTimeSpent: 30,
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data.message).toContain("userId");
  });

  it("should return 400 when answers array is empty", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      query: { id: "quiz-123" },
      body: {
        userId: "user-1",
        answers: [],
        totalTimeSpent: 30,
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data.message).toContain("answers");
  });

  it("should return 400 when totalTimeSpent is negative", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      query: { id: "quiz-123" },
      body: {
        userId: "user-1",
        answers: [
          {
            questionIndex: 0,
            selectedAnswer: 0,
            isCorrect: true,
            timeSpent: 10,
          },
        ],
        totalTimeSpent: -1,
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data.message).toContain("totalTimeSpent");
  });

  it("should return 404 when quiz not found", async () => {
    mockGetQuizByIdFromDB.mockResolvedValue({
      data: null,
      error: new Error("Not found"),
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      query: { id: "quiz-123" },
      body: {
        userId: "user-1",
        answers: [
          {
            questionIndex: 0,
            selectedAnswer: 0,
            isCorrect: true,
            timeSpent: 10,
          },
        ],
        totalTimeSpent: 30,
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(404);
    const data = JSON.parse(res._getData());
    expect(data.message).toContain("Quiz not found");
  });

  it("should return 200 with all correct answers", async () => {
    mockGetQuizByIdFromDB.mockResolvedValue({ data: mockQuiz, error: null });
    mockAddUserQuizAttemptToDB.mockResolvedValue({
      data: { _id: "attempt-456" },
      error: null,
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      query: { id: "quiz-123" },
      body: {
        userId: "user-1",
        answers: [
          {
            questionIndex: 0,
            selectedAnswer: 0,
            isCorrect: true,
            timeSpent: 10,
          },
          {
            questionIndex: 1,
            selectedAnswer: 1,
            isCorrect: true,
            timeSpent: 10,
          },
          {
            questionIndex: 2,
            selectedAnswer: 2,
            isCorrect: true,
            timeSpent: 10,
          },
        ],
        totalTimeSpent: 30,
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.status).toBe(true);
    expect(data.data.score).toBe(100);
    expect(data.data.correctAnswers).toBe(3);
    expect(data.data.totalQuestions).toBe(3);
    expect(data.data.attemptId).toBe("attempt-456");
  });

  it("should return 200 with mixed results", async () => {
    mockGetQuizByIdFromDB.mockResolvedValue({ data: mockQuiz, error: null });
    mockAddUserQuizAttemptToDB.mockResolvedValue({
      data: { _id: "attempt-789" },
      error: null,
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      query: { id: "quiz-123" },
      body: {
        userId: "user-1",
        answers: [
          {
            questionIndex: 0,
            selectedAnswer: 0,
            isCorrect: true,
            timeSpent: 5,
          },
          {
            questionIndex: 1,
            selectedAnswer: 0,
            isCorrect: false,
            timeSpent: 5,
          },
          {
            questionIndex: 2,
            selectedAnswer: 2,
            isCorrect: true,
            timeSpent: 5,
          },
        ],
        totalTimeSpent: 15,
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.status).toBe(true);
    expect(data.data.correctAnswers).toBe(2);
    expect(data.data.totalQuestions).toBe(3);
    expect(data.data.score).toBe(67);
  });

  it("should mark answer as incorrect when question index does not exist", async () => {
    mockGetQuizByIdFromDB.mockResolvedValue({ data: mockQuiz, error: null });
    mockAddUserQuizAttemptToDB.mockResolvedValue({
      data: { _id: "attempt-999" },
      error: null,
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      query: { id: "quiz-123" },
      body: {
        userId: "user-1",
        answers: [
          {
            questionIndex: 0,
            selectedAnswer: 0,
            isCorrect: true,
            timeSpent: 10,
          },
          {
            questionIndex: 99,
            selectedAnswer: 1,
            isCorrect: false,
            timeSpent: 10,
          },
        ],
        totalTimeSpent: 20,
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.data.correctAnswers).toBe(1);
    expect(data.data.results).toHaveLength(2);
    expect(data.data.results[1].isCorrect).toBe(false);
  });

  it("should return 500 when save attempt fails", async () => {
    mockGetQuizByIdFromDB.mockResolvedValue({ data: mockQuiz, error: null });
    mockAddUserQuizAttemptToDB.mockResolvedValue({
      data: null,
      error: new Error("DB write failed"),
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      query: { id: "quiz-123" },
      body: {
        userId: "user-1",
        answers: [
          {
            questionIndex: 0,
            selectedAnswer: 0,
            isCorrect: true,
            timeSpent: 10,
          },
        ],
        totalTimeSpent: 30,
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    const data = JSON.parse(res._getData());
    expect(data.message).toContain("Failed to save");
  });

  it("should return 500 on internal server error", async () => {
    mockGetQuizByIdFromDB.mockRejectedValue(new Error("Unexpected error"));

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      query: { id: "quiz-123" },
      body: {
        userId: "user-1",
        answers: [
          {
            questionIndex: 0,
            selectedAnswer: 0,
            isCorrect: true,
            timeSpent: 10,
          },
        ],
        totalTimeSpent: 30,
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    const data = JSON.parse(res._getData());
    expect(data.message).toContain("Internal server error");
  });
});
