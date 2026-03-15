import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock apiClient first
vi.mock("@tbe/services/api", () => {
  const mockGet = vi.fn();
  const mockPost = vi.fn();

  return {
    apiClient: {
      get: mockGet,
      post: mockPost,
    },
  };
});

// Mock fetch for quizApi methods that use fetch
global.fetch = vi.fn();

// Import after mocks
import { quizApi } from "@tbe/services";
import { apiClient } from "@tbe/services/api";

const mockGet = vi.mocked(apiClient.get);
const mockPost = vi.mocked(apiClient.post);

describe("quizApi Service", () => {
  let consoleErrorSpy: any;

  beforeEach(() => {
    vi.clearAllMocks();
    // Suppress console.error for expected error cases
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe("getCategories", () => {
    it("should fetch quiz categories", async () => {
      const mockResponse = {
        data: {
          success: true,
          data: [{ id: "1", categoryName: "JavaScript" }],
        },
      };
      mockGet.mockResolvedValue(mockResponse);

      const result = await quizApi.getCategories();

      expect(mockGet).toHaveBeenCalled();
      expect(result).toEqual(mockResponse);
    });

    it("should handle errors", async () => {
      const error = new Error("Failed to fetch");
      mockGet.mockRejectedValue(error);

      await expect(quizApi.getCategories()).rejects.toThrow("Failed to fetch");
    });
  });

  describe("getQuestions", () => {
    it("should fetch quiz questions", async () => {
      const mockData = {
        questions: [
          { question: "What is React?", options: ["A", "B"], correctAnswer: 0 },
        ],
      };
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => mockData,
      });

      const result = await quizApi.getQuestions("quiz-123");

      expect(global.fetch).toHaveBeenCalled();
      expect(result).toEqual(mockData);
    });

    it("should throw error when fetch fails", async () => {
      (global.fetch as any).mockResolvedValue({
        ok: false,
      });

      await expect(quizApi.getQuestions("quiz-123")).rejects.toThrow(
        "Failed to fetch quiz questions",
      );
    });
  });

  describe("startSession", () => {
    it("should start a quiz session", async () => {
      const mockData = { sessionId: "session-123", currentQuestion: {} };
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => mockData,
      });

      const payload = {
        userId: "user-123",
        quizId: "quiz-123",
        difficulty: "medium" as const,
        questionCount: 10,
      };

      const result = await quizApi.startSession(payload);

      expect(global.fetch).toHaveBeenCalled();
      expect(result).toEqual(mockData);
    });

    it("should throw error when session start fails", async () => {
      (global.fetch as any).mockResolvedValue({
        ok: false,
      });

      await expect(
        quizApi.startSession({
          userId: "user-123",
          quizId: "quiz-123",
        }),
      ).rejects.toThrow("Failed to start quiz session");
    });
  });

  describe("submitAnswer", () => {
    it("should submit an answer", async () => {
      const mockData = { isCorrect: true, nextQuestion: {} };
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => mockData,
      });

      const result = await quizApi.submitAnswer("session-123", {
        questionIndex: 0,
        answer: 1,
        timeSpent: 30,
      });

      expect(global.fetch).toHaveBeenCalled();
      expect(result).toEqual(mockData);
    });

    it("should throw error when answer submission fails", async () => {
      (global.fetch as any).mockResolvedValue({
        ok: false,
      });

      await expect(
        quizApi.submitAnswer("session-123", {
          questionIndex: 0,
          answer: 1,
          timeSpent: 30,
        }),
      ).rejects.toThrow("Failed to submit answer");
    });
  });

  describe("completeSession", () => {
    it("should complete a quiz session", async () => {
      const mockData = { completed: true, score: 85 };
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => mockData,
      });

      const result = await quizApi.completeSession("session-123");

      expect(global.fetch).toHaveBeenCalled();
      expect(result).toEqual(mockData);
    });

    it("should throw error when completion fails", async () => {
      (global.fetch as any).mockResolvedValue({
        ok: false,
      });

      await expect(quizApi.completeSession("session-123")).rejects.toThrow(
        "Failed to complete quiz session",
      );
    });
  });

  describe("submitAttempt", () => {
    it("should submit quiz attempt using apiClient", async () => {
      const mockResponse = {
        data: {
          success: true,
          data: { score: 85, totalQuestions: 10 },
        },
      };
      mockPost.mockResolvedValue(mockResponse);

      const result = await quizApi.submitAttempt("quiz-123", {
        userId: "user-123",
        answers: [0, 1, 2],
        timeTaken: 300,
      });

      expect(mockPost).toHaveBeenCalled();
      expect(result).toEqual(mockResponse);
    });

    it("should handle errors in submitAttempt", async () => {
      const error = new Error("Submission failed");
      mockPost.mockRejectedValue(error);

      await expect(
        quizApi.submitAttempt("quiz-123", {
          userId: "user-123",
          answers: [0, 1],
          timeTaken: 200,
        }),
      ).rejects.toThrow("Submission failed");
    });
  });
});
