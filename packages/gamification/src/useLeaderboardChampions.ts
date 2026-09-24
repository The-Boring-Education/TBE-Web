import { routes } from "@tbe/constants";
import { CACHE_TIMES, queryKeys, useQuery } from "@tbe/query";
import type { LeaderboardType } from "@tbe/types";
import { sendRequest } from "@tbe/utils";

import type { PeriodChampions } from "./types";

/** Champions of the Period just before the current one (null until it is closed). */
const useLeaderboardChampions = (type: LeaderboardType, enabled = true) => {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.gamification.champions(type),
    queryFn: async () => {
      const res = await sendRequest({
        method: "GET",
        url: `${routes.api.leaderboardChampions}?type=${type}`,
      });
      return (res?.data ?? null) as PeriodChampions | null;
    },
    ...CACHE_TIMES.STANDARD,
    enabled,
  });

  return { champions: data ?? null, loading: isLoading };
};

export default useLeaderboardChampions;
