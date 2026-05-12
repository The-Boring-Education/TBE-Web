import type { DatabaseQueryResponseType, TBEAppType } from "@/lib/interfaces";
import { logger } from "@/lib/utils/logger";

import { UserActivityLog } from "../models";

export interface StreakDay {
  date: string;
  hasActivity: boolean;
  apps: TBEAppType[];
}

export interface UserStreakData {
  currentStreak: number;
  longestStreak: number;
  last30Days: StreakDay[];
  totalActiveDays: number;
}

/**
 * Compute the current (consecutive days from today) and longest streak
 * from a sorted array of unique ISO date strings (descending order).
 */
const computeStreaks = (
  activeDates: string[],
): { currentStreak: number; longestStreak: number } => {
  if (activeDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().slice(0, 10);

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  const dateSet = new Set(activeDates);

  // Current streak: count consecutive days ending today or yesterday
  let currentStreak = 0;
  const streakStart = dateSet.has(todayStr)
    ? todayStr
    : dateSet.has(yesterdayStr)
      ? yesterdayStr
      : null;

  if (streakStart) {
    const cursor = new Date(streakStart);
    cursor.setHours(0, 0, 0, 0);
    while (dateSet.has(cursor.toISOString().slice(0, 10))) {
      currentStreak += 1;
      cursor.setDate(cursor.getDate() - 1);
    }
  }

  // Longest streak: scan through all dates in ascending order
  const sorted = [...activeDates].sort();
  let longestStreak = 0;
  let runStreak = 1;

  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1] as string);
    const curr = new Date(sorted[i] as string);
    const diffDays = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);

    if (diffDays === 1) {
      runStreak += 1;
    } else {
      longestStreak = Math.max(longestStreak, runStreak);
      runStreak = 1;
    }
  }
  longestStreak = Math.max(longestStreak, runStreak);

  return { currentStreak, longestStreak };
};

/**
 * Returns the user's last-30-days streak data plus current and longest streak.
 * The longest streak is computed over all available history, not just 30 days.
 */
const getUserStreakFromDB = async (
  userId: string,
  app?: TBEAppType,
): Promise<DatabaseQueryResponseType> => {
  try {
    const baseMatch: Record<string, unknown> = { userId };
    if (app) baseMatch.app = app;

    // Fetch all activity dates (for all-time longest streak)
    const allDatesRaw = await UserActivityLog.distinct("date", baseMatch);
    const allDates: string[] = allDatesRaw.sort();

    const { currentStreak, longestStreak } = computeStreaks(allDates);

    // Build last-30-days breakdown
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const last30Days: StreakDay[] = [];
    for (let i = 29; i >= 0; i--) {
      const day = new Date(today);
      day.setDate(today.getDate() - i);
      const dateStr = day.toISOString().slice(0, 10);
      last30Days.push({ date: dateStr, hasActivity: false, apps: [] });
    }

    // Get per-day app breakdowns for the last 30 days
    const thirtyDaysAgo = last30Days[0]!.date;
    const activityInWindow = await UserActivityLog.aggregate([
      {
        $match: {
          ...baseMatch,
          date: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: { date: "$date" },
          apps: { $addToSet: "$app" },
        },
      },
    ]);

    const activityMap = new Map<string, TBEAppType[]>();
    for (const entry of activityInWindow) {
      activityMap.set(entry._id.date, entry.apps);
    }

    for (const day of last30Days) {
      const appsForDay = activityMap.get(day.date);
      if (appsForDay) {
        day.hasActivity = true;
        day.apps = appsForDay;
      }
    }

    const data: UserStreakData = {
      currentStreak,
      longestStreak,
      last30Days,
      totalActiveDays: allDates.length,
    };

    return { data };
  } catch (error) {
    logger.error("DB: getUserStreakFromDB failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return { error: "Failed to fetch user streak", details: error };
  }
};

export { getUserStreakFromDB };
