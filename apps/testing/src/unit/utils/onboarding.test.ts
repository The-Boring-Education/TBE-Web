import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  checkUsernameAvailable,
  getOnboardingUser,
} from "@tbe/utils/onboarding";

// Mock sendRequest
vi.mock("@tbe/utils/api", () => ({
  sendRequest: vi.fn(),
}));

import { sendRequest } from "@tbe/utils/api";

const mockSendRequest = vi.mocked(sendRequest);

describe("Onboarding Utilities", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("checkUsernameAvailable", () => {
    it("should return true when username is available", async () => {
      mockSendRequest.mockResolvedValue({
        success: true,
        data: { available: true },
      });

      const result = await checkUsernameAvailable("testuser");

      expect(mockSendRequest).toHaveBeenCalledWith({
        url: "/user/username-check?username=testuser",
        method: "GET",
        headers: {},
      });
      expect(result).toBe(true);
    });

    it("should return false when username is not available", async () => {
      mockSendRequest.mockResolvedValue({
        success: true,
        data: { available: false },
      });

      const result = await checkUsernameAvailable("takenuser");

      expect(result).toBe(false);
    });

    it("should return false when request fails", async () => {
      mockSendRequest.mockResolvedValue({
        success: false,
      });

      const result = await checkUsernameAvailable("testuser");

      expect(result).toBe(false);
    });

    it("should return false when data.available is not true", async () => {
      mockSendRequest.mockResolvedValue({
        success: true,
        data: { available: false },
      });

      const result = await checkUsernameAvailable("testuser");

      expect(result).toBe(false);
    });

    it("should include authorization header when token provided", async () => {
      mockSendRequest.mockResolvedValue({
        success: true,
        data: { available: true },
      });

      await checkUsernameAvailable("testuser", "token-123");

      expect(mockSendRequest).toHaveBeenCalledWith({
        url: "/user/username-check?username=testuser",
        method: "GET",
        headers: { Authorization: "Bearer token-123" },
      });
    });

    it("should handle network errors gracefully", async () => {
      mockSendRequest.mockRejectedValue(new Error("Network error"));

      const result = await checkUsernameAvailable("testuser");

      expect(result).toBe(false);
    });

    it("should handle missing data property", async () => {
      mockSendRequest.mockResolvedValue({
        success: true,
        data: null,
      });

      const result = await checkUsernameAvailable("testuser");

      expect(result).toBe(false);
    });
  });

  describe("getOnboardingUser", () => {
    it("should fetch user successfully", async () => {
      const mockUser = {
        _id: "user-123",
        name: "Test User",
        email: "test@example.com",
      };
      mockSendRequest.mockResolvedValue({
        success: true,
        data: mockUser,
      });

      const result = await getOnboardingUser("user-123");

      expect(mockSendRequest).toHaveBeenCalledWith({
        url: "/user?userId=user-123",
        method: "GET",
        headers: {},
      });
      expect(result).toEqual(mockUser);
    });

    it("should return null when request fails", async () => {
      mockSendRequest.mockResolvedValue({
        success: false,
      });

      const result = await getOnboardingUser("user-123");

      expect(result).toBeNull();
    });

    it("should include authorization header when token provided", async () => {
      const mockUser = { _id: "user-123", name: "Test" };
      mockSendRequest.mockResolvedValue({
        success: true,
        data: mockUser,
      });

      await getOnboardingUser("user-123", "token-123");

      expect(mockSendRequest).toHaveBeenCalledWith({
        url: "/user?userId=user-123",
        method: "GET",
        headers: { Authorization: "Bearer token-123" },
      });
    });

    it("should handle network errors gracefully", async () => {
      mockSendRequest.mockRejectedValue(new Error("Network error"));

      const result = await getOnboardingUser("user-123");

      expect(result).toBeNull();
    });

    it("should return null when success is false", async () => {
      mockSendRequest.mockResolvedValue({
        success: false,
        data: { _id: "user-123" },
      });

      const result = await getOnboardingUser("user-123");

      expect(result).toBeNull();
    });
  });
});
