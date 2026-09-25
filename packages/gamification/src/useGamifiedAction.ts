import { ANALYTICS_EVENTS, isLearningAction, routes } from "@tbe/constants";
import { useAnalytics, useUser } from "@tbe/hooks";
import { sendRequest } from "@tbe/utils";
import { useCallback, useState } from "react";

import { useGamificationContext } from "./GamificationProvider";
import type { GamificationEvent, GamificationSummary } from "./types";
import useGamificationFeedback from "./useGamificationFeedback";

interface LedgerResult {
  pointsEarned?: number;
  lifetimePoints?: number;
}

/** POST /gamification responds `{ data: { data: ledgerResult } }`. */
const toEngagementSummary = (response: unknown): GamificationSummary | null => {
  const ledger = (response as { data?: { data?: LedgerResult } })?.data?.data;
  if (!ledger || typeof ledger.pointsEarned !== "number") return null;
  return {
    pointsEarned: ledger.pointsEarned,
    lifetimePoints: ledger.lifetimePoints ?? ledger.pointsEarned,
    countedForLeaderboard: false,
    notCountedReason: "ENGAGEMENT",
    weekly: { score: 0, rank: null, previousRank: null },
  };
};

/**
 * Ties a learner action to the gamification pipeline: analytics → points → celebration.
 *
 * - Engagement Actions (enroll, feedback, share…) are claimed via POST /gamification.
 * - Learning Actions are awarded by the server endpoint that verified them; pass that
 *   response's `gamification` block as `serverResult` to celebrate it. Without one,
 *   a points-free celebration is shown.
 *
 * Must be used within a <GamificationProvider>.
 */
const useGamifiedAction = () => {
  const { user } = useUser();
  const { trackEvent } = useAnalytics();
  const { triggerCelebration, showToast } = useGamificationContext();
  const { celebrate } = useGamificationFeedback();

  const [isLoading, setIsLoading] = useState(false);

  const triggerGamifiedAction = useCallback(
    async (event: GamificationEvent) => {
      if (!user?.id) return;

      setIsLoading(true);

      try {
        trackEvent({
          ...event.analytics,
          value: { userId: user.id, ...event.metadata },
        });

        const action = event.gamificationAction;
        if (!action) return;

        let summary: GamificationSummary | null | undefined =
          event.serverResult;

        if (!isLearningAction(action)) {
          const response = await sendRequest({
            method: "POST",
            url: `${routes.api.gamification}?userId=${user.id}`,
            body: { actionType: action },
          });
          summary = toEngagementSummary(response);
        }

        if (!summary || summary.pointsEarned <= 0) {
          triggerCelebration({
            type: event.celebrationType ?? "achievement",
            intensity: "medium",
          });
          showToast({
            type: event.celebrationType ?? "achievement",
            message: event.customMessage || "Great job!",
          });
          return;
        }

        celebrate(summary, {
          message: event.customMessage,
          celebrationType: event.celebrationType,
        });

        trackEvent({
          action: ANALYTICS_EVENTS.POINTS_EARNED,
          category: "Gamification",
          label: "Points Earned",
          value: {
            userId: user.id,
            pointsEarned: summary.pointsEarned,
            actionType: action,
            totalPoints: summary.lifetimePoints,
            weeklyRank: summary.weekly.rank,
          },
        });
      } catch (error) {
        console.error("[Gamification] Action failed:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [user?.id, trackEvent, triggerCelebration, showToast, celebrate],
  );

  return { triggerGamifiedAction, isLoading };
};

export default useGamifiedAction;
