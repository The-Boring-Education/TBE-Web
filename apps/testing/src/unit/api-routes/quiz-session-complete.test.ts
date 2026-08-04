import type { NextApiRequest, NextApiResponse } from "next";
import { createMocks } from "node-mocks-http";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockCompleteQuizSessionInDB = vi.fn();

vi.mock("../../../../api/src/lib/database", () => ({
  completeQuizSessionInDB: (...args: unknown[]) =>
    mockCompleteQuizSessionInDB(...args),
  QuizSession: {
    findById: () => ({
      select: () => ({ lean: () => ({ userId: "u1" }) }),
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

vi.mock("../../../../api/src/middleware/admin", () => ({
  withUserAuth: (handler: unknown) => handler,
}));

vi.mock("../../../../api/src/middleware/userAuth", () => ({
  getAuthenticatedUserId: () => "u1",
}));

import handler from "../../../../api/src/pages/api/v1/quiz/session/[sessionId]/complete";

const baseQuestion = {
  question: "Q?",
  options: ["A", "B"],
  correctAnswer: 0,
  difficulty: "easy" as const,
  explanation: "E",
  detailedExplanation: "DE",
};

describe("Quiz Session Complete API Route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects non-POST methods", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
      query: { sessionId: "sess-1" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
  });

  it("returns 400 when sessionId is missing", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      query: {},
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data.message).toContain("Session ID");
  });

  it("returns 400 when completeQuizSessionInDB returns error", async () => {
    mockCompleteQuizSessionInDB.mockResolvedValue({
      data: null,
      error: "Session already completed",
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      query: { sessionId: "sess-1" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data.message).toBe("Session already completed");
  });

  it("returns 200 with platinum badge when score >= 90", async () => {
    mockCompleteQuizSessionInDB.mockResolvedValue({
      data: {
        _id: "sess-1",
        score: 95,
        percentage: 95,
        totalTime: 120,
        questions: [
          { ...baseQuestion, userAnswer: 0, isCorrect: true, timeSpent: 10 },
          { ...baseQuestion, userAnswer: 0, isCorrect: true, timeSpent: 15 },
          { ...baseQuestion, userAnswer: 0, isCorrect: true, timeSpent: 12 },
          { ...baseQuestion, userAnswer: 0, isCorrect: false, timeSpent: 8 },
          { ...baseQuestion, userAnswer: 0, isCorrect: true, timeSpent: 20 },
        ],
      },
      error: null,
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      query: { sessionId: "sess-1" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.data.badgeEarned).toBe("platinum");
    expect(data.data.score).toBe(95);
  });

  it("returns 200 with gold badge when score 80-89", async () => {
    mockCompleteQuizSessionInDB.mockResolvedValue({
      data: {
        _id: "sess-1",
        score: 85,
        percentage: 85,
        totalTime: 100,
        questions: [
          { ...baseQuestion, userAnswer: 0, isCorrect: true, timeSpent: 10 },
          { ...baseQuestion, userAnswer: 0, isCorrect: true, timeSpent: 12 },
          { ...baseQuestion, userAnswer: 0, isCorrect: false, timeSpent: 8 },
          { ...baseQuestion, userAnswer: 0, isCorrect: true, timeSpent: 15 },
          { ...baseQuestion, userAnswer: 0, isCorrect: true, timeSpent: 18 },
        ],
      },
      error: null,
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      query: { sessionId: "sess-1" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.data.badgeEarned).toBe("gold");
  });

  it("returns 200 with silver badge when score 70-79", async () => {
    mockCompleteQuizSessionInDB.mockResolvedValue({
      data: {
        _id: "sess-1",
        score: 75,
        percentage: 75,
        totalTime: 90,
        questions: [
          { ...baseQuestion, userAnswer: 0, isCorrect: true, timeSpent: 10 },
          { ...baseQuestion, userAnswer: 0, isCorrect: true, timeSpent: 12 },
          { ...baseQuestion, userAnswer: 0, isCorrect: false, timeSpent: 8 },
          { ...baseQuestion, userAnswer: 0, isCorrect: false, timeSpent: 10 },
          { ...baseQuestion, userAnswer: 0, isCorrect: true, timeSpent: 15 },
        ],
      },
      error: null,
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      query: { sessionId: "sess-1" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.data.badgeEarned).toBe("silver");
  });

  it("returns 200 with bronze badge when score < 70", async () => {
    mockCompleteQuizSessionInDB.mockResolvedValue({
      data: {
        _id: "sess-1",
        score: 60,
        percentage: 60,
        totalTime: 80,
        questions: [
          { ...baseQuestion, userAnswer: 0, isCorrect: true, timeSpent: 10 },
          { ...baseQuestion, userAnswer: 0, isCorrect: false, timeSpent: 12 },
          { ...baseQuestion, userAnswer: 0, isCorrect: false, timeSpent: 8 },
          { ...baseQuestion, userAnswer: 0, isCorrect: true, timeSpent: 10 },
          { ...baseQuestion, userAnswer: 0, isCorrect: false, timeSpent: 15 },
        ],
      },
      error: null,
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      query: { sessionId: "sess-1" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.data.badgeEarned).toBe("bronze");
  });

  it("calculates streak bonus for 3+ consecutive correct", async () => {
    mockCompleteQuizSessionInDB.mockResolvedValue({
      data: {
        _id: "sess-1",
        score: 100,
        percentage: 100,
        totalTime: 50,
        questions: [
          { ...baseQuestion, userAnswer: 0, isCorrect: true, timeSpent: 5 },
          { ...baseQuestion, userAnswer: 0, isCorrect: true, timeSpent: 5 },
          { ...baseQuestion, userAnswer: 0, isCorrect: true, timeSpent: 5 },
          { ...baseQuestion, userAnswer: 0, isCorrect: true, timeSpent: 5 },
          { ...baseQuestion, userAnswer: 0, isCorrect: true, timeSpent: 5 },
        ],
      },
      error: null,
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      query: { sessionId: "sess-1" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.data.streakBonus).toBe(50);
    expect(data.data.pointsEarned).toBe(100);
  });

  it("returns no streak bonus when < 3 consecutive correct", async () => {
    mockCompleteQuizSessionInDB.mockResolvedValue({
      data: {
        _id: "sess-1",
        score: 60,
        percentage: 60,
        totalTime: 60,
        questions: [
          { ...baseQuestion, userAnswer: 0, isCorrect: true, timeSpent: 10 },
          { ...baseQuestion, userAnswer: 0, isCorrect: false, timeSpent: 10 },
          { ...baseQuestion, userAnswer: 0, isCorrect: true, timeSpent: 10 },
          { ...baseQuestion, userAnswer: 0, isCorrect: false, timeSpent: 10 },
          { ...baseQuestion, userAnswer: 0, isCorrect: true, timeSpent: 10 },
        ],
      },
      error: null,
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      query: { sessionId: "sess-1" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.data.streakBonus).toBe(0);
    expect(data.data.pointsEarned).toBe(30);
  });

  it("returns difficulty performance breakdown", async () => {
    mockCompleteQuizSessionInDB.mockResolvedValue({
      data: {
        _id: "sess-1",
        score: 80,
        percentage: 80,
        totalTime: 100,
        questions: [
          {
            ...baseQuestion,
            difficulty: "easy",
            userAnswer: 0,
            isCorrect: true,
            timeSpent: 10,
          },
          {
            ...baseQuestion,
            difficulty: "easy",
            userAnswer: 0,
            isCorrect: true,
            timeSpent: 12,
          },
          {
            ...baseQuestion,
            difficulty: "medium",
            userAnswer: 0,
            isCorrect: true,
            timeSpent: 15,
          },
          {
            ...baseQuestion,
            difficulty: "medium",
            userAnswer: 0,
            isCorrect: false,
            timeSpent: 18,
          },
          {
            ...baseQuestion,
            difficulty: "hard",
            userAnswer: 0,
            isCorrect: false,
            timeSpent: 20,
          },
        ],
      },
      error: null,
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      query: { sessionId: "sess-1" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.data.performance.easy).toEqual({
      attempted: 2,
      correct: 2,
      percentage: 100,
    });
    expect(data.data.performance.medium).toEqual({
      attempted: 2,
      correct: 1,
      percentage: 50,
    });
    expect(data.data.performance.hard).toEqual({
      attempted: 1,
      correct: 0,
      percentage: 0,
    });
  });

  it("returns 500 on internal server error", async () => {
    mockCompleteQuizSessionInDB.mockRejectedValue(new Error("DB error"));

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      query: { sessionId: "sess-1" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    const data = JSON.parse(res._getData());
    expect(data.message).toBe("Internal server error");
  });
});
