import { renderHookWithQuery } from "@test-utils/query-wrapper";
import { waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@tbe/utils", () => ({
  sendRequest: vi.fn(),
}));

let mockUserId: string | undefined = "viewer-1";
vi.mock("@tbe/hooks", () => ({
  useUser: () => ({ user: mockUserId ? { id: mockUserId } : null }),
}));

import useLeaderboard from "@tbe/gamification/useLeaderboard";
import { sendRequest } from "@tbe/utils";

const mockSendRequest = vi.mocked(sendRequest);

const board = (type: string, name: string) => ({
  data: {
    type,
    periodKey: "2026-W39",
    resetsAt: "2026-09-27T18:30:00.000Z",
    totalLearners: 1,
    entries: [{ rank: 1, userId: "u1", displayName: name, score: 10 }],
    viewer: { rank: 1, score: 10, nextTarget: null },
  },
});

describe("useLeaderboard (@tbe/gamification)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("is loading with no entries while the request is pending", () => {
    mockSendRequest.mockReturnValue(new Promise(() => {}));
    const { result } = renderHookWithQuery(() => useLeaderboard("DAILY"));
    expect(result.current.loading).toBe(true);
    expect(result.current.entries).toEqual([]);
    expect(result.current.viewer).toBeNull();
  });

  it("exposes the board, entries and viewer standing", async () => {
    mockSendRequest.mockResolvedValue(board("WEEKLY", "Priya"));
    const { result } = renderHookWithQuery(() => useLeaderboard("WEEKLY"));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.entries[0]).toMatchObject({ displayName: "Priya" });
    expect(result.current.viewer).toEqual({
      rank: 1,
      score: 10,
      nextTarget: null,
    });
    expect(result.current.board?.periodKey).toBe("2026-W39");
  });

  it("requests the type and limit", async () => {
    mockSendRequest.mockResolvedValue(board("DAILY", "A"));
    renderHookWithQuery(() => useLeaderboard("DAILY", { limit: 50 }));

    await waitFor(() => expect(mockSendRequest).toHaveBeenCalled());
    expect(mockSendRequest).toHaveBeenCalledWith({
      method: "GET",
      url: "/leaderboard?type=DAILY&limit=50",
    });
  });

  it("gives each Period type its own cache entry (tabs never share data)", async () => {
    mockSendRequest.mockImplementation(async ({ url }) =>
      board(
        url.includes("DAILY") ? "DAILY" : "MONTHLY",
        url.includes("DAILY") ? "Daily Dev" : "Monthly Maya",
      ),
    );

    const daily = renderHookWithQuery(() => useLeaderboard("DAILY"));
    const monthly = renderHookWithQuery(() => useLeaderboard("MONTHLY"));

    await waitFor(() => {
      expect(daily.result.current.loading).toBe(false);
      expect(monthly.result.current.loading).toBe(false);
    });
    expect(daily.result.current.entries[0]?.displayName).toBe("Daily Dev");
    expect(monthly.result.current.entries[0]?.displayName).toBe("Monthly Maya");
  });

  it("surfaces a failed request as an error instead of an empty board", async () => {
    mockSendRequest.mockResolvedValue({
      success: false,
      status: 500,
      message: "Leaderboard unavailable",
      data: null,
    });

    const { result } = renderHookWithQuery(() => useLeaderboard("WEEKLY"));

    await waitFor(() =>
      expect(result.current.error).toBe("Leaderboard unavailable"),
    );
    expect(result.current.board).toBeNull();
  });

  it("keys the cache by viewer so another account never sees a previous learner's rank", async () => {
    mockSendRequest.mockResolvedValue(board("WEEKLY", "Priya"));

    mockUserId = "viewer-1";
    const first = renderHookWithQuery(() => useLeaderboard("WEEKLY"));
    await waitFor(() => expect(first.result.current.loading).toBe(false));

    mockUserId = "viewer-2";
    const second = renderHookWithQuery(
      () => useLeaderboard("WEEKLY"),
      first.queryClient,
    );
    await waitFor(() => expect(second.result.current.loading).toBe(false));

    expect(mockSendRequest).toHaveBeenCalledTimes(2);
    mockUserId = "viewer-1";
  });
});
