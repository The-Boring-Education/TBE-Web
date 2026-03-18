import { CACHE_TIMES, queryKeys, useQuery } from "@tbe/query";
import { quizApi } from "@tbe/services";
import type { APIResponse, QuizCategoryAPI } from "@tbe/types";

interface UseQuizDataReturn {
  categories: QuizCategoryAPI[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export default function useQuizData(): UseQuizDataReturn {
  const { data, isLoading, error, refetch } = useQuery<
    APIResponse<QuizCategoryAPI[]>
  >({
    queryKey: queryKeys.quiz.categories(),
    queryFn: () =>
      quizApi.getCategories() as Promise<APIResponse<QuizCategoryAPI[]>>,
    ...CACHE_TIMES.STATIC,
  });

  const categories = (data?.success ?? data?.status) ? (data?.data ?? []) : [];

  return {
    categories,
    loading: isLoading,
    error: error?.message ?? null,
    refetch,
  };
}
