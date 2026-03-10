import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock apiClient from base first
vi.mock("@tbe/services/base", () => {
  const mockGet = vi.fn();
  const mockPost = vi.fn();
  const mockPut = vi.fn();
  const mockDelete = vi.fn();

  return {
    apiClient: {
      get: mockGet,
      post: mockPost,
      put: mockPut,
      delete: mockDelete,
    },
    APIError: class APIError extends Error {
      constructor(message: string) {
        super(message);
        this.name = "APIError";
      }
    },
    // Export mocks for use in tests
    __mocks: {
      mockGet,
      mockPost,
      mockPut,
      mockDelete,
    },
  };
});

// Import after mocks
import {
  userApi,
  authApi,
  analyticsApi,
  leaderboardApi,
  userProfileApi,
  gamificationApi,
} from "@tbe/services";
import { apiClient } from "@tbe/services/base";

const mockGet = vi.mocked(apiClient.get);
const mockPost = vi.mocked(apiClient.post);

describe("API Services", () => {
  let consoleErrorSpy: any;

  beforeEach(() => {
    vi.clearAllMocks();
    // Suppress console.error for expected error cases
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe("userApi", () => {
    it("should create or find user", async () => {
      const mockResponse = { data: { id: "123", name: "Test User" } };
      mockPost.mockResolvedValue(mockResponse);

      const result = await userApi.createOrFindUser({
        name: "Test User",
        email: "test@example.com",
        provider: "google",
        providerAccountId: "123",
      });

      expect(mockPost).toHaveBeenCalled();
      expect(result).toEqual(mockResponse);
    });

    it("should get user by email", async () => {
      const mockResponse = { data: { id: "123" } };
      mockGet.mockResolvedValue(mockResponse);

      const result = await userApi.getUserByEmail("test@example.com");

      expect(mockGet).toHaveBeenCalled();
      expect(result).toEqual(mockResponse);
    });

    it("should get user by ID", async () => {
      const mockResponse = { data: { id: "123" } };
      mockGet.mockResolvedValue(mockResponse);

      const result = await userApi.getUserById("123");

      expect(mockGet).toHaveBeenCalled();
      expect(result).toEqual(mockResponse);
    });

    it("should onboard user", async () => {
      const mockResponse = { data: { success: true } };
      mockPost.mockResolvedValue(mockResponse);

      const result = await userApi.onboardUser("123", {
        userName: "testuser",
        occupation: "developer",
        purpose: ["learning"],
      });

      expect(mockPost).toHaveBeenCalled();
      expect(result).toEqual(mockResponse);
    });

    it("should check username availability", async () => {
      const mockResponse = { data: { available: true } };
      mockGet.mockResolvedValue(mockResponse);

      const result = await userApi.checkUsername("testuser");

      expect(mockGet).toHaveBeenCalled();
      expect(result).toEqual(mockResponse);
    });

    it("should handle errors in createOrFindUser", async () => {
      const error = new Error("Network error");
      mockPost.mockRejectedValue(error);

      await expect(
        userApi.createOrFindUser({
          name: "Test",
          email: "test@example.com",
          provider: "google",
          providerAccountId: "123",
        }),
      ).rejects.toThrow("Network error");
    });
  });

  describe("authApi", () => {
    it("should get session", async () => {
      const mockResponse = { data: { user: { id: "123" } } };
      mockGet.mockResolvedValue(mockResponse);

      const result = await authApi.getSession();

      expect(mockGet).toHaveBeenCalled();
      expect(result).toEqual(mockResponse);
    });

    it("should sign out", async () => {
      const mockResponse = { data: { success: true } };
      mockPost.mockResolvedValue(mockResponse);

      const result = await authApi.signOut();

      expect(mockPost).toHaveBeenCalled();
      expect(result).toEqual(mockResponse);
    });
  });

  describe("analyticsApi", () => {
    it("should get performance metrics", async () => {
      const mockResponse = {
        data: {
          success: true,
          data: { totalQuizzes: 10, averageScore: 85 },
        },
      };
      mockGet.mockResolvedValue(mockResponse);

      const result = await analyticsApi.getPerformanceMetrics("123");

      expect(mockGet).toHaveBeenCalled();
      expect(result).toEqual(mockResponse);
    });

    it("should get category performance", async () => {
      const mockResponse = {
        data: {
          success: true,
          data: [{ category: "JavaScript", score: 90 }],
        },
      };
      mockGet.mockResolvedValue(mockResponse);

      const result = await analyticsApi.getCategoryPerformance("123");

      expect(mockGet).toHaveBeenCalled();
      expect(result).toEqual(mockResponse);
    });
  });

  describe("leaderboardApi", () => {
    it("should get leaderboard", async () => {
      const mockResponse = {
        data: {
          success: true,
          data: [{ rank: 1, userId: "123", score: 100 }],
        },
      };
      mockGet.mockResolvedValue(mockResponse);

      const result = await leaderboardApi.getLeaderboard(50);

      expect(mockGet).toHaveBeenCalled();
      expect(result).toEqual(mockResponse);
    });

    it("should get user rank", async () => {
      const mockResponse = {
        data: {
          success: true,
          data: { rank: 5 },
        },
      };
      mockGet.mockResolvedValue(mockResponse);

      const result = await leaderboardApi.getUserRank("123");

      expect(mockGet).toHaveBeenCalled();
      expect(result).toEqual(mockResponse);
    });
  });

  describe("gamificationApi", () => {
    it("should get user gamification points", async () => {
      const mockResponse = {
        data: {
          success: true,
          data: { points: 1000 },
        },
      };
      mockGet.mockResolvedValue(mockResponse);

      const result = await gamificationApi.getuserGamificationPoints("123");

      expect(mockGet).toHaveBeenCalled();
      expect(result).toEqual(mockResponse);
    });

    it("should update user gamification points", async () => {
      const mockResponse = {
        data: {
          success: true,
          data: { points: 1100 },
        },
      };
      mockPost.mockResolvedValue(mockResponse);

      const result = await gamificationApi.updateuserGamificationPoints({
        userId: "123",
        actionType: "quiz_completed",
      });

      expect(mockPost).toHaveBeenCalled();
      expect(result).toEqual(mockResponse);
    });
  });
});
