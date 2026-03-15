import { useMemo } from "react";

import { usePrepStats } from "./usePrepStats";

export interface DailyPrepEncouragementData {
  hasLoggedToday: boolean;
  streak: number;
  totalLogs: number;
  totalTimeSpent: number;
  encouragementMessage: string;
  encouragementEmoji: string;
  buttonText: string;
  motivationalTip: string;
}

export function useDailyPrepEncouragement(
  userId: string,
): DailyPrepEncouragementData {
  const { currentStreak, totalLogs, totalTimeSpent, hasLoggedToday } =
    usePrepStats(userId);

  const encouragementData = useMemo(() => {
    let encouragementMessage: string;
    let encouragementEmoji: string;
    let buttonText: string;
    let motivationalTip: string;

    if (hasLoggedToday) {
      // User has already logged today
      encouragementMessage =
        currentStreak > 1
          ? `Amazing! You're on a ${currentStreak}-day streak! 🔥`
          : "Great job logging your prep today! 🎉";
      encouragementEmoji = "✅";
      buttonText = "Add Another Log";
      motivationalTip =
        "Keep the momentum going! Consider adding another study session.";
    } else {
      // User hasn't logged today
      if (currentStreak === 0) {
        // No streak, encourage to start
        encouragementMessage = "Ready to start your prep journey today?";
        encouragementEmoji = "🚀";
        buttonText = "Log Your First Session";
        motivationalTip =
          "Every expert was once a beginner. Start your journey today!";
      } else if (currentStreak === 1) {
        // Just started streak
        encouragementMessage = "Don't break the chain! Add today's prep log.";
        encouragementEmoji = "⏰";
        buttonText = "Continue Your Streak";
        motivationalTip = "Consistency is key. Keep building your daily habit!";
      } else {
        // Has existing streak
        encouragementMessage = `You have a ${currentStreak}-day streak! Don't let it slip away.`;
        encouragementEmoji = "🔥";
        buttonText = "Maintain Your Streak";
        motivationalTip =
          "You're doing great! Each day of preparation brings you closer to your goals.";
      }
    }

    return {
      hasLoggedToday,
      streak: currentStreak,
      totalLogs,
      totalTimeSpent,
      encouragementMessage,
      encouragementEmoji,
      buttonText,
      motivationalTip,
    };
  }, [currentStreak, totalLogs, totalTimeSpent, hasLoggedToday]);

  return encouragementData;
}
