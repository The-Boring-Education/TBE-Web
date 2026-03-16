import { routes } from "@tbe/constants";
import { useUser } from "@tbe/hooks";
import { CACHE_TIMES, queryKeys, useQuery } from "@tbe/query";
import { getUserGamificationLevel, sendRequest } from "@tbe/utils";

const useGamification = () => {
  const { user } = useUser();
  const userId = user?.id;

  const {
    data: response,
    isLoading,
    error,
  } = useQuery<any>({
    queryKey: queryKeys.gamification.points(userId ?? ""),
    queryFn: () =>
      sendRequest({
        method: "GET",
        url: `${routes.api.gamification}?userId=${userId}`,
        headers: { "Content-Type": "application/json" },
      }),
    ...CACHE_TIMES.STANDARD,
    enabled: !!userId,
  });

  const points = response?.data?.points ?? 0;

  const {
    currentLevel,
    currentLevelName,
    pointsLeftToNextLevel,
    nextLevelName,
    percentageProgress,
  } = getUserGamificationLevel(points);

  return {
    loading: isLoading,
    error: error ?? null,
    points,
    currentLevel,
    currentLevelName,
    pointsLeftToNextLevel,
    nextLevelName,
    percentageProgress,
  };
};

export default useGamification;
