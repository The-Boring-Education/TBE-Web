import { routes } from "@tbe/constants";
import { useUser } from "@tbe/hooks";
import { CACHE_TIMES, queryKeys, useQuery } from "@tbe/query";
import { sendRequest } from "@tbe/utils";

import type { MyLeaderboard } from "./types";

/** The signed-in learner's standing in every current Period, badges and preferences. */
const useMyLeaderboard = () => {
  const { user } = useUser();
  const { data, isLoading, refetch } = useQuery({
    queryKey: queryKeys.gamification.myStanding(),
    queryFn: async () => {
      const res = await sendRequest({
        method: "GET",
        url: routes.api.leaderboardMe,
      });
      return (res?.data ?? null) as MyLeaderboard | null;
    },
    ...CACHE_TIMES.DYNAMIC,
    enabled: !!user?.id,
  });

  return { my: data ?? null, loading: isLoading, refetch };
};

export default useMyLeaderboard;
