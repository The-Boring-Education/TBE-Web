import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import useUser from "@tbe/hooks/useUser";

// Mock next-auth/react
const mockUseSession = vi.fn();
const mockUpdate = vi.fn();

vi.mock("next-auth/react", () => ({
  useSession: () => mockUseSession(),
}));

describe("useUser Hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Loading State", () => {
    it("should return loading true when session status is loading", () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: "loading",
        update: mockUpdate,
      });

      const { result } = renderHook(() => useUser());

      expect(result.current.loading).toBe(true);
    });

    it("should return loading false when session status is not loading", () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: "unauthenticated",
        update: mockUpdate,
      });

      const { result } = renderHook(() => useUser());

      expect(result.current.loading).toBe(false);
    });
  });

  describe("Authentication State", () => {
    it("should return isAuth true when user session exists", () => {
      const mockUser = {
        id: "123",
        name: "Test User",
        email: "test@example.com",
        isOnboarded: true,
      };

      mockUseSession.mockReturnValue({
        data: {
          user: mockUser,
        },
        status: "authenticated",
        update: mockUpdate,
      });

      const { result } = renderHook(() => useUser());

      expect(result.current.isAuth).toBe(true);
      expect(result.current.user).toEqual(mockUser);
    });

    it("should return isAuth false when no user session", () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: "unauthenticated",
        update: mockUpdate,
      });

      const { result } = renderHook(() => useUser());

      expect(result.current.isAuth).toBe(false);
      expect(result.current.user).toBe(null);
    });
  });

  describe("Onboarding State", () => {
    it("should return isOnboarded true when user is onboarded", () => {
      const mockUser = {
        id: "123",
        name: "Test User",
        email: "test@example.com",
        isOnboarded: true,
      };

      mockUseSession.mockReturnValue({
        data: {
          user: mockUser,
        },
        status: "authenticated",
        update: mockUpdate,
      });

      const { result } = renderHook(() => useUser());

      expect(result.current.isOnboarded).toBe(true);
    });

    it("should return isOnboarded false when user is not onboarded", () => {
      const mockUser = {
        id: "123",
        name: "Test User",
        email: "test@example.com",
        isOnboarded: false,
      };

      mockUseSession.mockReturnValue({
        data: {
          user: mockUser,
        },
        status: "authenticated",
        update: mockUpdate,
      });

      const { result } = renderHook(() => useUser());

      expect(result.current.isOnboarded).toBe(false);
    });
  });

  describe("Session Updates", () => {
    it("should provide updateSession function", () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: "unauthenticated",
        update: mockUpdate,
      });

      const { result } = renderHook(() => useUser());

      expect(result.current.updateSession).toBe(mockUpdate);
    });

    it("should update when session changes", () => {
      const mockUser = {
        id: "123",
        name: "Test User",
        email: "test@example.com",
        isOnboarded: true,
      };

      mockUseSession.mockReturnValue({
        data: null,
        status: "unauthenticated",
        update: mockUpdate,
      });

      const { result, rerender } = renderHook(() => useUser());

      expect(result.current.isAuth).toBe(false);

      // Update session
      mockUseSession.mockReturnValue({
        data: {
          user: mockUser,
        },
        status: "authenticated",
        update: mockUpdate,
      });

      rerender();

      expect(result.current.isAuth).toBe(true);
      expect(result.current.user).toEqual(mockUser);
    });
  });

  describe("Return Values", () => {
    it("should return correct structure", () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: "unauthenticated",
        update: mockUpdate,
      });

      const { result } = renderHook(() => useUser());

      expect(result.current).toHaveProperty("user");
      expect(result.current).toHaveProperty("isAuth");
      expect(result.current).toHaveProperty("loading");
      expect(result.current).toHaveProperty("isOnboarded");
      expect(result.current).toHaveProperty("updateSession");
    });
  });
});
