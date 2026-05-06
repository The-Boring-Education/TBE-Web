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

interface UseDsaQuestionsOptions {
  queryKey?: string;
  limit?: number;
  /** Product context for payment + personalization handling on the API. */
  productType?: DsaProductContext;
}

interface UseDsaQuestionsReturn {
  questions: DsaQuestion[];
  rawQuestions: any[];
  loading: boolean;
  isError: boolean;
  errorMessage: string | null;
}

const useDsaQuestions = (
  options: UseDsaQuestionsOptions = {},
): UseDsaQuestionsReturn => {
  const { limit = 1000, productType = "DSA_YATRA" } = options;
  const { user } = useUser();
  const userId = user?.id;

  const {
    data: response,
    isLoading,
    isError,
    error,
  } = useQuery<APIResponseType>({
    queryKey: options.queryKey
      ? [options.queryKey, userId, productType]
      : queryKeys.dsa.questions({
          limit,
          userId,
          productType,
        }),
    queryFn: async () => {
      const result = await sendRequest({
        url: `${routes.api.base}${routes.api.dsaSheet}?limit=${limit}${userId ? `&userId=${userId}` : ""}&productType=${productType}`,
      });

      if (result.status !== true) {
        throw new Error(result.message || "Failed to fetch DSA questions");
      }

      return result;
    },
    enabled: !!userId,
    ...CACHE_TIMES.STABLE,
  });

  const rawQuestions = useMemo(() => {
    const data = response?.data?.questions;
    if (!Array.isArray(data)) return [];
    return data;
  }, [response]);

  const questions = useMemo(() => {
    return rawQuestions.map(transformDsaQuestion);
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

export default useDsaQuestions;
