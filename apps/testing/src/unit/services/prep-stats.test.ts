import { prepStatsService } from "@tbe/services/prep-stats";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("prepStatsService", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  const stats = {
    currentStreak: 3,
    longestStreak: 10,
    lastLoggedDate: "2026-01-01",
    totalLogs: 20,
    hasLoggedToday: true,
    recentLogs: 2,
    weeklyLogs: [],
  };

  it("fetches and returns prep stats for a user", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ status: true, data: stats }),
    } as Response);

    const result = await prepStatsService.getByUserId("user-1");

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("userId=user-1"),
      expect.objectContaining({
        headers: { "Content-Type": "application/json" },
      }),
    );
    expect(result).toEqual(stats);
  });

  it("throws when the HTTP response is not ok", async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: false, status: 500 } as Response);

    await expect(prepStatsService.getByUserId("user-1")).rejects.toThrow(
      "HTTP error! status: 500",
    );
  });

  it("throws when the API responds with status: false", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ status: false }),
    } as Response);

    await expect(prepStatsService.getByUserId("user-1")).rejects.toThrow(
      "Failed to fetch prep stats",
    );
  });

  it("propagates network errors", async () => {
    vi.mocked(fetch).mockRejectedValue(new Error("Network down"));

    await expect(prepStatsService.getByUserId("user-1")).rejects.toThrow(
      "Network down",
    );
  });
});
