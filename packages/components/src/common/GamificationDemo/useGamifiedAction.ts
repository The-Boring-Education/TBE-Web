import { routes } from "@tbe/constants";
import { useAnalytics, useApi, useGamification, useUser } from "@tbe/hooks";
import type { TrackEventProps, UserPointsActionType } from "@tbe/interface";
import {
  calculateUserPointsForAction,
  getUserGamificationLevel,
} from "@tbe/utils";
import { useCallback, useState } from "react";

import { useGamificationContext } from "./GamificationProvider";

export interface GamificationEvent {
  gamificationAction?: UserPointsActionType;
  analytics: Omit<TrackEventProps, "value">;
  celebrationType?: "points" | "levelup" | "achievement";
  customMessage?: string;
  metadata?: any;
}

export interface GamificationState {
  isLoading: boolean;
  showCelebration: boolean;
  showToast: boolean;
  toastData: {
    type: "points" | "levelup" | "achievement";
    message: string;
    points?: number;
    level?: number;
    levelName?: string;
  } | null;
  celebrationData: {
    type: "points" | "levelup" | "achievement";
    intensity: "low" | "medium" | "high";
  } | null;
}

const useGamifiedAction = () => {
  const { user } = useUser();
  const { trackEvent } = useAnalytics();
  const { points: currentPoints } = useGamification();
  const { makeRequest } = useApi("gamification");
  const { triggerCelebration, showToast } = useGamificationContext();

  const [state, setState] = useState<GamificationState>({
    isLoading: false,
    showCelebration: false,
    showToast: false,
    toastData: null,
    celebrationData: null,
  });

  const triggerGamifiedAction = useCallback(
    async (event: GamificationEvent) => {
      if (!user?.id) return;

      setState((prev) => ({ ...prev, isLoading: true }));

      try {
        // Track analytics event
        trackEvent({
          ...event.analytics,
          value: {
            userId: user.id,
            ...event.metadata,
          },
        });

        // Handle gamification if applicable
        if (event.gamificationAction) {
          const pointsEarned = calculateUserPointsForAction(
            event.gamificationAction,
          );
          const previousLevel = getUserGamificationLevel(currentPoints);
          const newTotalPoints = currentPoints + pointsEarned;
          const newLevel = getUserGamificationLevel(newTotalPoints);

          // Update points in database
          await makeRequest({
            method: "POST",
            url: routes.api.gamification,
            body: {
              actionType: event.gamificationAction,
            },
          });

          // Determine celebration type
          let celebrationType: "points" | "levelup" | "achievement" = "points";
          let celebrationIntensity: "low" | "medium" | "high" = "medium";
          let toastMessage = event.customMessage || "Great job!";

          // Check for level up
          if (newLevel.currentLevel > previousLevel.currentLevel) {
            celebrationType = "levelup";
            celebrationIntensity = "high";
            toastMessage = `Level Up! Welcome to ${newLevel.currentLevelName}!`;

            // Track level up event
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

          // Override with custom celebration type if provided
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

          console.log(
            "🎮 [useGamifiedAction] Provider functions called successfully",
          );

          // Track points earned event
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
        console.error("Gamified action failed:", error);
      } finally {
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    },
    [
      user?.id,
      trackEvent,
      currentPoints,
      makeRequest,
      triggerCelebration,
      showToast,
    ],
  );

  const dismissCelebration = useCallback(() => {
    setState((prev) => ({
      ...prev,
      showCelebration: false,
      celebrationData: null,
    }));
  }, []);

  const dismissToast = useCallback(() => {
    setState((prev) => ({
      ...prev,
      showToast: false,
      toastData: null,
    }));
  }, []);

  const resetState = useCallback(() => {
    setState({
      isLoading: false,
      showCelebration: false,
      showToast: false,
      toastData: null,
      celebrationData: null,
    });
  }, []);

  return {
    ...state,
    triggerGamifiedAction,
    dismissCelebration,
    dismissToast,
    resetState,
  };
};

export default useGamifiedAction;
