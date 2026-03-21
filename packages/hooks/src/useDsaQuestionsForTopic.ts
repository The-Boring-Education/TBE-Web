import { routes } from "@tbe/constants";
import type { DsaQuestion } from "@tbe/interface";
import { CACHE_TIMES, queryKeys, useQuery } from "@tbe/query";
import { sendRequest, transformDsaQuestion } from "@tbe/utils";
import { useMemo } from "react";

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
): UseDsaQuestionsForTopicReturn => {
  const { data: response, isLoading } = useQuery({
    queryKey: queryKeys.dsa.questions({
      topic: topic ?? "",
    }),
    queryFn: () =>
      sendRequest({
        url: `${routes.api.base}${routes.api.dsaSheet}?topic=${encodeURIComponent(topic!)}`,
        method: "GET",
      }),
    enabled: !!topic,
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
