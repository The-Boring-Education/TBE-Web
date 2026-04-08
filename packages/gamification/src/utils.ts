/**
 * Re-export gamification utilities from @tbe/utils.
 * Single source of truth — never duplicate level/points logic.
 */
export {
  calculateUserPointsForAction,
  getUserGamificationLevel,
} from "@tbe/utils";
