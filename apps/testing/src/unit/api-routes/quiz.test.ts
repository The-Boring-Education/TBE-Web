import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMocks } from "node-mocks-http";
import type { NextApiRequest, NextApiResponse } from "next";
import handler from "../../../../api/src/pages/api/v1/quiz/index";

// Mock dependencies
const mockGetQuizCategoriesFromDB = vi.fn();
const mockGetQuizCategoriesWithCountsFromDB = vi.fn();
const mockAddAQuizToDB = vi.fn();
const mockAppendQuestionsToQuizInDB = vi.fn();
const mockCors = vi.fn();
const mockConnectDB = vi.fn();

vi.mock("../../../../api/src/lib/database", () => ({
  getQuizCategoriesFromDB: (...args: any[]) =>
    mockGetQuizCategoriesFromDB(...args),
  getQuizCategoriesWithCountsFromDB: (...args: any[]) =>
    mockGetQuizCategoriesWithCountsFromDB(...args),
  addAQuizToDB: (...args: any[]) => mockAddAQuizToDB(...args),
  appendQuestionsToQuizInDB: (...args: any[]) =>
    mockAppendQuestionsToQuizInDB(...args),
}));

vi.mock("../../../../api/src/lib/utils", () => ({
  cors: (...args: any[]) => mockCors(...args),
}));

vi.mock("../../../../api/src/middleware/api", () => ({
  connectDB: () => mockConnectDB(),
}));

describe("Quiz API Route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCors.mockResolvedValue(undefined);
    mockConnectDB.mockResolvedValue(undefined);
  });

  describe("GET /api/v1/quiz", () => {
    it("should get quiz categories", async () => {
      const mockCategories = [
        { id: "1", categoryName: "JavaScript", questionCount: 10 },
        { id: "2", categoryName: "React", questionCount: 15 },
      ];
      mockGetQuizCategoriesFromDB.mockResolvedValue({
        data: mockCategories,
        error: null,
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
      });

      await handler(req, res);

      expect(mockGetQuizCategoriesFromDB).toHaveBeenCalledWith(false);
      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockCategories);
    });

    it("should get quiz categories with counts when withCounts=true", async () => {
      const mockCategories = [
        { id: "1", categoryName: "JavaScript", questionCount: 10 },
      ];
      mockGetQuizCategoriesWithCountsFromDB.mockResolvedValue({
        data: mockCategories,
        error: null,
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: { withCounts: "true" },
      });

      await handler(req, res);

      expect(mockGetQuizCategoriesWithCountsFromDB).toHaveBeenCalledWith(false);
      expect(res._getStatusCode()).toBe(200);
    });

    it("should include inactive quizzes when includeInactive=true", async () => {
      mockGetQuizCategoriesFromDB.mockResolvedValue({
        data: [],
        error: null,
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: { includeInactive: "true" },
      });

      await handler(req, res);

      expect(mockGetQuizCategoriesFromDB).toHaveBeenCalledWith(true);
    });

    it("should handle database errors", async () => {
      const dbError = new Error("Database error");
      mockGetQuizCategoriesFromDB.mockResolvedValue({
        data: null,
        error: dbError,
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.error).toBeDefined();
    });
  });

  describe("POST /api/v1/quiz", () => {
    it("should create a new quiz", async () => {
      const newQuiz = {
        _id: "quiz-123",
        categoryName: "JavaScript",
        categoryDescription: "JS Fundamentals",
        categoryIcon: "js-icon",
        questions: [
          {
            question: "What is JavaScript?",
            options: ["Language", "Framework"],
            correctAnswer: 0,
            explanation: "JS is a language",
            detailedExplanation: "Detailed explanation",
            difficulty: "easy",
          },
        ],
        isActive: true,
      };

      mockAddAQuizToDB.mockResolvedValue({
        data: newQuiz,
        error: null,
        details: null,
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        body: {
          categoryName: "JavaScript",
          categoryDescription: "JS Fundamentals",
          categoryIcon: "js-icon",
          questions: [
            {
              question: "What is JavaScript?",
              options: ["Language", "Framework"],
              correctAnswer: 0,
              explanation: "JS is a language",
              detailedExplanation: "Detailed explanation",
              difficulty: "easy",
            },
          ],
          isActive: true,
        },
      });

      await handler(req, res);

      expect(mockAddAQuizToDB).toHaveBeenCalled();
      expect(res._getStatusCode()).toBe(201);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
    });

    it("should append questions to existing quiz when quizId provided", async () => {
      const updatedQuiz = {
        _id: "quiz-123",
        questions: [
          { question: "Q1", options: ["A", "B"], correctAnswer: 0 },
          { question: "Q2", options: ["C", "D"], correctAnswer: 1 },
        ],
      };

      mockAppendQuestionsToQuizInDB.mockResolvedValue({
        data: updatedQuiz,
        error: null,
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        body: {
          quizId: "quiz-123",
          questions: [
            {
              question: "Q2",
              options: ["C", "D"],
              correctAnswer: 1,
              explanation: "Explanation",
              detailedExplanation: "Detailed",
              difficulty: "medium",
            },
          ],
        },
      });

      await handler(req, res);

      expect(mockAppendQuestionsToQuizInDB).toHaveBeenCalledWith(
        "quiz-123",
        expect.any(Array),
      );
      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(data.message).toContain("appended");
    });

    it("should return error when required fields are missing", async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        body: {
          categoryName: "JavaScript",
          // Missing other required fields
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.error).toContain("Missing required fields");
    });

    it("should validate question structure", async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        body: {
          categoryName: "JavaScript",
          categoryDescription: "JS Fundamentals",
          categoryIcon: "js-icon",
          questions: [
            {
              // Missing required question fields
              options: ["A", "B"],
            },
          ],
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.error).toBeDefined();
    });

    it("should validate correctAnswer is within options bounds", async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        body: {
          categoryName: "JavaScript",
          categoryDescription: "JS Fundamentals",
          categoryIcon: "js-icon",
          questions: [
            {
              question: "Test?",
              options: ["A", "B"], // Only 2 options (0, 1)
              correctAnswer: 5, // Out of bounds
              explanation: "Exp",
              detailedExplanation: "Detailed",
              difficulty: "easy",
            },
          ],
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.error).toContain("out of bounds");
    });

    it("should handle database errors during quiz creation", async () => {
      mockAddAQuizToDB.mockResolvedValue({
        data: null,
        error: "Database error",
        details: "Connection failed",
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        body: {
          categoryName: "JavaScript",
          categoryDescription: "JS Fundamentals",
          categoryIcon: "js-icon",
          questions: [
            {
              question: "Test?",
              options: ["A", "B"],
              correctAnswer: 0,
              explanation: "Exp",
              detailedExplanation: "Detailed",
              difficulty: "easy",
            },
          ],
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.error).toBe("Database error");
    });

    it("should reject unsupported HTTP methods", async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "PUT",
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(405);
    });
  });
});
