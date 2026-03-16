import { routes } from "@tbe/constants";
import type { LeaderboardType } from "@tbe/interface";
import { CACHE_TIMES, queryKeys, useQuery } from "@tbe/query";
import { sendRequest } from "@tbe/utils";

const useLeaderboard = (tab: LeaderboardType) => {
  const { data: response, isLoading } = useQuery<any>({
    queryKey: queryKeys.gamification.leaderboard(),
    queryFn: () =>
      sendRequest({
        method: "GET",
        url: `${routes.api.leaderboard}?type=${tab}`,
      }),
    ...CACHE_TIMES.DYNAMIC,
  });

  const data = response?.data?.entries ?? [];

  return { data, loading: isLoading };
};

export default useLeaderboard;
