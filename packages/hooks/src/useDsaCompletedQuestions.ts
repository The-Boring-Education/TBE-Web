import { routes } from "@tbe/constants";
import { CACHE_TIMES, queryKeys, useQuery, useQueryClient } from "@tbe/query";
import { sendRequest } from "@tbe/utils";
import { useCallback, useEffect, useMemo, useState } from "react";

interface TodayStats {
  date: string;
  solvedCount: number;
}

interface DsaProgressPayload {
  completedQuestionIds: string[];
  solvedToday: number;
}

export interface UseDsaCompletedQuestionsOptions {
  userId?: string | null;
  storageKey?: string;
  todayStatsKey?: string;
}

interface UseDsaCompletedQuestionsReturn {
  completedIds: (string | number)[];
  toggleComplete: (questionId: string | number) => void;
  solvedToday: number;
  /** True while loading server progress for an authenticated user */
  isProgressLoading: boolean;
  localNotes: Record<string, string>;
  saveNote: (questionId: string | number, notes: string) => Promise<void>;
}

const DEFAULT_STORAGE_KEY = "dsayatra_completed_questions";
const DEFAULT_TODAY_STATS_KEY = "dsayatra_today_stats";
const NOTES_STORAGE_KEY = "dsayatra_question_notes";

function resolveArgs(
  optionsOrLegacyStorageKey?: UseDsaCompletedQuestionsOptions | string,
  legacyTodayStatsKey?: string,
): Required<Omit<UseDsaCompletedQuestionsOptions, "userId">> & {
  userId?: string | null;
} {
  if (typeof optionsOrLegacyStorageKey === "string") {
    return {
      userId: undefined,
      storageKey: optionsOrLegacyStorageKey,
      todayStatsKey: legacyTodayStatsKey ?? DEFAULT_TODAY_STATS_KEY,
    };
  }
  const o = optionsOrLegacyStorageKey ?? {};
  return {
    userId: o.userId,
    storageKey: o.storageKey ?? DEFAULT_STORAGE_KEY,
    todayStatsKey: o.todayStatsKey ?? DEFAULT_TODAY_STATS_KEY,
  };
}

const useDsaCompletedQuestions = (
  optionsOrLegacyStorageKey?: UseDsaCompletedQuestionsOptions | string,
  legacyTodayStatsKey?: string,
): UseDsaCompletedQuestionsReturn => {
  const { userId, storageKey, todayStatsKey } = resolveArgs(
    optionsOrLegacyStorageKey,
    legacyTodayStatsKey,
  );

  const queryClient = useQueryClient();

  const [localCompletedIds, setLocalCompletedIds] = useState<
    (string | number)[]
  >([]);
  const [localSolvedToday, setLocalSolvedToday] = useState(0);
  const [localNotes, setLocalNotes] = useState<Record<string, string>>({});

  // Load notes from localStorage on mount (for non-authenticated users)
  useEffect(() => {
    if (userId) return;
    try {
      const saved = localStorage.getItem(NOTES_STORAGE_KEY);
      if (saved) {
        setLocalNotes(JSON.parse(saved));
      }
    } catch {
      /* corrupted data */
    }
  }, [userId]);

  const remoteQuery = useQuery({
    queryKey: queryKeys.dsa.completedQuestions(userId ?? ""),
    enabled: Boolean(userId),
    queryFn: async () => {
      const res = await sendRequest({
        method: "GET",
        url: `${routes.api.base}${routes.api.dsaYatraProgress}?userId=${encodeURIComponent(userId!)}`,
      });
      if (!res?.status) {
        throw new Error(
          typeof res?.message === "string"
            ? res.message
            : "Failed to load DSA Yatra progress",
        );
      }
      return res.data as DsaProgressPayload;
    },
    ...CACHE_TIMES.STANDARD,
  });

  useEffect(() => {
    if (userId) {
      return;
    }

    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        setLocalCompletedIds(JSON.parse(saved));
      } catch {
        /* corrupted data */
      }
    }

    const todayStr = new Date().toDateString();
    const statsStr = localStorage.getItem(todayStatsKey);
    if (statsStr) {
      try {
        const data: TodayStats = JSON.parse(statsStr);
        if (data.date === todayStr) {
          setLocalSolvedToday(data.solvedCount || 0);
        }
      } catch {
        /* corrupted data */
      }
    }
  }, [storageKey, todayStatsKey, userId]);

  useEffect(() => {
    if (
      !userId ||
      !remoteQuery.isSuccess ||
      !remoteQuery.data ||
      typeof window === "undefined"
    ) {
      return;
    }

    let localIds: string[] = [];
    let localToday: TodayStats | undefined;
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        localIds = (JSON.parse(raw) as unknown[]).map((id) => String(id));
      }
      const t = localStorage.getItem(todayStatsKey);
      if (t) {
        localToday = JSON.parse(t) as TodayStats;
      }
    } catch {
      return;
    }

    const serverIds = new Set(
      remoteQuery.data.completedQuestionIds.map((id) => String(id)),
    );
    const extras = localIds.filter((id) => !serverIds.has(id));
    if (extras.length === 0) {
      return;
    }

    const run = async () => {
      const res = await sendRequest({
        method: "PUT",
        url: `${routes.api.base}${routes.api.dsaYatraProgress}`,
        body: {
          userId,
          addCompletedQuestionIds: extras,
          todayStats: localToday,
        },
      });
      if (res?.status && res.data) {
        queryClient.setQueryData(
          queryKeys.dsa.completedQuestions(userId),
          res.data as DsaProgressPayload,
        );
        localStorage.removeItem(storageKey);
        localStorage.removeItem(todayStatsKey);
      }
    };

    void run();
  }, [
    userId,
    remoteQuery.isSuccess,
    remoteQuery.data,
    storageKey,
    todayStatsKey,
    queryClient,
  ]);

  const completedIds = useMemo<(string | number)[]>(() => {
    if (userId) {
      if (!remoteQuery.data) {
        return [];
      }
      return remoteQuery.data.completedQuestionIds;
    }
    return localCompletedIds;
  }, [userId, remoteQuery.data, localCompletedIds]);

  const solvedToday = useMemo(() => {
    if (userId) {
      return remoteQuery.data?.solvedToday ?? 0;
    }
    return localSolvedToday;
  }, [userId, remoteQuery.data, localSolvedToday]);

  const isProgressLoading = Boolean(userId && remoteQuery.isPending);

  const toggleComplete = useCallback(
    (questionId: string | number) => {
      const qid = String(questionId);

      if (userId) {
        const serverIds = new Set(
          (remoteQuery.data?.completedQuestionIds ?? []).map((id) =>
            String(id),
          ),
        );
        const had = serverIds.has(qid);
        const nextCompleted = !had;

        const prevToday = remoteQuery.data?.solvedToday ?? 0;
        let nextSolvedToday = prevToday;
        if (nextCompleted && !had) {
          nextSolvedToday = prevToday + 1;
        } else if (!nextCompleted && had && prevToday > 0) {
          nextSolvedToday = prevToday - 1;
        }

        const optimistic: DsaProgressPayload = {
          completedQuestionIds: nextCompleted
            ? Array.from(serverIds)
            : Array.from(serverIds).filter((id) => id !== qid),
          solvedToday: nextSolvedToday,
        };

        queryClient.setQueryData(
          queryKeys.dsa.completedQuestions(userId),
          optimistic,
        );

        void (async () => {
          try {
            const res = await sendRequest({
              method: "PATCH",
              url: `${routes.api.base}${routes.api.dsaYatraProgress}`,
              body: {
                userId,
                questionId: qid,
                isCompleted: nextCompleted,
              },
            });
            if (!res?.status) {
              throw new Error("PATCH failed");
            }
            if (res.data) {
              queryClient.setQueryData(
                queryKeys.dsa.completedQuestions(userId),
                res.data as DsaProgressPayload,
              );
            }
          } catch {
            await queryClient.invalidateQueries({
              queryKey: queryKeys.dsa.completedQuestions(userId),
            });
          }
        })();
        return;
      }

      setLocalCompletedIds((completedIdsPrev) => {
        const isCompletedNow = !completedIdsPrev.some(
          (id) => String(id) === qid,
        );
        const next = isCompletedNow
          ? [...completedIdsPrev, questionId]
          : completedIdsPrev.filter((id) => String(id) !== qid);

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
        setLocalSolvedToday(todayStats.solvedCount);

        return next;
      });
    },
    [userId, remoteQuery.data, queryClient, storageKey, todayStatsKey],
  );

  const saveNote = useCallback(
    async (questionId: string | number, notes: string) => {
      const qid = String(questionId);

      // Always update localStorage first for immediate feedback/offline support
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem(NOTES_STORAGE_KEY);
        const current = saved ? JSON.parse(saved) : {};
        current[qid] = notes;
        localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(current));
        setLocalNotes((prev) => ({ ...prev, [qid]: notes }));
      }

      // If not authenticated, we're done (localStorage is the only storage)
      if (!userId) return;

      // For authenticated users, sync to the server
      try {
        await sendRequest({
          url: `${routes.api.base}${routes.api.dsaQuestionNote}`,
          method: "POST",
          body: { userId, questionId: qid, notes },
        });
      } catch (error) {
        console.error("Failed to sync note to server", error);
      }
    },
    [userId],
  );

  return {
    completedIds,
    toggleComplete,
    solvedToday,
    isProgressLoading,
    localNotes,
    saveNote,
  };
};

export default useDsaCompletedQuestions;
