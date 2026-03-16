import { CACHE_TIMES, queryKeys, useQuery } from "@tbe/query";
import { prepLogsService } from "@tbe/services";

export interface PrepLog {
  _id: string;
  user: string;
  title: string;
  description?: string;
  timeSpent: number;
  mentorFeedback?: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface PrepLogsResponse {
  status: boolean;
  data: PrepLog[];
}

export function usePrepLogs(userId: string) {
  const {
    data: logs = [],
    isLoading,
    error,
    refetch,
  } = useQuery<PrepLog[]>({
    queryKey: queryKeys.prepYatra.logs(userId),
    queryFn: () => prepLogsService.getByUserId(userId),
    ...CACHE_TIMES.STANDARD,
    enabled: !!userId,
  });

  const totalTimeSpent = logs.reduce(
    (acc, log) => acc + (log.timeSpent || 0),
    0,
  );
  const totalLogs = logs.length;

  const calculateStreak = () => {
    if (logs.length === 0) return 0;

    const sortedLogs = [...logs].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let streak = 0;
    let currentDate = new Date(today);

    for (const log of sortedLogs) {
      const logDate = new Date(log.createdAt);
      logDate.setHours(0, 0, 0, 0);

      const diffTime = currentDate.getTime() - logDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= 1) {
        streak++;
        currentDate = logDate;
      } else {
        break;
      }
    }

    return streak;
  };

  const streak = calculateStreak();

  const getRecentActivity = () => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return logs.filter((log) => new Date(log.createdAt) >= sevenDaysAgo);
  };

  const recentActivity = getRecentActivity();

  return {
    logs,
    loading: isLoading,
    error: error?.message ?? null,
    totalTimeSpent,
    totalLogs,
    streak,
    recentActivity,
    refetch,
  };
}
