import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@tbe/services", () => ({
  challengesService: {
    getByUserId: vi.fn(),
    getProgress: vi.fn(),
  },
}));

import useChallenges, { useChallengeProgress } from "@tbe/hooks/useChallenges";
import { challengesService } from "@tbe/services";

const mockChallenges = [
  {
    _id: "1",
    name: "30 Days JS",
    isActive: true,
    totalDays: 30,
    createdAt: new Date().toISOString(),
    category: "JavaScript",
  },
  {
    _id: "2",
    name: "DSA Sprint",
    isActive: false,
    totalDays: 15,
    createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
    category: "DSA",
  },
  {
    _id: "3",
    name: "React Deep Dive",
    isActive: true,
    totalDays: 21,
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    category: "React",
  },
];

const mockGetByUserId = vi.mocked(challengesService.getByUserId);
const mockGetProgress = vi.mocked(challengesService.getProgress);

describe("useChallenges", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sets error when no userId", async () => {
    const { result } = renderHook(() => useChallenges(""));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe("User ID is required");
    expect(mockGetByUserId).not.toHaveBeenCalled();
  });

  it("loads challenges on mount", async () => {
    mockGetByUserId.mockResolvedValue(mockChallenges);

    const { result } = renderHook(() => useChallenges("user-1"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.challenges).toEqual(mockChallenges);
    expect(result.current.error).toBe(null);
  });

  it("computes activeChallenges and completedChallenges correctly", async () => {
    mockGetByUserId.mockResolvedValue(mockChallenges);

    const { result } = renderHook(() => useChallenges("user-1"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.activeChallenges).toHaveLength(2);
    expect(result.current.activeChallenges.map((c) => c.name)).toContain(
      "30 Days JS",
    );
    expect(result.current.activeChallenges.map((c) => c.name)).toContain(
      "React Deep Dive",
    );
    expect(result.current.completedChallenges).toHaveLength(1);
    expect(result.current.completedChallenges[0].name).toBe("DSA Sprint");
  });

  it("currentChallenge is most recent active by createdAt", async () => {
    mockGetByUserId.mockResolvedValue(mockChallenges);

    const { result } = renderHook(() => useChallenges("user-1"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.currentChallenge?.name).toBe("30 Days JS");
  });

  it("totalDaysCommitted sums correctly", async () => {
    mockGetByUserId.mockResolvedValue(mockChallenges);

    const { result } = renderHook(() => useChallenges("user-1"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.totalDaysCommitted).toBe(66);
  });

  it("completionRate calculated correctly", async () => {
    mockGetByUserId.mockResolvedValue(mockChallenges);

    const { result } = renderHook(() => useChallenges("user-1"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.completionRate).toBe(33);
  });

  it("recentChallenges filters last 30 days", async () => {
    mockGetByUserId.mockResolvedValue(mockChallenges);

    const { result } = renderHook(() => useChallenges("user-1"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.recentChallenges).toHaveLength(2);
    expect(result.current.recentChallenges.map((c) => c.name)).toContain(
      "30 Days JS",
    );
    expect(result.current.recentChallenges.map((c) => c.name)).toContain(
      "React Deep Dive",
    );
  });

  it("refetch triggers re-fetch", async () => {
    mockGetByUserId.mockResolvedValue(mockChallenges);

    const { result } = renderHook(() => useChallenges("user-1"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    mockGetByUserId.mockResolvedValue([
      ...mockChallenges,
      {
        _id: "4",
        name: "New",
        isActive: true,
        totalDays: 7,
        createdAt: new Date().toISOString(),
        category: "Other",
      },
    ]);

    await act(async () => {
      result.current.refetch();
    });

    await waitFor(() => {
      expect(mockGetByUserId).toHaveBeenCalledTimes(2);
    });
  });

  it("handles fetch error", async () => {
    mockGetByUserId.mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useChallenges("user-1"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe("Network error");
  });
});

describe("useChallengeProgress", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns null when no challengeId", () => {
    const { result } = renderHook(() => useChallengeProgress(null));

    expect(result.current.progress).toBe(null);
    expect(mockGetProgress).not.toHaveBeenCalled();
  });

  it("fetches progress when challengeId provided", async () => {
    const mockProgress = { challengeId: "1", completedDays: 10, totalDays: 30 };
    mockGetProgress.mockResolvedValue(mockProgress);

    const { result } = renderHook(() => useChallengeProgress("1"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.progress).toEqual(mockProgress);
    expect(result.current.error).toBe(null);
  });

  it("handles error", async () => {
    mockGetProgress.mockRejectedValue(new Error("Failed to load progress"));

    const { result } = renderHook(() => useChallengeProgress("1"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe("Failed to load progress");
  });
});
