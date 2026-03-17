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

  const isSuccessful = data?.success ?? data?.status;
  const categories = isSuccessful ? (data?.data ?? []) : [];
  const apiError =
    !isSuccessful && data
      ? data.message || data.error || "Failed to fetch categories"
      : null;

  return {
    categories,
    loading: isLoading,
    error: apiError ?? error?.message ?? null,
    refetch,
  };
}
