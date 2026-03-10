import { useCallback, useEffect, useState } from "react";

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

export function usePyGamification(userId?: string) {
  const [data, setData] = useState<{
    points: number;
    actions: unknown[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch gamification data from backend
  const fetchGamificationData = useCallback(async () => {
    if (!userId) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/gamification?userId=${userId}`,
      );
      const result = await res.json();
      if (!result.success) {
        throw new Error(result.message || "Failed to fetch gamification data");
      }
      setData(result.data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to fetch gamification data",
      );
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchGamificationData();
    // Listen for global refetch event
    const handleRefetch = () => fetchGamificationData();
    window.addEventListener("gamification-refetch", handleRefetch);
    return () =>
      window.removeEventListener("gamification-refetch", handleRefetch);
  }, [fetchGamificationData]);

  // Calculate current level based on points
  const getCurrentLevel = (): GamificationLevel => {
    if (!data?.points) {
      return LEVELS[0]!;
    }

    const matchedLevel: GamificationLevel | undefined = LEVELS.find(
      (level) =>
        data.points >= level.minPoints && data.points <= level.maxPoints,
    );
    if (matchedLevel) {
      return matchedLevel;
    }
    return LEVELS[0]!;
  };

  // Calculate progress to next level
  const getProgressToNextLevel = () => {
    if (!data?.points) {
      return 0;
    }

    const currentLevel = getCurrentLevel();
    const pointsInCurrentLevel = data.points - currentLevel.minPoints;
    const pointsNeededForLevel =
      currentLevel.maxPoints - currentLevel.minPoints;

    return Math.min((pointsInCurrentLevel / pointsNeededForLevel) * 100, 100);
  };

  // Get next level info
  const getNextLevel = (): GamificationLevel | null => {
    const currentLevel = getCurrentLevel();
    const nextLevelIndex = LEVELS.findIndex(
      (level) => level.level === currentLevel.level + 1,
    );
    if (nextLevelIndex < 0 || nextLevelIndex >= LEVELS.length) {
      return null;
    }
    return LEVELS[nextLevelIndex]!;
  };

  // Get points needed for next level
  const getPointsNeededForNextLevel = (): number => {
    const nextLevel = getNextLevel();
    if (!nextLevel || !data?.points) {
      return 0;
    }
    return nextLevel.minPoints - data.points;
  };

  const currentLevel = getCurrentLevel();
  const nextLevel = getNextLevel();
  const progressToNextLevel = getProgressToNextLevel();
  const pointsNeededForNextLevel = getPointsNeededForNextLevel();

  return {
    points: data?.points || 0,
    actions: data?.actions || [],
    loading,
    error,
    refetch: fetchGamificationData,
    currentLevel: currentLevel.level,
    currentLevelName: currentLevel.name,
    nextLevel: nextLevel?.level || null,
    nextLevelName: nextLevel?.name || null,
    percentageProgress: progressToNextLevel,
    pointsNeededForNextLevel,
  };
}
