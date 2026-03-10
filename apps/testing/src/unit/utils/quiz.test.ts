import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { cleanOptionText, quizService } from "@tbe/utils/quiz";

// Mock dependencies
vi.mock("@tbe/utils/api", () => ({
  sendRequest: vi.fn(),
}));

vi.mock("@tbe/utils/analytics", () => ({
  trackEvent: vi.fn(),
}));

import { sendRequest } from "@tbe/utils/api";
import { trackEvent } from "@tbe/utils/analytics";

const mockSendRequest = vi.mocked(sendRequest);
const mockTrackEvent = vi.mocked(trackEvent);

describe("Quiz Utilities", () => {
  let consoleErrorSpy: any;

  beforeEach(() => {
    vi.clearAllMocks();
    // Suppress console.error for expected error cases
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe("cleanOptionText", () => {
    it("should remove uppercase letter prefix with dot", () => {
      expect(cleanOptionText("A. Option text")).toBe("Option text");
    });

    it("should remove number prefix with dot", () => {
      expect(cleanOptionText("1. Option text")).toBe("Option text");
    });

    it("should remove prefix with parenthesis", () => {
      expect(cleanOptionText("A) Option text")).toBe("Option text");
    });

    it("should remove prefix with space", () => {
      expect(cleanOptionText("A  Option text")).toBe("Option text");
    });

    it("should handle text without prefix", () => {
      expect(cleanOptionText("Option text")).toBe("Option text");
    });

    it("should handle empty string", () => {
      expect(cleanOptionText("")).toBe("");
    });

    it("should handle null or undefined", () => {
      expect(cleanOptionText(null as any)).toBe("");
      expect(cleanOptionText(undefined as any)).toBe("");
    });

    it("should trim whitespace", () => {
      expect(cleanOptionText("A.  Option text  ")).toBe("Option text");
    });

    it("should handle multiple spaces after prefix", () => {
      expect(cleanOptionText("A.    Option text")).toBe("Option text");
    });
  });

  describe("quizService.getCategories", () => {
    it("should fetch quiz categories successfully", async () => {
      const mockResponse = {
        success: true,
        data: [
          { id: "1", categoryName: "JavaScript" },
          { id: "2", categoryName: "React" },
        ],
      };
      mockSendRequest.mockResolvedValue(mockResponse);

      const result = await quizService.getCategories();

      expect(mockSendRequest).toHaveBeenCalledWith({
        url: "/api/v1/quiz",
        method: "GET",
      });
      expect(result).toEqual(mockResponse.data);
    });

    it("should return empty array when no data", async () => {
      mockSendRequest.mockResolvedValue({
        success: true,
        data: null,
      });

      const result = await quizService.getCategories();

      expect(result).toEqual([]);
    });

    it("should throw error when request fails", async () => {
      mockSendRequest.mockResolvedValue({
        success: false,
      });

      await expect(quizService.getCategories()).rejects.toThrow(
        "Failed to fetch quiz categories",
      );
    });

    it("should handle network errors", async () => {
      const error = new Error("Network error");
      mockSendRequest.mockRejectedValue(error);

      await expect(quizService.getCategories()).rejects.toThrow(
        "Network error",
      );
    });
  });

  describe("quizService.getQuestions", () => {
    it("should fetch quiz questions successfully", async () => {
      const mockResponse = {
        success: true,
        data: [
          {
            question: "What is React?",
            options: ["A", "B"],
            correctAnswer: 0,
          },
        ],
      };
      mockSendRequest.mockResolvedValue(mockResponse);

      const result = await quizService.getQuestions("quiz-123");

      expect(mockSendRequest).toHaveBeenCalledWith({
        url: "/api/v1/quiz/quiz-123",
        method: "GET",
      });
      expect(result).toEqual(mockResponse.data);
    });

    it("should return empty array when no data", async () => {
      mockSendRequest.mockResolvedValue({
        success: true,
        data: null,
      });

      const result = await quizService.getQuestions("quiz-123");

      expect(result).toEqual([]);
    });
  });

  describe("quizService.startSession", () => {
    it("should start quiz session successfully", async () => {
      const mockSession = {
        sessionId: "session-123",
        categoryName: "JavaScript",
        difficulty: "medium",
        questionCount: 10,
      };
      mockSendRequest.mockResolvedValue({
        success: true,
        data: mockSession,
      });

      const result = await quizService.startSession("quiz-123", "medium", 10);

      expect(mockSendRequest).toHaveBeenCalledWith({
        url: "/api/v1/quiz/session/start",
        method: "POST",
        data: {
          quizId: "quiz-123",
          difficulty: "medium",
          questionCount: 10,
        },
      });
      expect(result).toEqual(mockSession);
      expect(mockTrackEvent).toHaveBeenCalledWith("quiz_session_start", {
        action: "quiz_session_start",
        category: "quiz",
        label: "quiz-123",
        value: 10,
      });
    });

    it("should handle tracking errors gracefully", async () => {
      mockSendRequest.mockResolvedValue({
        success: true,
        data: { sessionId: "session-123" },
      });
      mockTrackEvent.mockImplementation(() => {
        throw new Error("Tracking error");
      });

      const result = await quizService.startSession("quiz-123", "medium", 10);

      // Should still return result even if tracking fails
      expect(result).toBeDefined();
    });
  });

  describe("quizService.submitAnswer", () => {
    it("should submit answer successfully", async () => {
      const mockResult = {
        isCorrect: true,
        explanation: "Correct!",
      };
      mockSendRequest.mockResolvedValue({
        success: true,
        data: mockResult,
      });

      const result = await quizService.submitAnswer("session-123", 0, 1);

      expect(mockSendRequest).toHaveBeenCalledWith({
        url: "/api/v1/quiz/session/answer",
        method: "POST",
        data: {
          sessionId: "session-123",
          questionIndex: 0,
          selectedOption: 1,
        },
      });
      expect(result).toEqual(mockResult);
      expect(mockTrackEvent).toHaveBeenCalled();
    });
  });

  describe("quizService.completeSession", () => {
    it("should complete quiz session successfully", async () => {
      const mockResult = {
        score: 85,
        totalQuestions: 10,
        correctAnswers: 8.5,
      };
      mockSendRequest.mockResolvedValue({
        success: true,
        data: mockResult,
      });

      const result = await quizService.completeSession("session-123");

      expect(mockSendRequest).toHaveBeenCalledWith({
        url: "/api/v1/quiz/session/session-123/complete",
        method: "POST",
      });
      expect(result).toEqual(mockResult);
      expect(mockTrackEvent).toHaveBeenCalledWith("quiz_session_complete", {
        action: "quiz_session_complete",
        category: "quiz",
        sessionId: "session-123",
      });
    });
  });

  describe("quizService.getLeaderboard", () => {
    it("should get leaderboard without quizId", async () => {
      const mockLeaderboard = [
        { rank: 1, userId: "user-1", score: 100 },
        { rank: 2, userId: "user-2", score: 95 },
      ];
      mockSendRequest.mockResolvedValue({
        success: true,
        data: mockLeaderboard,
      });

      const result = await quizService.getLeaderboard(undefined, 10);

      expect(mockSendRequest).toHaveBeenCalledWith({
        url: "/api/v1/quiz/leaderboard?limit=10",
        method: "GET",
      });
      expect(result).toEqual(mockLeaderboard);
    });

    it("should get leaderboard with quizId", async () => {
      mockSendRequest.mockResolvedValue({
        success: true,
        data: [],
      });

      await quizService.getLeaderboard("quiz-123", 20);

      expect(mockSendRequest).toHaveBeenCalledWith({
        url: "/api/v1/quiz/leaderboard?quizId=quiz-123&limit=20",
        method: "GET",
      });
    });
  });
});
