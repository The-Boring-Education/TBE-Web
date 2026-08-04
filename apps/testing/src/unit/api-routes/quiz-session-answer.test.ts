import type { NextApiRequest, NextApiResponse } from "next";
import { createMocks } from "node-mocks-http";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockSubmitAnswerInDB = vi.fn();
const mockQuizSessionFindById = vi.fn();

vi.mock("../../../../api/src/lib/database", () => ({
  submitAnswerInDB: (...args: unknown[]) => mockSubmitAnswerInDB(...args),
  QuizSession: {
    findById: (...args: unknown[]) => ({
      lean: () => mockQuizSessionFindById(...args),
    }),
  },
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
  getAuthenticatedUserId: vi.fn().mockReturnValue("user-123"),
}));

import handler from "../../../../api/src/pages/api/v1/quiz/session/[sessionId]/answer";

describe("Quiz Session Answer API Route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects non-POST methods", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      query: { sessionId: "sess-1" },
      body: { questionIndex: 0, answer: 0, timeSpent: 5 },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
  });

  it("returns 400 when sessionId is missing", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      query: {},
      body: { questionIndex: 0, answer: 0, timeSpent: 5 },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data.message).toContain("Session ID");
  });

  it("returns 400 when body fields are missing", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      query: { sessionId: "sess-1" },
      body: { questionIndex: 0 },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data.message).toContain("questionIndex");
    expect(data.message).toContain("timeSpent");
  });

  it("returns 400 for invalid questionIndex type", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      query: { sessionId: "sess-1" },
      body: { questionIndex: "not-a-number", answer: 0, timeSpent: 5 },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data.message).toContain("Invalid question index");
  });

  it("returns 400 for negative answer", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      query: { sessionId: "sess-1" },
      body: { questionIndex: 0, answer: -1, timeSpent: 5 },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data.message).toContain("Invalid answer");
  });

  it("returns 400 for invalid timeSpent", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      query: { sessionId: "sess-1" },
      body: { questionIndex: 0, answer: 0, timeSpent: -10 },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data.message).toContain("Invalid time spent");
  });

  it("returns 400 when submitAnswerInDB returns error", async () => {
    mockQuizSessionFindById.mockResolvedValue({ userId: "user-123" });
    mockSubmitAnswerInDB.mockResolvedValue({
      data: null,
      error: "Invalid answer index",
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      query: { sessionId: "sess-1" },
      body: { questionIndex: 0, answer: 0, timeSpent: 5 },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data.message).toBe("Invalid answer index");
  });

  it("returns 404 when session not found after answer", async () => {
    mockSubmitAnswerInDB.mockResolvedValue({
      data: {
        isCorrect: true,
        explanation: "Correct",
        detailedExplanation: "DE",
      },
      error: null,
    });
    mockQuizSessionFindById.mockResolvedValue(null);

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      query: { sessionId: "sess-1" },
      body: { questionIndex: 0, answer: 0, timeSpent: 5 },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(404);
    const data = JSON.parse(res._getData());
    expect(data.message).toBe("Session not found");
  });

  it("returns 200 with more questions remaining", async () => {
    mockSubmitAnswerInDB.mockResolvedValue({
      data: {
        isCorrect: true,
        explanation: "Correct",
        detailedExplanation: "DE",
      },
      error: null,
    });
    mockQuizSessionFindById.mockResolvedValue({
      userId: "user-123",
      questionCount: 3,
      questions: [
        {
          question: "Q1",
          options: ["A", "B"],
          difficulty: "easy",
          userAnswer: 0,
        },
        { question: "Q2", options: ["C", "D"], difficulty: "medium" },
        { question: "Q3", options: ["E", "F"], difficulty: "hard" },
      ],
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      query: { sessionId: "sess-1" },
      body: { questionIndex: 0, answer: 0, timeSpent: 5 },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.status).toBe(true);
    expect(data.data.isCorrect).toBe(true);
    expect(data.data.isCompleted).toBe(false);
    expect(data.data.nextQuestion).toEqual({
      index: 1,
      question: "Q2",
      options: ["C", "D"],
      difficulty: "medium",
    });
    expect(data.data.progress.answered).toBe(1);
    expect(data.data.progress.total).toBe(3);
    expect(data.data.progress.percentage).toBe(33);
  });

  it("returns 200 when quiz is completed", async () => {
    mockSubmitAnswerInDB.mockResolvedValue({
      data: {
        isCorrect: true,
        explanation: "Correct",
        detailedExplanation: "DE",
      },
      error: null,
    });
    mockQuizSessionFindById.mockResolvedValue({
      userId: "user-123",
      questionCount: 2,
      questions: [
        {
          question: "Q1",
          options: ["A", "B"],
          difficulty: "easy",
          userAnswer: 0,
        },
        {
          question: "Q2",
          options: ["C", "D"],
          difficulty: "medium",
          userAnswer: 1,
        },
      ],
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      query: { sessionId: "sess-1" },
      body: { questionIndex: 1, answer: 1, timeSpent: 8 },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.data.isCorrect).toBe(true);
    expect(data.data.isCompleted).toBe(true);
    expect(data.data.nextQuestion).toBeNull();
    expect(data.data.progress.answered).toBe(2);
    expect(data.data.progress.percentage).toBe(100);
  });

  it("returns 500 on internal server error", async () => {
    mockSubmitAnswerInDB.mockRejectedValue(new Error("DB error"));

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      query: { sessionId: "sess-1" },
      body: { questionIndex: 0, answer: 0, timeSpent: 5 },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    const data = JSON.parse(res._getData());
    expect(data.message).toBe("Internal server error");
  });
});
