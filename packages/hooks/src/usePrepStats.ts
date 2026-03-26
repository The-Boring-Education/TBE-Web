import { CACHE_TIMES, queryKeys, useQuery } from "@tbe/query";
import type { PrepStats } from "@tbe/services";
import { prepStatsService } from "@tbe/services";

// Single Responsibility: Get the Date object for the Monday of the current week at 00:00:00
const getStartOfWeekMonday = (): Date => {
  const now = new Date();
  const day = now.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const mondayDate = new Date(now);
  mondayDate.setDate(now.getDate() + diffToMonday);
  mondayDate.setHours(0, 0, 0, 0);
  return mondayDate;
};

export function usePrepStats(userId: string) {
  const {
    data: stats,
    isLoading,
    error,
    refetch,
  } = useQuery<PrepStats>({
    queryKey: queryKeys.prepYatra.stats(userId),
    queryFn: () => prepStatsService.getByUserId(userId),
    ...CACHE_TIMES.STANDARD,
    enabled: !!userId,
  });

  const startOfWeek = getStartOfWeekMonday();

  const totalTimeSpent =
    stats?.weeklyLogs?.reduce(
      (acc: number, log: { timeSpent?: number; createdAt?: string }) => {
        if (!log.createdAt) return acc;

        const logDate = new Date(log.createdAt);
        if (logDate >= startOfWeek) {
          return acc + (log.timeSpent || 0);
        }
        return acc;
      },
      0,
    ) || 0;

  const averageTimePerSession =
    stats?.totalLogs && stats.totalLogs > 0
      ? Math.round((totalTimeSpent / stats.totalLogs) * 10) / 10
      : 0;

  return {
    stats: stats ?? null,
    loading: isLoading,
    error: error?.message ?? null,
    currentStreak: stats?.currentStreak || 0,
    longestStreak: stats?.longestStreak || 0,
    totalLogs: stats?.totalLogs || 0,
    totalTimeSpent,
    averageTimePerSession,
    hasLoggedToday: stats?.hasLoggedToday || false,
    recentLogs: stats?.recentLogs || 0,
    weeklyLogs: stats?.weeklyLogs || [],
    lastLoggedDate: stats?.lastLoggedDate,
    refetch,
  };
}
