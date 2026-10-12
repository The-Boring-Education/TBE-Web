import type { GamificationSummary } from "./types";

/** Narrow an API response's `gamification` block to a GamificationSummary. */
export const toGamificationSummary = (
  value: unknown,
): GamificationSummary | null => {
  if (!value || typeof value !== "object") return null;
  const v = value as Partial<GamificationSummary>;
  if (
    typeof v.pointsEarned !== "number" ||
    typeof v.lifetimePoints !== "number" ||
    typeof v.countedForLeaderboard !== "boolean" ||
    !v.weekly
  ) {
    return null;
  }
  return v as GamificationSummary;
};

/**
 * The toast's leaderboard line for a server GamificationSummary:
 *   "#7 this week ↑3" · "#12 this week — you're on the board!" · a Pace Limit note.
 */
export const formatRankLine = (
  summary?: GamificationSummary | null,
): string | undefined => {
  if (!summary) return undefined;
  if (!summary.countedForLeaderboard) {
    if (summary.notCountedReason === "PACE_LIMIT") {
      return "Leaderboard counts 1 learning action every 3 min";
    }
    return undefined;
  }
  const { rank, previousRank } = summary.weekly;
  if (summary.pointsEarned <= 0 || rank === null) return undefined;
  if (previousRank === null) return `#${rank} this week — you're on the board!`;
  if (previousRank > rank) return `#${rank} this week ↑${previousRank - rank}`;
  return `#${rank} this week`;
};
