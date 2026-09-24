import { routes } from "@tbe/constants";
import { useUser } from "@tbe/hooks";
import {
  CACHE_TIMES,
  queryKeys,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tbe/query";
import { sendRequest } from "@tbe/utils";

import type { LeaderboardPreferences } from "./types";

/** Read and change Leaderboard Visibility and leaderboard email preferences. */
const useLeaderboardPreferences = () => {
  const { user } = useUser();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.gamification.preferences(),
    queryFn: async () => {
      const res = await sendRequest({
        method: "GET",
        url: routes.api.leaderboardPreferences,
      });
      return (res?.data ?? null) as LeaderboardPreferences | null;
    },
    ...CACHE_TIMES.STANDARD,
    enabled: !!user?.id,
  });

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (
      changes: Partial<Pick<LeaderboardPreferences, "visible" | "emails">>,
    ) => {
      const res = await sendRequest({
        method: "PATCH",
        url: routes.api.leaderboardPreferences,
        body: changes,
      });
      if (!res?.status) {
        throw new Error(res?.message || "Failed to update preferences");
      }
      return res.data as LeaderboardPreferences;
    },
    // Optimistic: the toggle flips immediately and rolls back on failure.
    onMutate: async (changes) => {
      const key = queryKeys.gamification.preferences();
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<LeaderboardPreferences | null>(
        key,
      );
      if (previous) {
        queryClient.setQueryData(key, { ...previous, ...changes });
      }
      return { previous };
    },
    onError: (_error, _changes, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          queryKeys.gamification.preferences(),
          context.previous,
        );
      }
    },
    onSuccess: (prefs) => {
      queryClient.setQueryData(queryKeys.gamification.preferences(), prefs);
      void queryClient.invalidateQueries({
        queryKey: queryKeys.gamification.leaderboard(),
      });
    },
  });

  return {
    preferences: data ?? null,
    loading: isLoading,
    updatePreferences: mutateAsync,
    updating: isPending,
  };
};

export default useLeaderboardPreferences;
