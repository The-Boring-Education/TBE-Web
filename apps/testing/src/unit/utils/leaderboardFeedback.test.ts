import { describe, expect, it } from "vitest";

import {
  formatRankLine,
  toGamificationSummary,
} from "@tbe/gamification/leaderboardFeedback";

const summary = (
  weekly: { score: number; rank: number | null; previousRank: number | null },
  extra: Record<string, unknown> = {},
) => ({
  pointsEarned: 10,
  lifetimePoints: 510,
  countedForLeaderboard: true,
  weekly,
  ...extra,
});

describe("formatRankLine", () => {
  it("celebrates a climb", () => {
    expect(formatRankLine(summary({ score: 40, rank: 7, previousRank: 10 }))).toBe(
      "#7 this week ↑3",
    );
  });

  it("welcomes a learner onto the board", () => {
    expect(formatRankLine(summary({ score: 10, rank: 42, previousRank: null }))).toBe(
      "#42 this week — you're on the board!",
    );
  });

  it("shows the rank when it did not change", () => {
    expect(formatRankLine(summary({ score: 40, rank: 3, previousRank: 3 }))).toBe(
      "#3 this week",
    );
  });

  it("explains the Pace Limit", () => {
    expect(
      formatRankLine(
        summary(
          { score: 0, rank: null, previousRank: null },
          { countedForLeaderboard: false, notCountedReason: "PACE_LIMIT" },
        ),
      ),
    ).toBe("Leaderboard counts 1 learning action every 3 min");
  });

  it("stays quiet for engagement, repeats and missing data", () => {
    expect(
      formatRankLine(
        summary(
          { score: 0, rank: null, previousRank: null },
          { countedForLeaderboard: false, notCountedReason: "ALREADY_CREDITED" },
        ),
      ),
    ).toBeUndefined();
    expect(formatRankLine(undefined)).toBeUndefined();
  });
});

describe("toGamificationSummary", () => {
  it("accepts a well-formed API block and rejects anything else", () => {
    const ok = summary({ score: 10, rank: 1, previousRank: null });
    expect(toGamificationSummary(ok)).toBe(ok);
    expect(toGamificationSummary(undefined)).toBeNull();
    expect(toGamificationSummary({ pointsEarned: "10" })).toBeNull();
    expect(toGamificationSummary("nope")).toBeNull();
  });
});
