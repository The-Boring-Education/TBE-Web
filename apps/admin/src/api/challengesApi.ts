import { useQuery } from "@tanstack/react-query";
import axios from "axios";

import { getBaseUrlForPlatformEnv } from "@/hooks/useEnvironment";
import { logApiError } from "@/utils/errorLogger";

// Challenge Statistics Interface
export interface ChallengeStats {
  totalChallenges: number;
  activeChallenges: number;
  completedChallenges: number;
  totalUsers: number;
  totalLogs: number;
  popularTypes: {
    _id: string;
    count: number;
  }[];
  recentActivity: number;
}

// API Response Interface
interface ChallengeStatsResponse {
  status: boolean;
  message: string;
  data: ChallengeStats;
}

const challengesApi = axios.create({
  baseURL: getBaseUrlForPlatformEnv(),
  headers: {
    "Content-Type": "application/json",
    "x-admin-secret": "TBEAdmin",
  },
});

// Fetch challenge statistics
export const useChallengeStats = () => {
  return useQuery({
    queryKey: ["challengeStats"],
    queryFn: async (): Promise<ChallengeStats> => {
      try {
        const response = await challengesApi.get("/admin/prepyatra/challenges");

        const result: ChallengeStatsResponse = response.data;

        if (!result.status) {
          throw new Error(result.message || "Failed to fetch challenge stats");
        }

        return result.data;
      } catch (error) {
        logApiError(error, "Fetch Challenge Stats");
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // 10 minutes
  });
};
