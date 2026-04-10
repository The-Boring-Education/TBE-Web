import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockUsePrepStats = vi.fn();

vi.mock("@tbe/hooks/usePrepStats", () => ({
  usePrepStats: (...args: unknown[]) => mockUsePrepStats(...args),
}));

import { useDailyPrepEncouragement } from "@tbe/hooks/useDailyPrepEncouragement";

describe("useDailyPrepEncouragement", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("when logged today with streak > 1, celebrates the streak", () => {
    mockUsePrepStats.mockReturnValue({
      currentStreak: 5,
      totalLogs: 20,
      totalTimeSpent: 12,
      hasLoggedToday: true,
    });

    const { result } = renderHook(() => useDailyPrepEncouragement("user-1"));

    expect(result.current.encouragementMessage).toContain("5-day streak");
    expect(result.current.encouragementEmoji).toBe("✅");
    expect(result.current.buttonText).toBe("Add Another Log");
    expect(result.current.streak).toBe(5);
    expect(result.current.totalLogs).toBe(20);
    expect(result.current.totalTimeSpent).toBe(12);
    expect(result.current.hasLoggedToday).toBe(true);
  });

  it("when logged today with streak 1, shows single-day praise", () => {
    mockUsePrepStats.mockReturnValue({
      currentStreak: 1,
      totalLogs: 1,
      totalTimeSpent: 1,
      hasLoggedToday: true,
    });

    const { result } = renderHook(() => useDailyPrepEncouragement("user-1"));

    expect(result.current.encouragementMessage).toContain("Great job logging");
    expect(result.current.encouragementEmoji).toBe("✅");
  });

  it("when not logged today and streak is 0, prompts to start", () => {
    mockUsePrepStats.mockReturnValue({
      currentStreak: 0,
      totalLogs: 0,
      totalTimeSpent: 0,
      hasLoggedToday: false,
    });

    const { result } = renderHook(() => useDailyPrepEncouragement("user-1"));

    expect(result.current.encouragementMessage).toBe(
      "Ready to start your prep journey today?",
    );
    expect(result.current.encouragementEmoji).toBe("🚀");
    expect(result.current.buttonText).toBe("Log Your First Session");
  });

  it("when not logged today and streak is 1, urges not to break the chain", () => {
    mockUsePrepStats.mockReturnValue({
      currentStreak: 1,
      totalLogs: 1,
      totalTimeSpent: 2,
      hasLoggedToday: false,
    });

    const { result } = renderHook(() => useDailyPrepEncouragement("user-1"));

    expect(result.current.encouragementMessage).toContain(
      "Don't break the chain",
    );
    expect(result.current.encouragementEmoji).toBe("⏰");
    expect(result.current.buttonText).toBe("Continue Your Streak");
  });

  it("when not logged today and streak > 1, warns about maintaining streak", () => {
    mockUsePrepStats.mockReturnValue({
      currentStreak: 4,
      totalLogs: 10,
      totalTimeSpent: 8,
      hasLoggedToday: false,
    });

    const { result } = renderHook(() => useDailyPrepEncouragement("user-1"));

    expect(result.current.encouragementMessage).toContain("4-day streak");
    expect(result.current.encouragementEmoji).toBe("🔥");
    expect(result.current.buttonText).toBe("Maintain Your Streak");
  });
});
