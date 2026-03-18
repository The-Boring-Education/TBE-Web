import { renderHookWithQuery } from "@test-utils/query-wrapper";
import { waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetByUserId = vi.fn();
const mockGetProgress = vi.fn();

vi.mock("@tbe/services", () => ({
  challengesService: {
    getByUserId: (...args: any[]) => mockGetByUserId(...args),
    getProgress: (...args: any[]) => mockGetProgress(...args),
  },
}));

import useChallenges, { useChallengeProgress } from "@tbe/hooks/useChallenges";

describe("useChallenges", () => {
  const now = new Date();
  const twoDaysAgo = new Date(now);
  twoDaysAgo.setDate(now.getDate() - 2);
  const fiftyDaysAgo = new Date(now);
  fiftyDaysAgo.setDate(now.getDate() - 50);

  const mockChallenges = [
    {
      _id: "c1",
      isActive: true,
      totalDays: 30,
      createdAt: now.toISOString(),
    },
    {
      _id: "c2",
      isActive: true,
      totalDays: 15,
      createdAt: twoDaysAgo.toISOString(),
    },
    {
      _id: "c3",
      isActive: false,
      totalDays: 21,
      createdAt: fiftyDaysAgo.toISOString(),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not fetch when userId is empty", () => {
    renderHookWithQuery(() => useChallenges(""));
    expect(mockGetByUserId).not.toHaveBeenCalled();
  });

  it("returns loading initially", () => {
    mockGetByUserId.mockReturnValue(new Promise(() => {}));
    const { result } = renderHookWithQuery(() => useChallenges("user-1"));
    expect(result.current.loading).toBe(true);
  });

  it("separates active and completed challenges", async () => {
    mockGetByUserId.mockResolvedValue(mockChallenges);
    const { result } = renderHookWithQuery(() => useChallenges("user-1"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.activeChallenges).toHaveLength(2);
    expect(result.current.completedChallenges).toHaveLength(1);
  });

  it("picks the most recent active challenge as currentChallenge", async () => {
    mockGetByUserId.mockResolvedValue(mockChallenges);
    const { result } = renderHookWithQuery(() => useChallenges("user-1"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.currentChallenge?._id).toBe("c1");
  });

  it("computes totalDaysCommitted across all challenges", async () => {
    mockGetByUserId.mockResolvedValue(mockChallenges);
    const { result } = renderHookWithQuery(() => useChallenges("user-1"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.totalDaysCommitted).toBe(66); // 30 + 15 + 21
  });

  it("computes completionRate correctly", async () => {
    mockGetByUserId.mockResolvedValue(mockChallenges);
    const { result } = renderHookWithQuery(() => useChallenges("user-1"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.completionRate).toBe(33); // 1/3 * 100 rounded
  });

  it("returns 0 completionRate when no challenges", async () => {
    mockGetByUserId.mockResolvedValue([]);
    const { result } = renderHookWithQuery(() => useChallenges("user-1"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.completionRate).toBe(0);
    expect(result.current.currentChallenge).toBeNull();
  });

  it("filters recentChallenges within last 30 days", async () => {
    mockGetByUserId.mockResolvedValue(mockChallenges);
    const { result } = renderHookWithQuery(() => useChallenges("user-1"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // c1 (today) and c2 (2 days ago) are recent; c3 (50 days ago) is not
    expect(result.current.recentChallenges).toHaveLength(2);
  });

  it("returns error on failure", async () => {
    mockGetByUserId.mockRejectedValue(new Error("API failure"));
    const { result } = renderHookWithQuery(() => useChallenges("user-1"));

    await waitFor(() => {
      expect(result.current.error).toBe("API failure");
    });
  });
});

describe("useChallengeProgress", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not fetch when challengeId is null", () => {
    renderHookWithQuery(() => useChallengeProgress(null));
    expect(mockGetProgress).not.toHaveBeenCalled();
  });

  it("fetches progress when challengeId is provided", async () => {
    const mockProgress = {
      challengeId: "c1",
      completedDays: 10,
      totalDays: 30,
    };
    mockGetProgress.mockResolvedValue(mockProgress);

    const { result } = renderHookWithQuery(() => useChallengeProgress("c1"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.progress).toEqual(mockProgress);
    expect(mockGetProgress).toHaveBeenCalledWith("c1");
  });

  it("returns null progress initially", () => {
    mockGetProgress.mockReturnValue(new Promise(() => {}));
    const { result } = renderHookWithQuery(() => useChallengeProgress("c1"));
    expect(result.current.progress).toBeNull();
  });
});
