import { queryKeys, useQueryClient } from "@tbe/query";
import { useCallback } from "react";

import { useGamificationContext } from "./GamificationProvider";
import { formatRankLine, toGamificationSummary } from "./leaderboardFeedback";
import type { CelebrationType, GamificationSummary } from "./types";
import { getUserGamificationLevel } from "./utils";

/**
 * Celebrate the outcome the server returned for a learning action: points,
 * level-up, and the learner's new weekly rank. Also refreshes cached points and
 * leaderboards so every surface updates immediately.
 */
const useGamificationFeedback = () => {
  const queryClient = useQueryClient();
  const { triggerCelebration, showToast } = useGamificationContext();

  const celebrate = useCallback(
    (
      /** The `gamification` block from the API response (validated here). */
      result: GamificationSummary | unknown,
      {
        message = "Great job!",
        celebrationType,
      }: { message?: string; celebrationType?: CelebrationType } = {},
    ) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.gamification.all,
      });
      const summary = toGamificationSummary(result);
      if (!summary || summary.pointsEarned <= 0) return;

      const before = getUserGamificationLevel(
        summary.lifetimePoints - summary.pointsEarned,
      );
      const after = getUserGamificationLevel(summary.lifetimePoints);
      const levelledUp = after.currentLevel > before.currentLevel;
      const type: CelebrationType = levelledUp
        ? "levelup"
        : (celebrationType ?? "points");

      triggerCelebration({
        type,
        intensity: levelledUp
          ? "high"
          : summary.pointsEarned >= 50
            ? "high"
            : summary.pointsEarned >= 20
              ? "medium"
              : "low",
      });
      showToast({
        type,
        message: levelledUp
          ? `Level Up! Welcome to ${after.currentLevelName}!`
          : message,
        points: summary.pointsEarned,
        level: after.currentLevel,
        levelName: after.currentLevelName,
        rankLine: formatRankLine(summary),
      });
    },
    [queryClient, triggerCelebration, showToast],
  );

  return { celebrate };
};

export default useGamificationFeedback;
