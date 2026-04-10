import { renderHookWithQuery } from "@test-utils/query-wrapper";
import { waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockFetch = vi.fn();

vi.stubGlobal("fetch", mockFetch);

import { usePyGamification } from "@tbe/hooks/usePyGamification";

describe("usePyGamification", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_API_URL = "http://api.test";
  });

  it("does not fetch when userId is missing", () => {
    renderHookWithQuery(() => usePyGamification(undefined));

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("maps API points and derives level metadata for Prep gamification", async () => {
    mockFetch.mockResolvedValue({
      json: async () => ({
        success: true,
        data: { points: 600, actions: [] },
      }),
    });

    const { result } = renderHookWithQuery(() => usePyGamification("user-1"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockFetch).toHaveBeenCalledWith(
      "http://api.test/gamification?userId=user-1",
    );
    expect(result.current.points).toBe(600);
    expect(result.current.currentLevel).toBe(2);
    expect(result.current.currentLevelName).toBe("Coder");
    expect(result.current.actions).toEqual([]);
  });

  it("surfaces error state when API returns success false", async () => {
    mockFetch.mockResolvedValue({
      json: async () => ({
        success: false,
        message: "nope",
      }),
    });

    const { result } = renderHookWithQuery(() => usePyGamification("user-2"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeTruthy();
  });
});
