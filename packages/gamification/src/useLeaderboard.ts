import { routes } from "@tbe/constants";
import { CACHE_TIMES, queryKeys, useQuery } from "@tbe/query";
import type { LeaderboardType } from "@tbe/types";
import { sendRequest } from "@tbe/utils";

/**
 * Fetches the leaderboard for a given time period.
 *
 * FIX: Includes `tab` in the queryKey so DAILY/WEEKLY/MONTHLY
 * each get their own cache entry (the old hook shared one key).
 */
const useLeaderboard = (tab: LeaderboardType) => {
  const { data: response, isLoading } = useQuery({
    queryKey: [...queryKeys.gamification.leaderboard(), tab],
    queryFn: () =>
      sendRequest({
        method: "GET",
        url: `${routes.api.leaderboard}?type=${tab}`,
      }),
    ...CACHE_TIMES.DYNAMIC,
  });

  const data = (response as any)?.data?.entries ?? [];

  return { data, loading: isLoading };
};

export default useLeaderboard;
