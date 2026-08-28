import { useUser } from "@tbe/hooks";
import { CACHE_TIMES, queryKeys, useQuery } from "@tbe/query";
import { gamificationApi } from "@tbe/services";
import { sendRequest } from "@tbe/utils";

import { getUserGamificationLevel } from "./utils";

/**
 * Unified hook for reading a user's gamification state.
 *
 * Uses React Query for caching + deduplication, and sends the request
 * via sendRequest / gamificationApi to ensure compatibility across all apps.
 *
 * Returns points, level info, and progress — everything a UI needs
 * to render gamification state without managing its own fetch logic.
 */
const useGamification = (overrideUserId?: string) => {
  const { user } = useUser();
  const userId = overrideUserId ?? user?.id;

  const {
    data: response,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.gamification.points(userId ?? ""),
    queryFn: async () => {
      try {
        const res = await sendRequest({
          method: "GET",
          url: `/gamification?userId=${userId}`,
        });
        if (res && (res.data !== undefined || res.success !== false)) {
          return res;
        }
      } catch {
        // Fallback to services api client
      }
      return await gamificationApi.getuserGamificationPoints(userId!);
    },
    ...CACHE_TIMES.STANDARD,
    enabled: !!userId,
  });

  const points =
    (response as any)?.data?.points ?? (response as any)?.points ?? 0;

  const {
    currentLevel,
    currentLevelName,
    pointsLeftToNextLevel,
    nextLevelName,
    percentageProgress,
  } = getUserGamificationLevel(points);

  return {
    points,
    loading: isLoading,
    error: error?.message ?? null,
    refetch,
    currentLevel,
    currentLevelName,
    nextLevelName,
    pointsLeftToNextLevel,
    percentageProgress,
  };
};

export default useGamification;
