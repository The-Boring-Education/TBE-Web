import { CACHE_TIMES, queryKeys, useQuery } from "@tbe/query";

export interface GamificationAction {
  actionType: string;
  pointsEarned: number;
  createdAt: string;
}

export interface GamificationData {
  points: number;
  actions: GamificationAction[];
}

export interface GamificationLevel {
  level: number;
  name: string;
  minPoints: number;
  maxPoints: number;
}

const LEVELS: GamificationLevel[] = [
  { level: 1, name: "Noob", minPoints: 0, maxPoints: 499 },
  { level: 2, name: "Coder", minPoints: 500, maxPoints: 999 },
  { level: 3, name: "Debugger", minPoints: 1000, maxPoints: 1999 },
  { level: 4, name: "Ninja", minPoints: 2000, maxPoints: 2999 },
  { level: 5, name: "Squasher", minPoints: 3000, maxPoints: 4499 },
  { level: 6, name: "Hacker", minPoints: 4500, maxPoints: 5999 },
  { level: 7, name: "Wizard", minPoints: 6000, maxPoints: 7499 },
  { level: 8, name: "Guru", minPoints: 7500, maxPoints: 8999 },
  { level: 9, name: "Architect", minPoints: 9000, maxPoints: 9999 },
  { level: 10, name: "Legend", minPoints: 10000, maxPoints: Infinity },
];

interface GamificationApiResponse {
  success: boolean;
  message?: string;
  data: { points: number; actions: unknown[] };
}

export function usePyGamification(userId?: string) {
  const { data, isLoading, error, refetch } = useQuery<GamificationApiResponse>(
    {
      queryKey: queryKeys.gamification.points(userId ?? ""),
      queryFn: async () => {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/gamification?userId=${userId}`,
        );
        const result = await res.json();
        if (!result.success) {
          throw new Error(
            result.message || "Failed to fetch gamification data",
          );
        }
        return result;
      },
      ...CACHE_TIMES.STANDARD,
      enabled: !!userId,
    },
  );

  const getCurrentLevel = (): GamificationLevel => {
    const points = data?.data?.points;
    if (!points) return LEVELS[0]!;
    return (
      LEVELS.find(
        (level) => points >= level.minPoints && points <= level.maxPoints,
      ) ?? LEVELS[0]!
    );
  };

  const getProgressToNextLevel = () => {
    const points = data?.data?.points;
    if (!points) return 0;
    const currentLevel = getCurrentLevel();
    const pointsInCurrentLevel = points - currentLevel.minPoints;
    const pointsNeededForLevel =
      currentLevel.maxPoints - currentLevel.minPoints;
    return Math.min((pointsInCurrentLevel / pointsNeededForLevel) * 100, 100);
  };

  const getNextLevel = (): GamificationLevel | null => {
    const currentLevel = getCurrentLevel();
    const nextLevelIndex = LEVELS.findIndex(
      (level) => level.level === currentLevel.level + 1,
    );
    if (nextLevelIndex < 0 || nextLevelIndex >= LEVELS.length) return null;
    return LEVELS[nextLevelIndex]!;
  };

  const getPointsNeededForNextLevel = (): number => {
    const nextLevel = getNextLevel();
    const points = data?.data?.points;
    if (!nextLevel || !points) return 0;
    return nextLevel.minPoints - points;
  };

  const currentLevel = getCurrentLevel();
  const nextLevel = getNextLevel();
  const progressToNextLevel = getProgressToNextLevel();
  const pointsNeededForNextLevel = getPointsNeededForNextLevel();

  return {
    points: data?.data?.points || 0,
    actions: data?.data?.actions || [],
    loading: isLoading,
    error: error?.message ?? null,
    refetch,
    currentLevel: currentLevel.level,
    currentLevelName: currentLevel.name,
    nextLevel: nextLevel?.level || null,
    nextLevelName: nextLevel?.name || null,
    percentageProgress: progressToNextLevel,
    pointsNeededForNextLevel,
  };
}
