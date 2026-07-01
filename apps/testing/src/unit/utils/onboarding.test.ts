import {
  checkUsernameAvailable,
  formatGoalTimelineLabel,
  getOnboardingUser,
} from "@tbe/utils/onboarding";
import { beforeEach, describe, expect, it, vi } from "vitest";

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
        status: true,
      });

      const result = await checkUsernameAvailable("testuser");

      expect(mockSendRequest).toHaveBeenCalledWith({
        url: "/user/onboarding?userName=testuser",
        method: "GET",
        headers: {},
        baseURL: undefined,
      });
      expect(result).toBe(true);
    });

    it("should return false when username is not available", async () => {
      mockSendRequest.mockResolvedValue({
        success: true,
        status: false,
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

    it("should return false when status is not true", async () => {
      mockSendRequest.mockResolvedValue({
        success: true,
        status: false,
      });

      const result = await checkUsernameAvailable("testuser");

      expect(result).toBe(false);
    });

    it("should include authorization header when token provided", async () => {
      mockSendRequest.mockResolvedValue({
        success: true,
        status: true,
      });

      await checkUsernameAvailable("testuser", "token-123");

      expect(mockSendRequest).toHaveBeenCalledWith({
        url: "/user/onboarding?userName=testuser",
        method: "GET",
        headers: { Authorization: "Bearer token-123" },
        baseURL: undefined,
      });
    });

    it("should pass apiBaseUrl to sendRequest", async () => {
      mockSendRequest.mockResolvedValue({ success: true, status: true });

      await checkUsernameAvailable(
        "u",
        undefined,
        "https://api.example.com/api/v1",
      );

      expect(mockSendRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: "https://api.example.com/api/v1",
        }),
      );
    });

    it("should handle network errors gracefully", async () => {
      mockSendRequest.mockRejectedValue(new Error("Network error"));

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
        baseURL: undefined,
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
        baseURL: undefined,
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

  describe("formatGoalTimelineLabel", () => {
    it("should return empty string for undefined, null, or empty string", () => {
      expect(formatGoalTimelineLabel()).toBe("");
      expect(formatGoalTimelineLabel(null)).toBe("");
      expect(formatGoalTimelineLabel("")).toBe("");
    });

    it("should return correct labels for known raw formats", () => {
      expect(formatGoalTimelineLabel("3_months")).toBe("3 Months");
      expect(formatGoalTimelineLabel("6_months")).toBe("6 Months");
      expect(formatGoalTimelineLabel("1_year")).toBe("1 Year");
      expect(formatGoalTimelineLabel("3Months")).toBe("3 Months");
      expect(formatGoalTimelineLabel("6Months")).toBe("6 Months");
      expect(formatGoalTimelineLabel("1Year")).toBe("1 Year");
    });

    it("should fall back to humanizing other formats", () => {
      expect(formatGoalTimelineLabel("2_years")).toBe("2 Years");
      expect(formatGoalTimelineLabel("18Months")).toBe("18 Months");
      expect(formatGoalTimelineLabel("four_months")).toBe("Four Months");
      expect(formatGoalTimelineLabel("  5_months  ")).toBe("5 Months");
    });
  });
});
