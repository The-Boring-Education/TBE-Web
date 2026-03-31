import { routes } from "@tbe/constants";
import { sendRequest } from "@tbe/utils";
import { useCallback, useEffect, useRef, useState } from "react";

import useUser from "./useUser";

interface TodayStats {
  date: string;
  solvedCount: number;
}

interface UseDsaCompletedQuestionsReturn {
  completedIds: (string | number)[];
  toggleComplete: (questionId: string | number) => void;
  solvedToday: number;
  isSyncing: boolean;
  localNotes: Record<string, string>;
  saveNote: (questionId: string | number, notes: string) => Promise<void>;
}

const DEFAULT_STORAGE_KEY = "dsayatra_completed_questions";
const DEFAULT_TODAY_STATS_KEY = "dsayatra_today_stats";

const useDsaCompletedQuestions = (
  storageKey = DEFAULT_STORAGE_KEY,
  todayStatsKey = DEFAULT_TODAY_STATS_KEY,
): UseDsaCompletedQuestionsReturn => {
  const { user, isAuth } = useUser();
  const [completedIds, setCompletedIds] = useState<(string | number)[]>([]);
  const [solvedToday, setSolvedToday] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [localNotes, setLocalNotes] = useState<Record<string, string>>({});
  const hasSyncedInitial = useRef(false);

  // Load from localStorage on mount
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

    const notes = localStorage.getItem("dsayatra_question_notes");
    if (notes) {
      try {
        setLocalNotes(JSON.parse(notes));
      } catch {
        /* corrupted data, start fresh */
      }
    }
  }, [storageKey, todayStatsKey]);

  // Sync with DB when logged in
  useEffect(() => {
    const syncWithDB = async () => {
      if (!isAuth || !user?.id || hasSyncedInitial.current) return;

      setIsSyncing(true);
      try {
        // 1. Send current localStorage data to DB (merge)
        const localData = localStorage.getItem(storageKey);
        const localIds: (string | number)[] = localData
          ? JSON.parse(localData)
          : [];

        // Also look for local notes
        const localNotesData = localStorage.getItem("dsayatra_question_notes");
        const localNotes: Record<string, string> = localNotesData
          ? JSON.parse(localNotesData)
          : {};

        const questionsToSync = localIds.map((id) => ({
          questionId: String(id),
          isCompleted: true,
          notes: localNotes[String(id)] || "",
        }));

        // Add questions that have notes but aren't completed
        Object.keys(localNotes).forEach((id) => {
          if (!localIds.includes(id)) {
            questionsToSync.push({
              questionId: id,
              isCompleted: false,
              notes: localNotes[id] || "",
            });
          }
        });

        if (questionsToSync.length === 0) {
          hasSyncedInitial.current = true;
          setIsSyncing(false);
          return;
        }

        const response = await sendRequest({
          url: `${routes.api.base}${routes.api.dsaSync}`,
          method: "POST",
          body: {
            userId: user.id,
            questions: questionsToSync,
          },
        });

        if (response.status && response.data?.questions) {
          // 2. Update local state with merged data from DB
          const dbQuestions = response.data.questions;
          const dbCompletedIds = dbQuestions
            .filter((q: any) => q.isCompleted)
            .map((q: any) => q.questionId);

          const dbNotes: Record<string, string> = {};
          dbQuestions.forEach((q: any) => {
            if (q.notes) dbNotes[q.questionId] = q.notes;
          });

          // Merge local and DB IDs (unique)
          const mergedIds = Array.from(
            new Set([...localIds, ...dbCompletedIds]),
          );
          setCompletedIds(mergedIds);
          localStorage.setItem(storageKey, JSON.stringify(mergedIds));

          // Merge notes
          const mergedNotes = { ...localNotes, ...dbNotes };
          localStorage.setItem(
            "dsayatra_question_notes",
            JSON.stringify(mergedNotes),
          );
          setLocalNotes(mergedNotes);

          hasSyncedInitial.current = true;
        }
      } catch (error) {
        console.error("Failed to sync DSA progress with DB", error);
      } finally {
        setIsSyncing(false);
      }
    };

    syncWithDB();
  }, [isAuth, user?.id, storageKey]);

  const toggleComplete = useCallback(
    async (questionId: string | number) => {
      setCompletedIds((prev) => {
        const isCompletedNow = !prev.includes(questionId);
        const next = isCompletedNow
          ? [...prev, questionId]
          : prev.filter((id) => id !== questionId);

        // 1. Update LocalStorage
        localStorage.setItem(storageKey, JSON.stringify(next));

        // 2. Update Today Stats
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

        // 3. Update DB if logged in
        if (isAuth && user?.id) {
          const localNotesData = localStorage.getItem(
            "dsayatra_question_notes",
          );
          const localNotes = localNotesData ? JSON.parse(localNotesData) : {};

          sendRequest({
            url: `${routes.api.base}${routes.api.dsaSync}`,
            method: "POST",
            body: {
              userId: user.id,
              questions: [
                {
                  questionId: String(questionId),
                  isCompleted: isCompletedNow,
                  notes: localNotes[String(questionId)] || "",
                },
              ],
            },
          }).catch((err) =>
            console.error("Failed to sync toggle with DB", err),
          );
        }

        return next;
      });
    },
    [isAuth, user?.id, storageKey, todayStatsKey],
  );

  const saveNote = useCallback(
    async (questionId: string | number, notes: string) => {
      const qId = String(questionId);

      // 1. Update local state
      setLocalNotes((prev) => {
        const next = { ...prev, [qId]: notes };
        localStorage.setItem("dsayatra_question_notes", JSON.stringify(next));
        return next;
      });

      // 2. Update DB if logged in
      if (isAuth && user?.id) {
        try {
          await sendRequest({
            url: `${routes.api.base}${routes.api.dsaQuestionNote}`,
            method: "POST",
            body: {
              userId: user.id,
              questionId: qId,
              notes,
            },
          });
        } catch (error) {
          console.error("Failed to sync note to DB", error);
        }
      }
    },
    [isAuth, user?.id],
  );

  return {
    completedIds,
    toggleComplete,
    solvedToday,
    isSyncing,
    localNotes,
    saveNote,
  };
};

export default useDsaCompletedQuestions;
