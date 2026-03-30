/**
 * @tbe/gamification — Centralised gamification library for the TBE ecosystem.
 *
 * Usage:
 *   1. Wrap your app with <GamificationProvider>.
 *   2. Use useGamifiedAction() to award points on learning events.
 *   3. Drop <PointsBadge /> into your navbar for a persistent points display.
 *   4. Use useGamification() to read level/points anywhere.
 *   5. Use useLeaderboard(tab) for leaderboard data.
 */

// ── Provider ──
export {
  GamificationProvider,
  useGamificationContext,
} from "./GamificationProvider";

// ── Hooks ──
export { default as useGamification } from "./useGamification";
export { default as useGamifiedAction } from "./useGamifiedAction";
export { default as useLeaderboard } from "./useLeaderboard";

// ── Components ──
export { default as CelebrationAnimation } from "./CelebrationAnimation";
export { default as GamificationToast } from "./GamificationToast";
export { default as PointsBadge } from "./PointsBadge";

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
  GamificationToastProps,
  LeaderboardEntry,
  LevelProgress,
  PointsBadgeProps,
  ToastData,
} from "./types";
