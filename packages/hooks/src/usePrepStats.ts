import { CACHE_TIMES, queryKeys, useQuery } from "@tbe/query";
import type { PrepStats } from "@tbe/services";
import { prepStatsService } from "@tbe/services";

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

  const totalTimeSpent =
    stats?.weeklyLogs?.reduce(
      (acc: number, log: { timeSpent?: number }) => acc + (log.timeSpent || 0),
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
