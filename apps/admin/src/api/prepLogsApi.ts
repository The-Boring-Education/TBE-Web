import { useQuery } from "@tanstack/react-query";

import { getBaseUrlForPlatformEnv } from "@/hooks/useEnvironment";
import api from "@/lib/axios";
import type {
  PrepLogsResponse,
  PrepLogsSummary,
  UserWithPrepLogs,
} from "@/types";

export const usePrepLogs = () => {
  const query = useQuery<PrepLogsResponse>({
    queryKey: ["prep-logs", getBaseUrlForPlatformEnv()],
    queryFn: async () => {
      const response = await api.get("/admin/prepyatra/userlogs");
      return response.data;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  return {
    ...query,
    data: query.data?.data?.users || [],
    totalUsers: query.data?.data?.totalUsers || 0,
    isLoading: query.isLoading,
  };
};

export const addMentorFeedback = async (params: {
  prepLogId: string;
  mentorFeedback: string;
  notifyEmail?: boolean;
  userId?: string;
  userName?: string;
  userEmail?: string;
}) => {
  const response = await api.patch("/prepyatra/prep-log", params);
  return response.data;
};

export const usePrepLogsSummary = () => {
  const { data: users, isLoading } = usePrepLogs();

  const calculateSummary = (): PrepLogsSummary => {
    if (!users || users.length === 0) {
      return {
        totalUsers: 0,
        activeUsersToday: 0,
        totalLogsToday: 0,
        averageStreak: 0,
        totalTimeSpent: 0,
        mostActiveUser: "",
        averageTimePerLog: 0,
      };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const activeUsersToday = users.filter((user) => {
      const lastLoggedDate = new Date(user.prepLogStats.lastLoggedDate);
      lastLoggedDate.setHours(0, 0, 0, 0);
      return lastLoggedDate.getTime() === today.getTime();
    }).length;

    const totalLogsToday = users.reduce((total, user) => {
      const todayLogs = user.logs.filter((log) => {
        const logDate = new Date(log.createdAt);
        logDate.setHours(0, 0, 0, 0);
        return logDate.getTime() === today.getTime();
      });
      return total + todayLogs.length;
    }, 0);

    const totalTimeSpent = users.reduce((total, user) => {
      return (
        total +
        user.logs.reduce((userTotal, log) => userTotal + log.timeSpent, 0)
      );
    }, 0);

    const averageStreak =
      users.reduce(
        (total, user) => total + user.prepLogStats.currentStreak,
        0,
      ) / users.length;

    const mostActiveUser = users.reduce(
      (mostActive, user) => {
        return user.totalLogs > (mostActive?.totalLogs || 0)
          ? user
          : mostActive;
      },
      null as UserWithPrepLogs | null,
    );

    const totalLogs = users.reduce((total, user) => total + user.totalLogs, 0);
    const averageTimePerLog = totalLogs > 0 ? totalTimeSpent / totalLogs : 0;

    return {
      totalUsers: users.length,
      activeUsersToday,
      totalLogsToday,
      averageStreak: Math.round(averageStreak * 10) / 10,
      totalTimeSpent,
      mostActiveUser: mostActiveUser?.name || "",
      averageTimePerLog: Math.round(averageTimePerLog * 10) / 10,
    };
  };

  return {
    summary: calculateSummary(),
    isLoading,
  };
};
