import { routes } from "@tbe/constants";
import type { DsaQuestion } from "@tbe/interface";
import { transformDsaQuestion } from "@tbe/utils";
import { useMemo } from "react";

import useApi from "./useApi";

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
  const { queryKey = "dsa-sheet", limit = 1000 } = options;

  const { response, loading } = useApi(queryKey, {
    url: `${routes.api.base}${routes.api.dsaSheet}?limit=${limit}`,
  });

  const rawQuestions = useMemo(() => {
    const data = response?.data?.questions;
    if (!Array.isArray(data)) return [];
    return data;
  }, [response]);

  const questions = useMemo(() => {
    return rawQuestions.map(transformDsaQuestion);
  }, [rawQuestions]);

  return { questions, rawQuestions, loading };
};

export default useDsaQuestions;
