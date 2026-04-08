import { routes } from "@tbe/constants";
import type { DsaQuestion } from "@tbe/interface";
import { CACHE_TIMES, queryKeys, useQuery } from "@tbe/query";
import { sendRequest, transformDsaQuestion } from "@tbe/utils";
import { useMemo } from "react";

import useUser from "./useUser";

interface UseDsaQuestionsForTopicOptions {
  /** Duration key e.g. "3Months", "6Months", "1Year" */
  duration?: string;
  /** Off-campus flag — if true, adds off-campus questions on top */
  offCampus?: boolean;
}

interface UseDsaQuestionsForTopicReturn {
  questions: DsaQuestion[];
  rawQuestions: unknown[];
  loading: boolean;
}

/**
 * Loads questions for one DSA topic (primary topic = topics[0] on the server).
 * Cached per topic via React Query.
 */
export const useDsaQuestionsForTopic = (
  topic: string | null,
  options: UseDsaQuestionsForTopicOptions = {},
): UseDsaQuestionsForTopicReturn => {
  const { user } = useUser();
  const userId = user?.id;
  const { duration, offCampus } = options;

  const { data: response, isLoading } = useQuery({
    queryKey: queryKeys.dsa.questions({
      topic: topic ?? "",
      userId,
      duration,
      offCampus,
    }),
    queryFn: () =>
      sendRequest({
        url: `${routes.api.base}${routes.api.dsaSheet}?topic=${encodeURIComponent(topic!)}${userId ? `&userId=${userId}` : ""}${duration ? `&duration=${duration}` : ""}${offCampus ? `&offCampus=true` : ""}`,
        method: "GET",
      }),
    enabled: !!topic && !!userId,
    ...CACHE_TIMES.STABLE,
  });

  const rawQuestions = useMemo(() => {
    const data = response?.data?.questions;
    if (!Array.isArray(data)) return [];
    return data;
  }, [response]);

  const questions = useMemo(() => {
    return rawQuestions.map((q) => transformDsaQuestion(q));
  }, [rawQuestions]);

  return { questions, rawQuestions, loading: isLoading };
};
