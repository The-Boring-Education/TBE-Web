import { routes } from "@tbe/constants";
import { useUser } from "@tbe/hooks";
import { CACHE_TIMES, queryKeys, useQuery } from "@tbe/query";
import type { LeaderboardType } from "@tbe/types";
import { sendRequest } from "@tbe/utils";

import type { PeriodChampions } from "./types";
import { unwrapData } from "./unwrap";

/** Champions of the Period just before the current one (null until it is closed). */
const useLeaderboardChampions = (type: LeaderboardType, enabled = true) => {
  const { user } = useUser();
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.gamification.champions(type, user?.id),
    queryFn: async () => {
      const res = await sendRequest({
        method: "GET",
        url: `${routes.api.leaderboardChampions}?type=${type}`,
      });
      return unwrapData<PeriodChampions | null>(res);
    },
    ...CACHE_TIMES.STANDARD,
    enabled,
  });

  return { champions: data ?? null, loading: isLoading };
};

export default useLeaderboardChampions;
