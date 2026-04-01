import { routes } from "@tbe/constants";
import type { DsaQuestion } from "@tbe/interface";
import { CACHE_TIMES, queryKeys, useQuery } from "@tbe/query";
import { sendRequest } from "@tbe/utils";
import { transformDsaQuestion } from "@tbe/utils";
import { useMemo } from "react";

import useUser from "./useUser";

interface UseDsaQuestionsOptions {
  queryKey?: string;
  limit?: number;
}

interface UseDsaQuestionsReturn {
  questions: DsaQuestion[];
  rawQuestions: any[];
  loading: boolean;
}

const useDsaQuestions = (
  options: UseDsaQuestionsOptions = {},
): UseDsaQuestionsReturn => {
  const { limit = 1000 } = options;
  const { user } = useUser();
  const userId = user?.id;

  const { data: response, isLoading } = useQuery<any>({
    queryKey: options.queryKey
      ? [options.queryKey, userId]
      : queryKeys.dsa.questions({ limit, userId }),
    queryFn: () =>
      sendRequest({
        url: `${routes.api.base}${routes.api.dsaSheet}?limit=${limit}${userId ? `&userId=${userId}` : ""}`,
      }),
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

  return { questions, rawQuestions, loading: isLoading };
};

export default useDsaQuestions;
