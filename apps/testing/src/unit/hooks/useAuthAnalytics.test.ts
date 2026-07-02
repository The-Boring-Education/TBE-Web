import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockSetAnalyticsUser = vi.fn();
const mockClearAnalyticsUser = vi.fn();
const mockTrackLoginSuccess = vi.fn();
const mockTrackSignupSuccess = vi.fn();
const mockTrackLogout = vi.fn();

vi.mock("@tbe/utils", () => ({
  setAnalyticsUser: (...args: unknown[]) => mockSetAnalyticsUser(...args),
  clearAnalyticsUser: (...args: unknown[]) => mockClearAnalyticsUser(...args),
  trackLoginSuccess: (...args: unknown[]) => mockTrackLoginSuccess(...args),
  trackSignupSuccess: (...args: unknown[]) => mockTrackSignupSuccess(...args),
  trackLogout: (...args: unknown[]) => mockTrackLogout(...args),
  PENDING_AUTH_ANALYTICS_KEY: "tbe_pending_auth_analytics",
}));

const mockUseAuth = vi.fn();

vi.mock("@tbe/auth", () => ({
  useAuth: () => mockUseAuth(),
}));

import useAuthAnalytics from "@tbe/hooks/useAuthAnalytics";

describe("useAuthAnalytics", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: false,
    });
  });

  it("fires signup analytics from pending session storage", async () => {
    sessionStorage.setItem(
      "tbe_pending_auth_analytics",
      JSON.stringify({ userId: "user-1", isNewUser: true }),
    );

    renderHook(() => useAuthAnalytics());

    await waitFor(() => {
      expect(mockSetAnalyticsUser).toHaveBeenCalledWith("user-1");
      expect(mockTrackSignupSuccess).toHaveBeenCalledWith("user-1");
    });
  });

  it("fires login analytics from pending session storage", async () => {
    sessionStorage.setItem(
      "tbe_pending_auth_analytics",
      JSON.stringify({ userId: "user-2", isNewUser: false }),
    );

    renderHook(() => useAuthAnalytics());

    await waitFor(() => {
      expect(mockTrackLoginSuccess).toHaveBeenCalledWith("user-2");
    });
  });

  it("tracks logout when user becomes unauthenticated", async () => {
    mockUseAuth.mockReturnValue({
      user: { id: "user-3" },
      isLoading: false,
    });

    const { rerender } = renderHook(() => useAuthAnalytics());

    await waitFor(() => {
      expect(mockSetAnalyticsUser).toHaveBeenCalledWith("user-3");
    });

    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: false,
    });

    rerender();

    await waitFor(() => {
      expect(mockTrackLogout).toHaveBeenCalledWith("user-3");
      expect(mockClearAnalyticsUser).toHaveBeenCalled();
    });
  });
});
