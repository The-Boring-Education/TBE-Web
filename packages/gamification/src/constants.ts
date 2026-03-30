/**
 * Re-export gamification constants from @tbe/constants.
 * Single source of truth — never duplicate these.
 */
export { LEADERBOARD_TABS, POINTS_RULES, USER_LEVELS } from "@tbe/constants";

/**
 * Color palettes for celebration animations, keyed by celebration type.
 */
export const CELEBRATION_COLORS = {
  points: ["#10b981", "#3b82f6", "#8b5cf6", "#f59e0b"],
  levelup: ["#f59e0b", "#eab308", "#f97316", "#ef4444"],
  achievement: ["#8b5cf6", "#a855f7", "#c084fc", "#e879f9"],
} as const;

/**
 * Particle counts per celebration intensity.
 */
export const PARTICLE_COUNTS = {
  low: 15,
  medium: 25,
  high: 40,
} as const;

/**
 * Toast gradients per celebration type.
 */
export const TOAST_STYLES = {
  points: {
    gradient: "from-green-600 to-blue-600",
    glow: "shadow-green-500/50",
  },
  levelup: {
    gradient: "from-amber-500 to-orange-600",
    glow: "shadow-amber-500/50",
  },
  achievement: {
    gradient: "from-purple-600 to-pink-600",
    glow: "shadow-purple-500/50",
  },
} as const;
