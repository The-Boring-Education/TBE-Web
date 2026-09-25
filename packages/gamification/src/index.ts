/**
 * @tbe/gamification — Centralised gamification library for the TBE ecosystem.
 *
 * Usage:
 *   1. Wrap your app with <GamificationProvider>.
 *   2. Celebrate server-awarded learning with useGamificationFeedback().celebrate(res.gamification).
 *   3. Use useGamifiedAction() for Engagement Actions (enroll, feedback, share…).
 *   4. Drop <PointsBadge /> / <RankChip /> into your navbar.
 *   5. Use useGamification() to read level/points anywhere.
 *   6. Use useLeaderboard(type) / <LeaderboardCard /> for leaderboards.
 */

// ── Provider ──
export {
  GamificationProvider,
  useGamificationContext,
} from "./GamificationProvider";

// ── Hooks ──
export { default as useGamification } from "./useGamification";
export { default as useGamificationFeedback } from "./useGamificationFeedback";
export { default as useGamifiedAction } from "./useGamifiedAction";
export { default as useLeaderboard } from "./useLeaderboard";
export { default as useLeaderboardChampions } from "./useLeaderboardChampions";
export { default as useLeaderboardPreferences } from "./useLeaderboardPreferences";
export { default as useMyLeaderboard } from "./useMyLeaderboard";
export { default as usePublicLeaderboard } from "./usePublicLeaderboard";

// ── Components ──
export { default as CelebrationAnimation } from "./CelebrationAnimation";
export { default as GamificationToast } from "./GamificationToast";
export { default as LeaderboardCard } from "./leaderboard/LeaderboardCard";
export { default as LeaderboardPageContent } from "./leaderboard/LeaderboardPageContent";
export { default as LeaderboardSettings } from "./leaderboard/LeaderboardSettings";
export { default as PublicLeaderboardStrip } from "./leaderboard/PublicLeaderboardStrip";
export { default as RankChip } from "./leaderboard/RankChip";
export { default as PointsBadge } from "./PointsBadge";

// ── Helpers ──
export { formatRankLine, toGamificationSummary } from "./leaderboardFeedback";

// ── Constants (re-exported from @tbe/constants for convenience) ──
export {
  CELEBRATION_COLORS,
  LEADERBOARD_TABS,
  PARTICLE_COUNTS,
  POINTS_RULES,
  TOAST_STYLES,
  USER_LEVELS,
} from "./constants";

// ── Utils (re-exported from @tbe/utils for convenience) ──
export {
  calculateUserPointsForAction,
  getUserGamificationLevel,
} from "./utils";

// ── Types ──
export type {
  CelebrationAnimationProps,
  CelebrationData,
  CelebrationIntensity,
  CelebrationType,
  GamificationContextType,
  GamificationEvent,
  GamificationLevel,
  GamificationSummary,
  GamificationToastProps,
  LeaderboardBoard,
  LeaderboardChampion,
  LeaderboardEntry,
  LeaderboardNextTarget,
  LeaderboardPreferences,
  LeaderboardViewer,
  LevelProgress,
  MyLeaderboard,
  PeriodChampions,
  PointsBadgeProps,
  ThemeType,
  ToastData,
} from "./types";
