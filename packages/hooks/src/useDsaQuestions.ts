import { routes } from "@tbe/constants";
import type { DsaQuestion } from "@tbe/interface";
import { CACHE_TIMES, queryKeys, useQuery } from "@tbe/query";
import { sendRequest } from "@tbe/utils";
import { transformDsaQuestion } from "@tbe/utils";
import { useMemo } from "react";

import useUser from "./useUser";

type DsaProductContext = "DSA_YATRA" | "ONCAMPUS";

interface UseDsaQuestionsOptions {
  queryKey?: string;
  limit?: number;
  /** Duration key e.g. "3Months", "6Months", "1Year" */
  duration?: string;
  /** Off-campus flag — when combined with duration, scales bucket caps ×1.5 */
  offCampus?: boolean;
  /** Product context for payment + personalization handling on the API. */
  productType?: DsaProductContext;
}

interface UseDsaQuestionsReturn {
  questions: DsaQuestion[];
  rawQuestions: any[];
  loading: boolean;
}

const useDsaQuestions = (
  options: UseDsaQuestionsOptions = {},
): UseDsaQuestionsReturn => {
  const {
    limit = 1000,
    duration,
    offCampus,
    productType = "DSA_YATRA",
  } = options;
  const { user } = useUser();
  const userId = user?.id;

  const { data: response, isLoading } = useQuery<any>({
    queryKey: options.queryKey
      ? [options.queryKey, userId, duration, offCampus, productType]
      : queryKeys.dsa.questions({
          limit,
          userId,
          duration,
          offCampus,
          productType,
        }),
    queryFn: () =>
      sendRequest({
        url: `${routes.api.base}${routes.api.dsaSheet}?limit=${limit}${userId ? `&userId=${userId}` : ""}${duration ? `&duration=${duration}` : ""}${offCampus ? `&offCampus=true` : ""}&productType=${productType}`,
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
