import { routes } from "@tbe/constants";
import type { DsaQuestion } from "@tbe/interface";
import { CACHE_TIMES, queryKeys, useQuery } from "@tbe/query";
import {
  type APIResponseType,
  sendRequest,
  transformDsaQuestion,
} from "@tbe/utils";
import { useMemo } from "react";

import useUser from "./useUser";

type DsaProductContext = "DSA_YATRA" | "ONCAMPUS";

interface UseDsaQuestionsForTopicOptions {
  /** Product context for payment + personalization handling on the API. */
  productType?: DsaProductContext;
  /** Filter real-world problems (include/exclude/only) */
  realWorld?: "include" | "exclude" | "only";
}

interface UseDsaQuestionsForTopicReturn {
  questions: DsaQuestion[];
  rawQuestions: unknown[];
  loading: boolean;
  isError: boolean;
  errorMessage: string | null;
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
  const { realWorld, productType = "DSA_YATRA" } = options;

  const {
    data: response,
    isLoading,
    isError,
    error,
  } = useQuery<APIResponseType>({
    queryKey: queryKeys.dsa.questions({
      topic: topic ?? "",
      userId,
      productType,
      realWorld,
    }),
    queryFn: async () => {
      const result = await sendRequest({
        url: `${routes.api.base}${routes.api.dsaSheet}?topic=${encodeURIComponent(topic!)}${userId ? `&userId=${userId}` : ""}&productType=${productType}${realWorld ? `&realWorld=${realWorld}` : ""}`,
        method: "GET",
      });

      if (result.status !== true) {
        throw new Error(result.message || "Failed to fetch DSA questions");
      }

      return result;
    },
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

  const errorMessage =
    error instanceof Error
      ? error.message
      : isError
        ? "Failed to fetch DSA questions"
        : null;

  return {
    questions,
    rawQuestions,
    loading: isLoading,
    isError,
    errorMessage,
  };
};
