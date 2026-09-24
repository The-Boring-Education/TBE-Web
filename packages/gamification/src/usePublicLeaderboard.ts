import { LEADERBOARD_LIMITS, routes } from "@tbe/constants";
import { CACHE_TIMES, queryKeys, useQuery } from "@tbe/query";
import type { LeaderboardType } from "@tbe/types";
import { sendRequest } from "@tbe/utils";

import type { LeaderboardBoard } from "./types";

/** Masked, logged-out leaderboard for social proof surfaces. */
const usePublicLeaderboard = (
  type: LeaderboardType = "WEEKLY",
  limit: number = LEADERBOARD_LIMITS.PUBLIC,
) => {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.gamification.publicBoard(type, limit),
    queryFn: async () => {
      const res = await sendRequest({
        method: "GET",
        url: `${routes.api.leaderboardPublic}?type=${type}&limit=${limit}`,
      });
      return (res?.data ?? null) as LeaderboardBoard | null;
    },
    ...CACHE_TIMES.DYNAMIC,
  });

  return { board: data ?? null, loading: isLoading };
};

export default usePublicLeaderboard;
