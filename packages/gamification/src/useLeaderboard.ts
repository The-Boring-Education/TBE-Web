import { LEADERBOARD_LIMITS, routes } from "@tbe/constants";
import { CACHE_TIMES, queryKeys, useQuery } from "@tbe/query";
import type { LeaderboardType } from "@tbe/types";
import { sendRequest } from "@tbe/utils";

import type { LeaderboardBoard } from "./types";

/**
 * Live leaderboard for the current Period of `type`.
 * Each type (and limit) has its own cache entry, so tabs never share data.
 */
const useLeaderboard = (
  type: LeaderboardType,
  {
    limit = LEADERBOARD_LIMITS.DASHBOARD as number,
    enabled = true,
  }: { limit?: number; enabled?: boolean } = {},
) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.gamification.board(type, limit),
    queryFn: async () => {
      const res = await sendRequest({
        method: "GET",
        url: `${routes.api.leaderboard}?type=${type}&limit=${limit}`,
      });
      return (res?.data ?? null) as LeaderboardBoard | null;
    },
    ...CACHE_TIMES.DYNAMIC,
    enabled,
  });

  return {
    board: data ?? null,
    entries: data?.entries ?? [],
    viewer: data?.viewer ?? null,
    loading: isLoading,
    error: error?.message ?? null,
    refetch,
  };
};

export default useLeaderboard;
