import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockPush = vi.fn();
const mockReplace = vi.fn();

vi.mock("next/router", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
}));

import useOptimizedNavigation from "@tbe/hooks/useOptimizedNavigation";

describe("useOptimizedNavigation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("starts with isNavigating false", () => {
    const { result } = renderHook(() => useOptimizedNavigation());

    expect(result.current.isNavigating).toBe(false);
  });

  it("navigateTo pushes to the given href and resets isNavigating when done", async () => {
    mockPush.mockResolvedValue(true);
    const { result } = renderHook(() => useOptimizedNavigation());

    await act(async () => {
      await result.current.navigateTo("/dashboard");
    });

    expect(mockPush).toHaveBeenCalledWith("/dashboard", undefined, undefined);
    expect(result.current.isNavigating).toBe(false);
  });

  it("navigateTo replaces instead of pushing when replace option is set", async () => {
    mockReplace.mockResolvedValue(true);
    const { result } = renderHook(() => useOptimizedNavigation());

    await act(async () => {
      await result.current.navigateTo("/login", { replace: true });
    });

    expect(mockReplace).toHaveBeenCalledWith(
      "/login",
      undefined,
      expect.objectContaining({ replace: true }),
    );
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("navigateTo resets isNavigating even when the router push rejects", async () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    mockPush.mockRejectedValue(new Error("navigation failed"));

    const { result } = renderHook(() => useOptimizedNavigation());

    await act(async () => {
      await result.current.navigateTo("/broken");
    });

    expect(result.current.isNavigating).toBe(false);
    expect(consoleErrorSpy).toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });

  it("navigateWithLoading sets isNavigating immediately and eventually navigates", async () => {
    mockPush.mockResolvedValue(true);
    const { result } = renderHook(() => useOptimizedNavigation());

    act(() => {
      result.current.navigateWithLoading("/profile");
    });

    expect(result.current.isNavigating).toBe(true);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/profile", undefined, undefined);
    });
  });
});
