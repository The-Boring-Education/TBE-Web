import { useAdmin } from "@tbe/hooks";
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetAuthApiUrl = vi.fn();
const mockUseAuth = vi.fn();

vi.mock("@tbe/auth", () => ({
  getAuthApiUrl: () => mockGetAuthApiUrl(),
  useAuth: () => mockUseAuth(),
}));

describe("useAdmin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("fetch", vi.fn());
    document.cookie = "tbe_access_token=test-token";
  });

  it("uses getAuthApiUrl for /admin/me requests", async () => {
    mockGetAuthApiUrl.mockReturnValue("http://localhost:3004/api/v1");
    mockUseAuth.mockReturnValue({
      user: { email: "admin@example.com" },
      isLoading: false,
    });

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        data: { isAdmin: true, admin: { email: "admin@example.com" } },
      }),
    } as Response);

    const { result } = renderHook(() => useAdmin());

    await waitFor(() => {
      expect(result.current.isAdmin).toBe(true);
    });

    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:3004/api/v1/admin/me",
      expect.objectContaining({
        headers: { Authorization: "Bearer test-token" },
      }),
    );
  });

  it("returns isAdmin false when admin check fails", async () => {
    mockGetAuthApiUrl.mockReturnValue("http://localhost:3004/api/v1");
    mockUseAuth.mockReturnValue({
      user: { email: "user@example.com" },
      isLoading: false,
    });

    vi.mocked(fetch).mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useAdmin());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isAdmin).toBe(false);
    expect(result.current.admin).toBeUndefined();
  });

  it("clears admin state when user signs out", async () => {
    mockGetAuthApiUrl.mockReturnValue("http://localhost:3004/api/v1");
    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: false,
    });

    const { result } = renderHook(() => useAdmin());

    await waitFor(() => {
      expect(result.current.isAdmin).toBe(false);
    });

    expect(fetch).not.toHaveBeenCalled();
  });

  it("refetches admin status on demand", async () => {
    mockGetAuthApiUrl.mockReturnValue("http://localhost:3004/api/v1");
    mockUseAuth.mockReturnValue({
      user: { email: "admin@example.com" },
      isLoading: false,
    });

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        data: { isAdmin: true },
      }),
    } as Response);

    const { result } = renderHook(() => useAdmin());

    await waitFor(() => {
      expect(result.current.isAdmin).toBe(true);
    });

    await act(async () => {
      await result.current.refetchAdminStatus();
    });

    expect(fetch).toHaveBeenCalledTimes(2);
  });
});
