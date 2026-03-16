import { renderHookWithQuery } from "@test-utils/query-wrapper";
import { waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetByUserId = vi.fn();

vi.mock("@tbe/services", () => ({
  prepLogsService: {
    getByUserId: (...args: any[]) => mockGetByUserId(...args),
  },
}));

import { usePrepLogs } from "@tbe/hooks/usePrepLogs";

describe("usePrepLogs", () => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const threeDaysAgo = new Date(today);
  threeDaysAgo.setDate(today.getDate() - 3);
  const tenDaysAgo = new Date(today);
  tenDaysAgo.setDate(today.getDate() - 10);

  const mockLogs = [
    {
      _id: "l1",
      user: "u1",
      title: "React Study",
      timeSpent: 60,
      createdAt: today.toISOString(),
      updatedAt: today.toISOString(),
      __v: 0,
    },
    {
      _id: "l2",
      user: "u1",
      title: "Node.js Study",
      timeSpent: 45,
      createdAt: yesterday.toISOString(),
      updatedAt: yesterday.toISOString(),
      __v: 0,
    },
    {
      _id: "l3",
      user: "u1",
      title: "DB Study",
      timeSpent: 30,
      createdAt: threeDaysAgo.toISOString(),
      updatedAt: threeDaysAgo.toISOString(),
      __v: 0,
    },
    {
      _id: "l4",
      user: "u1",
      title: "Old Study",
      timeSpent: 90,
      createdAt: tenDaysAgo.toISOString(),
      updatedAt: tenDaysAgo.toISOString(),
      __v: 0,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not fetch when userId is empty", () => {
    renderHookWithQuery(() => usePrepLogs(""));
    expect(mockGetByUserId).not.toHaveBeenCalled();
  });

  it("fetches logs for the given userId", async () => {
    mockGetByUserId.mockResolvedValue(mockLogs);
    renderHookWithQuery(() => usePrepLogs("user-1"));

    await waitFor(() => {
      expect(mockGetByUserId).toHaveBeenCalledWith("user-1");
    });
  });

  it("returns loading initially", () => {
    mockGetByUserId.mockReturnValue(new Promise(() => {}));
    const { result } = renderHookWithQuery(() => usePrepLogs("user-1"));
    expect(result.current.loading).toBe(true);
  });

  it("computes totalTimeSpent", async () => {
    mockGetByUserId.mockResolvedValue(mockLogs);
    const { result } = renderHookWithQuery(() => usePrepLogs("user-1"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.totalTimeSpent).toBe(225); // 60 + 45 + 30 + 90
  });

  it("computes totalLogs", async () => {
    mockGetByUserId.mockResolvedValue(mockLogs);
    const { result } = renderHookWithQuery(() => usePrepLogs("user-1"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.totalLogs).toBe(4);
  });

  it("computes streak of consecutive days", async () => {
    mockGetByUserId.mockResolvedValue(mockLogs);
    const { result } = renderHookWithQuery(() => usePrepLogs("user-1"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // today + yesterday = 2 consecutive days, then gap to threeDaysAgo
    expect(result.current.streak).toBe(2);
  });

  it("returns 0 streak for empty logs", async () => {
    mockGetByUserId.mockResolvedValue([]);
    const { result } = renderHookWithQuery(() => usePrepLogs("user-1"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.streak).toBe(0);
  });

  it("filters recentActivity to last 7 days", async () => {
    mockGetByUserId.mockResolvedValue(mockLogs);
    const { result } = renderHookWithQuery(() => usePrepLogs("user-1"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // today, yesterday, threeDaysAgo are within 7 days; tenDaysAgo is not
    expect(result.current.recentActivity).toHaveLength(3);
  });

  it("returns error on failure", async () => {
    mockGetByUserId.mockRejectedValue(new Error("Service down"));
    const { result } = renderHookWithQuery(() => usePrepLogs("user-1"));

    await waitFor(() => {
      expect(result.current.error).toBe("Service down");
    });
  });

  it("returns empty defaults when no data", async () => {
    mockGetByUserId.mockResolvedValue([]);
    const { result } = renderHookWithQuery(() => usePrepLogs("user-1"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.logs).toEqual([]);
    expect(result.current.totalTimeSpent).toBe(0);
    expect(result.current.totalLogs).toBe(0);
    expect(result.current.recentActivity).toEqual([]);
  });
});
