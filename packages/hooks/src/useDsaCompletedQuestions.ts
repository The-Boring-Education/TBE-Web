import { useCallback, useEffect, useState } from "react";

interface TodayStats {
  date: string;
  solvedCount: number;
}

interface UseDsaCompletedQuestionsReturn {
  completedIds: (string | number)[];
  toggleComplete: (questionId: string | number) => void;
  solvedToday: number;
}

const DEFAULT_STORAGE_KEY = "dsayatra_completed_questions";
const DEFAULT_TODAY_STATS_KEY = "dsayatra_today_stats";

const useDsaCompletedQuestions = (
  storageKey = DEFAULT_STORAGE_KEY,
  todayStatsKey = DEFAULT_TODAY_STATS_KEY,
): UseDsaCompletedQuestionsReturn => {
  const [completedIds, setCompletedIds] = useState<(string | number)[]>([]);
  const [solvedToday, setSolvedToday] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        setCompletedIds(JSON.parse(saved));
      } catch {
        /* corrupted data, start fresh */
      }
    }

    const todayStr = new Date().toDateString();
    const statsStr = localStorage.getItem(todayStatsKey);
    if (statsStr) {
      try {
        const data: TodayStats = JSON.parse(statsStr);
        if (data.date === todayStr) {
          setSolvedToday(data.solvedCount || 0);
        }
      } catch {
        /* corrupted data, start fresh */
      }
    }
  }, [storageKey, todayStatsKey]);

  const toggleComplete = useCallback(
    (questionId: string | number) => {
      // Determine the next state based on the current completedIds from closure
      const isCompletedNow = !completedIds.includes(questionId);
      const next = isCompletedNow
        ? [...completedIds, questionId]
        : completedIds.filter((id) => id !== questionId);

      // 1. Update React state
      setCompletedIds(next);

      // 2. Perform side effects (LocalStorage, etc.)
      localStorage.setItem(storageKey, JSON.stringify(next));

      const todayStr = new Date().toDateString();
      const todayStatsStr = localStorage.getItem(todayStatsKey);
      let todayStats: TodayStats = todayStatsStr
        ? JSON.parse(todayStatsStr)
        : { date: todayStr, solvedCount: 0 };

      if (todayStats.date !== todayStr) {
        todayStats = { date: todayStr, solvedCount: 0 };
      }

      if (isCompletedNow) {
        todayStats.solvedCount += 1;
      } else if (todayStats.solvedCount > 0) {
        todayStats.solvedCount -= 1;
      }

      localStorage.setItem(todayStatsKey, JSON.stringify(todayStats));
      setSolvedToday(todayStats.solvedCount);
    },
    [completedIds, storageKey, todayStatsKey],
  );

  return { completedIds, toggleComplete, solvedToday };
};

export default useDsaCompletedQuestions;
