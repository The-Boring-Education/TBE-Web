import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  createMockRequest,
  createMockResponse,
  executeHandler,
} from "../utils/api-test-helpers";

// Mock database functions
vi.mock("@/lib/database", () => ({
  getQuizCategoriesFromDB: vi.fn(),
  getQuizCategoriesWithCountsFromDB: vi.fn(),
  addAQuizToDB: vi.fn(),
  appendQuestionsToQuizInDB: vi.fn(),
}));

// Mock middleware
vi.mock("@/middleware/api", () => ({
  connectDB: vi.fn().mockResolvedValue(undefined),
  adminMiddleware: vi.fn().mockResolvedValue(true),
}));

// Mock CORS
vi.mock("@/lib/utils", () => ({
  cors: vi.fn().mockResolvedValue(undefined),
  sendAPIResponse: (payload: any) => payload,
}));

// Import after mocks
import handler from "@api/pages/api/v1/quiz/index";

import {
  addAQuizToDB,
  getQuizCategoriesFromDB,
  getQuizCategoriesWithCountsFromDB,
} from "@/lib/database";

describe("Quiz API - /api/v1/quiz", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/v1/quiz", () => {
    it("should return quiz categories", async () => {
      const mockCategories = [
        {
          _id: "1",
          categoryName: "JavaScript",
          categoryDescription: "JS Quiz",
        },
        { _id: "2", categoryName: "React", categoryDescription: "React Quiz" },
      ];

      vi.mocked(getQuizCategoriesFromDB).mockResolvedValue({
        data: mockCategories,
        error: null,
      });

      const req = createMockRequest("GET");
      const res = createMockResponse();

      const result = await executeHandler(handler, req, res);

      expect(result.statusCode).toBe(200);
      expect(result.data.status).toBe(true);
      expect(result.data.data).toEqual(mockCategories);
    });

    it("should return categories with counts", async () => {
      const mockCategoriesWithCounts = [
        { _id: "1", categoryName: "JavaScript", questionCount: 50 },
      ];

      vi.mocked(getQuizCategoriesWithCountsFromDB).mockResolvedValue({
        data: mockCategoriesWithCounts,
        error: null,
      });

      const req = createMockRequest("GET", undefined, { withCounts: "true" });
      const res = createMockResponse();

      const result = await executeHandler(handler, req, res);

      expect(result.statusCode).toBe(200);
      expect(getQuizCategoriesWithCountsFromDB).toHaveBeenCalled();
    });

    it("should handle database errors", async () => {
      vi.mocked(getQuizCategoriesFromDB).mockResolvedValue({
        data: null,
        error: "Database error",
      });

      const req = createMockRequest("GET");
      const res = createMockResponse();

      const result = await executeHandler(handler, req, res);

      expect(result.statusCode).toBe(400);
    });
  });

  describe("POST /api/v1/quiz", () => {
    it("should create a new quiz", async () => {
      const mockQuizData = {
        categoryName: "TypeScript",
        categoryDescription: "TypeScript Quiz",
        categoryIcon: "ts-icon",
        questions: [
          {
            question: "What is TypeScript?",
            options: ["A JavaScript superset", "A new language", "A framework"],
            correctAnswer: 0,
            explanation: "TypeScript extends JavaScript",
            detailedExplanation: "TypeScript adds types",
            difficulty: "medium",
          },
        ],
      };

      vi.mocked(addAQuizToDB).mockResolvedValue({
        data: { _id: "quiz123", ...mockQuizData },
        error: null,
        details: null,
      });

      const req = createMockRequest("POST", mockQuizData);
      const res = createMockResponse();

      const result = await executeHandler(handler, req, res);

      expect(result.statusCode).toBe(201);
      expect(result.data.status).toBe(true);
    });

    it("should reject missing required fields", async () => {
      const req = createMockRequest("POST", { categoryName: "Test" });
      const res = createMockResponse();

      const result = await executeHandler(handler, req, res);

      expect(result.statusCode).toBe(400);
    });
  });

  describe("Method Not Allowed", () => {
    it("should return 405 for PUT", async () => {
      const req = createMockRequest("PUT");
      const res = createMockResponse();

      const result = await executeHandler(handler, req, res);

      expect(result.statusCode).toBe(405);
    });
  });
});
