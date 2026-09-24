import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getBaseUrlForPlatformEnv } from "@/hooks/useEnvironment";
import api from "@/lib/axios";

export type LeaderboardType = "DAILY" | "WEEKLY" | "MONTHLY";

export interface AdminLeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  image?: string;
  score: number;
  hidden?: boolean;
  excluded?: boolean;
}

export interface AdminPeriodChampions {
  type: LeaderboardType;
  periodKey: string;
  closedAt: string;
  champions: {
    rank: number;
    userId: string;
    displayName: string;
    score: number;
  }[];
}

export interface AdminLeaderboardData {
  board: {
    type: LeaderboardType;
    periodKey: string;
    resetsAt: string;
    totalLearners: number;
    entries: AdminLeaderboardEntry[];
  };
  champions: AdminPeriodChampions[];
}

const leaderboardKey = (type: LeaderboardType, periodKey: string) => [
  "admin-leaderboard",
  getBaseUrlForPlatformEnv(),
  type,
  periodKey,
];

export const useAdminLeaderboard = (
  type: LeaderboardType,
  periodKey: string,
) =>
  useQuery<AdminLeaderboardData>({
    queryKey: leaderboardKey(type, periodKey),
    queryFn: async () => {
      const params = new URLSearchParams({ type, limit: "50" });
      if (periodKey) params.set("periodKey", periodKey);
      const response = await api.get(`/admin/leaderboard?${params}`);
      return response.data.data;
    },
  });

export const useSetLeaderboardExclusion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { userId: string; excluded: boolean }) => {
      const response = await api.patch("/admin/leaderboard/exclusion", params);
      return response.data;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["admin-leaderboard"] }),
  });
};

export const useClosePeriod = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { type: LeaderboardType; periodKey?: string }) => {
      const response = await api.post("/leaderboard/close-period", params);
      return response.data;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["admin-leaderboard"] }),
  });
};
