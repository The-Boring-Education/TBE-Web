import { useUser } from "@tbe/hooks";
import { CACHE_TIMES, queryKeys, useQuery } from "@tbe/query";
import { gamificationApi } from "@tbe/services";

import { getUserGamificationLevel } from "./utils";

/**
 * Unified hook for reading a user's gamification state.
 *
 * Uses React Query for caching + deduplication, and gamificationApi
 * from @tbe/services for the network call.
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
    queryFn: () => gamificationApi.getuserGamificationPoints(userId!),
    ...CACHE_TIMES.STANDARD,
    enabled: !!userId,
  });

  const points = (response as any)?.data?.points ?? 0;

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
