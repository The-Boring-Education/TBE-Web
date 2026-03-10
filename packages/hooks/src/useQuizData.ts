import { quizApi } from "@tbe/services";
import type { APIResponse, QuizCategoryAPI } from "@tbe/types";
import { useEffect, useState } from "react";

/**
 * useQuizData Hook
 *
 * Extracted from quizes app and made reusable
 * Handles quiz category and data fetching
 */

interface UseQuizDataReturn {
  categories: QuizCategoryAPI[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export default function useQuizData(): UseQuizDataReturn {
  const [categories, setCategories] = useState<QuizCategoryAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = (await quizApi.getCategories()) as APIResponse<
        QuizCategoryAPI[]
      >;

      if (response?.success ?? response?.status) {
        setCategories(response?.data || []);
      } else {
        throw new Error(response?.message || "Failed to load categories");
      }
    } catch (err) {
      console.error("Error loading categories:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load categories";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories,
  };
}
