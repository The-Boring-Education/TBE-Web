import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock sendRequest FIRST before importing quizApi
vi.mock("@tbe/utils", () => {
  const mockSendRequest = vi.fn();
  return {
    sendRequest: mockSendRequest,
  };
});

// Mock apiClient
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

// Import after mocks
import { quizApi } from "@tbe/services";
import { apiClient } from "@tbe/services/api";
import { sendRequest } from "@tbe/utils";

const mockSendRequest = vi.mocked(sendRequest);
const mockGet = vi.mocked(apiClient.get);
const mockPost = vi.mocked(apiClient.post);

describe("quizApi Service", () => {
  let consoleErrorSpy: any;

  beforeEach(() => {
    vi.clearAllMocks();
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe("getCategories", () => {
    it("should fetch quiz categories", async () => {
      const mockResponse = {
        success: true,
        data: [{ id: "1", categoryName: "JavaScript" }],
      };
      mockSendRequest.mockResolvedValue(mockResponse);

      const result = await quizApi.getCategories();

      expect(mockSendRequest).toHaveBeenCalled();
      expect(result).toEqual(mockResponse);
    });

    it("should handle errors", async () => {
      const error = new Error("Failed to fetch");
      mockSendRequest.mockRejectedValue(error);

      await expect(quizApi.getCategories()).rejects.toThrow("Failed to fetch");
    });
  });

  describe("getQuestions", () => {
    it("should fetch quiz questions", async () => {
      const mockData = {
        success: true,
        data: [
          { question: "What is React?", options: ["A", "B"], correctAnswer: 0 },
        ],
      };
      mockSendRequest.mockResolvedValue(mockData);

      const result = await quizApi.getQuestions("quiz-123");

      expect(mockSendRequest).toHaveBeenCalled();
      expect(result).toEqual(mockData);
    });

    it("should throw error when fetch fails", async () => {
      const error = new Error("Failed to fetch quiz questions");
      mockSendRequest.mockRejectedValue(error);

      await expect(quizApi.getQuestions("quiz-123")).rejects.toThrow(
        "Failed to fetch quiz questions",
      );
    });
  });

  describe("startSession", () => {
    it("should start a quiz session", async () => {
      const mockData = {
        success: true,
        data: { sessionId: "session-123", currentQuestion: {} },
      };
      mockSendRequest.mockResolvedValue(mockData);

      const payload = {
        userId: "user-123",
        quizId: "quiz-123",
        difficulty: "medium" as const,
        questionCount: 10,
      };

      const result = await quizApi.startSession(payload);

      expect(mockSendRequest).toHaveBeenCalled();
      expect(result).toEqual(mockData);
    });

    it("should throw error when session start fails", async () => {
      const error = new Error("Failed to start quiz session");
      mockSendRequest.mockRejectedValue(error);

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
      const mockData = {
        success: true,
        data: { isCorrect: true, nextQuestion: {} },
      };
      mockSendRequest.mockResolvedValue(mockData);

      const result = await quizApi.submitAnswer("session-123", {
        questionIndex: 0,
        answer: 1,
        timeSpent: 30,
      });

      expect(mockSendRequest).toHaveBeenCalled();
      expect(result).toEqual(mockData);
    });

    it("should throw error when answer submission fails", async () => {
      const error = new Error("Failed to submit answer");
      mockSendRequest.mockRejectedValue(error);

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
      const mockData = {
        success: true,
        data: { completed: true, score: 85 },
      };
      mockSendRequest.mockResolvedValue(mockData);

      const result = await quizApi.completeSession("session-123");

      expect(mockSendRequest).toHaveBeenCalled();
      expect(result).toEqual(mockData);
    });

    it("should throw error when completion fails", async () => {
      const error = new Error("Failed to complete quiz session");
      mockSendRequest.mockRejectedValue(error);

      await expect(quizApi.completeSession("session-123")).rejects.toThrow(
        "Failed to complete quiz session",
      );
    });
  });

  describe("submitAttempt", () => {
    it("should submit quiz attempt using apiClient", async () => {
      const mockResponse = {
        success: true,
        data: { score: 85, totalQuestions: 10 },
      };
      mockSendRequest.mockResolvedValue(mockResponse);

      const result = await quizApi.submitAttempt("quiz-123", {
        userId: "user-123",
        answers: [0, 1, 2],
        timeTaken: 300,
      });

      expect(mockSendRequest).toHaveBeenCalled();
      expect(result).toEqual(mockResponse);
    });

    it("should handle errors in submitAttempt", async () => {
      const error = new Error("Submission failed");
      mockSendRequest.mockRejectedValue(error);

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
