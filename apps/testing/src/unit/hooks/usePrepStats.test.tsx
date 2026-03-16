import { renderHookWithQuery } from "@test-utils/query-wrapper";
import { waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetByUserId = vi.fn();

vi.mock("@tbe/services", () => ({
  prepStatsService: {
    getByUserId: (...args: any[]) => mockGetByUserId(...args),
  },
}));

import { usePrepStats } from "@tbe/hooks/usePrepStats";

describe("usePrepStats", () => {
  const mockStats = {
    currentStreak: 5,
    longestStreak: 12,
    totalLogs: 30,
    hasLoggedToday: true,
    recentLogs: 3,
    lastLoggedDate: "2026-03-15",
    weeklyLogs: [{ timeSpent: 30 }, { timeSpent: 45 }, { timeSpent: 60 }],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not fetch when userId is empty", () => {
    renderHookWithQuery(() => usePrepStats(""));
    expect(mockGetByUserId).not.toHaveBeenCalled();
  });

  it("fetches when userId is provided", async () => {
    mockGetByUserId.mockResolvedValue(mockStats);
    renderHookWithQuery(() => usePrepStats("user-1"));

    await waitFor(() => {
      expect(mockGetByUserId).toHaveBeenCalledWith("user-1");
    });
  });

  it("returns loading initially", () => {
    mockGetByUserId.mockReturnValue(new Promise(() => {}));
    const { result } = renderHookWithQuery(() => usePrepStats("user-1"));
    expect(result.current.loading).toBe(true);
  });

  it("computes totalTimeSpent from weeklyLogs", async () => {
    mockGetByUserId.mockResolvedValue(mockStats);
    const { result } = renderHookWithQuery(() => usePrepStats("user-1"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.totalTimeSpent).toBe(135); // 30 + 45 + 60
  });

  it("computes averageTimePerSession", async () => {
    mockGetByUserId.mockResolvedValue(mockStats);
    const { result } = renderHookWithQuery(() => usePrepStats("user-1"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // 135 / 30 = 4.5
    expect(result.current.averageTimePerSession).toBe(4.5);
  });

  it("returns zero averageTimePerSession when totalLogs is 0", async () => {
    mockGetByUserId.mockResolvedValue({
      ...mockStats,
      totalLogs: 0,
      weeklyLogs: [],
    });
    const { result } = renderHookWithQuery(() => usePrepStats("user-1"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.averageTimePerSession).toBe(0);
  });

  it("passes through streak fields", async () => {
    mockGetByUserId.mockResolvedValue(mockStats);
    const { result } = renderHookWithQuery(() => usePrepStats("user-1"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.currentStreak).toBe(5);
    expect(result.current.longestStreak).toBe(12);
    expect(result.current.hasLoggedToday).toBe(true);
  });

  it("returns defaults when stats is null", async () => {
    mockGetByUserId.mockResolvedValue(null);
    const { result } = renderHookWithQuery(() => usePrepStats("user-1"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.stats).toBeNull();
    expect(result.current.currentStreak).toBe(0);
    expect(result.current.longestStreak).toBe(0);
    expect(result.current.totalLogs).toBe(0);
    expect(result.current.totalTimeSpent).toBe(0);
    expect(result.current.weeklyLogs).toEqual([]);
  });

  it("returns error on failure", async () => {
    mockGetByUserId.mockRejectedValue(new Error("Fetch failed"));
    const { result } = renderHookWithQuery(() => usePrepStats("user-1"));

    await waitFor(() => {
      expect(result.current.error).toBe("Fetch failed");
    });
  });
});
