import { routes } from "@tbe/constants";
import { useAnalytics, useApi, useUser } from "@tbe/hooks";
import { useCallback, useState } from "react";

import { useGamificationContext } from "./GamificationProvider";
import type {
  CelebrationIntensity,
  CelebrationType,
  GamificationEvent,
} from "./types";
import useGamification from "./useGamification";
import {
  calculateUserPointsForAction,
  getUserGamificationLevel,
} from "./utils";

/**
 * Hook that ties a learning action to the full gamification pipeline:
 * API call -> analytics -> celebration -> toast.
 *
 * Must be used within a <GamificationProvider>.
 */
const useGamifiedAction = () => {
  const { user } = useUser();
  const { trackEvent } = useAnalytics();
  const { points: currentPoints, refetch: refetchPoints } = useGamification();
  const { makeRequest } = useApi("gamification");
  const { triggerCelebration, showToast } = useGamificationContext();

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

        if (event.gamificationAction) {
          const pointsEarned = calculateUserPointsForAction(
            event.gamificationAction,
          );
          const previousLevel = getUserGamificationLevel(currentPoints);
          const newTotalPoints = currentPoints + pointsEarned;
          const newLevel = getUserGamificationLevel(newTotalPoints);

          await makeRequest({
            method: "POST",
            url: routes.api.gamification,
            body: { actionType: event.gamificationAction },
          });

          refetchPoints();

          let celebrationType: CelebrationType = "points";
          let celebrationIntensity: CelebrationIntensity;
          let toastMessage = event.customMessage || "Great job!";

          if (newLevel.currentLevel > previousLevel.currentLevel) {
            celebrationType = "levelup";
            celebrationIntensity = "high";
            toastMessage = `Level Up! Welcome to ${newLevel.currentLevelName}!`;

            trackEvent({
              action: "LEVEL_UP",
              category: "Gamification",
              label: "Level Up Achievement",
              value: {
                userId: user.id,
                previousLevel: previousLevel.currentLevel,
                newLevel: newLevel.currentLevel,
                previousLevelName: previousLevel.currentLevelName,
                newLevelName: newLevel.currentLevelName,
              },
            });
          } else if (pointsEarned >= 50) {
            celebrationIntensity = "high";
          } else if (pointsEarned >= 20) {
            celebrationIntensity = "medium";
          } else {
            celebrationIntensity = "low";
          }

          if (event.celebrationType) {
            celebrationType = event.celebrationType;
          }

          triggerCelebration({
            type: celebrationType,
            intensity: celebrationIntensity,
          });

          showToast({
            type: celebrationType,
            message: toastMessage,
            points: pointsEarned,
            level: newLevel.currentLevel,
            levelName: newLevel.currentLevelName,
          });

          trackEvent({
            action: "POINTS_EARNED",
            category: "Gamification",
            label: "Points Earned",
            value: {
              userId: user.id,
              pointsEarned,
              actionType: event.gamificationAction,
              totalPoints: newTotalPoints,
            },
          });
        }
      } catch (error) {
        console.error("[Gamification] Action failed:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [
      user?.id,
      trackEvent,
      currentPoints,
      makeRequest,
      refetchPoints,
      triggerCelebration,
      showToast,
    ],
  );

  return { triggerGamifiedAction, isLoading };
};

export default useGamifiedAction;
