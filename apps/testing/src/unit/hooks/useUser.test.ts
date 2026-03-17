import useUser from "@tbe/hooks/useUser";
import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockRefreshSession = vi.fn();

vi.mock("@tbe/auth", () => ({
  useAuth: () => mockRefreshSession(),
}));

describe("useUser Hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Loading State", () => {
    it("should return loading true when session status is loading", () => {
      mockRefreshSession.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: true,
        signIn: vi.fn(),
        signOut: vi.fn(),
        refreshSession: vi.fn(),
      });

      const { result } = renderHook(() => useUser());

      expect(result.current.loading).toBe(true);
    });

    it("should return loading false when session status is not loading", () => {
      mockRefreshSession.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        signIn: vi.fn(),
        signOut: vi.fn(),
        refreshSession: vi.fn(),
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

      mockRefreshSession.mockReturnValue({
        user: mockUser,
        isAuthenticated: true,
        isLoading: false,
        signIn: vi.fn(),
        signOut: vi.fn(),
        refreshSession: vi.fn(),
      });

      const { result } = renderHook(() => useUser());

      expect(result.current.isAuth).toBe(true);
      expect(result.current.user).toEqual(mockUser);
    });

    it("should return isAuth false when no user session", () => {
      mockRefreshSession.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        signIn: vi.fn(),
        signOut: vi.fn(),
        refreshSession: vi.fn(),
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

      mockRefreshSession.mockReturnValue({
        user: mockUser,
        isAuthenticated: true,
        isLoading: false,
        signIn: vi.fn(),
        signOut: vi.fn(),
        refreshSession: vi.fn(),
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

      mockRefreshSession.mockReturnValue({
        user: mockUser,
        isAuthenticated: true,
        isLoading: false,
        signIn: vi.fn(),
        signOut: vi.fn(),
        refreshSession: vi.fn(),
      });

      const { result } = renderHook(() => useUser());

      expect(result.current.isOnboarded).toBe(false);
    });
  });

  describe("Session Updates", () => {
    it("should provide updateSession function that is refreshSession", () => {
      const refreshSession = vi.fn();
      mockRefreshSession.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        signIn: vi.fn(),
        signOut: vi.fn(),
        refreshSession,
      });

      const { result } = renderHook(() => useUser());

      expect(result.current.updateSession).toBe(refreshSession);
    });

    it("should update when session changes", () => {
      const mockUser = {
        id: "123",
        name: "Test User",
        email: "test@example.com",
        isOnboarded: true,
      };

      mockRefreshSession.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        signIn: vi.fn(),
        signOut: vi.fn(),
        refreshSession: vi.fn(),
      });

      const { result, rerender } = renderHook(() => useUser());

      expect(result.current.isAuth).toBe(false);

      mockRefreshSession.mockReturnValue({
        user: mockUser,
        isAuthenticated: true,
        isLoading: false,
        signIn: vi.fn(),
        signOut: vi.fn(),
        refreshSession: vi.fn(),
      });

      rerender();

      expect(result.current.isAuth).toBe(true);
      expect(result.current.user).toEqual(mockUser);
    });
  });

  describe("Return Values", () => {
    it("should return correct structure", () => {
      mockRefreshSession.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        signIn: vi.fn(),
        signOut: vi.fn(),
        refreshSession: vi.fn(),
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
