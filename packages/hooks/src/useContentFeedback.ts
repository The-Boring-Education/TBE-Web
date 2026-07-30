import type { FeedbackType } from "@tbe/constants";
import { routes } from "@tbe/constants";
import { sendRequest } from "@tbe/utils";
import { useCallback, useEffect, useState } from "react";

import useUser from "./useUser";

export interface ContentFeedbackState {
  hasReviewed: boolean;
  existingRating: number | null;
  existingReviewText: string;
  existingMeta?: Record<string, any> | null;
  isFetching: boolean;
  isSubmitting: boolean;
}

export interface UseContentFeedbackProps {
  contentType: FeedbackType;
  contentId: string;
  meta?: Record<string, any>;
  /** Set to false to skip the initial fetch (e.g. widget not yet open) */
  enabled?: boolean;
}

const useContentFeedback = ({
  contentType,
  contentId,
  meta,
  enabled = true,
}: UseContentFeedbackProps) => {
  const { user, isAuth } = useUser();

  const [state, setState] = useState<ContentFeedbackState>({
    hasReviewed: false,
    existingRating: null,
    existingReviewText: "",
    existingMeta: null,
    isFetching: false,
    isSubmitting: false,
  });

  // Fetch existing feedback on mount / when contentId changes
  const fetchFeedback = useCallback(async () => {
    if (!isAuth || !user?.id || !contentId) return;

    setState((prev) => ({ ...prev, isFetching: true }));

    try {
      const url = `${routes.api.contentFeedback}?userId=${user.id}&contentType=${contentType}&contentId=${encodeURIComponent(contentId)}`;
      const response = await sendRequest({ url, method: "GET" });

      if (response?.status && response.data) {
        setState((prev) => ({
          ...prev,
          hasReviewed: response.data.hasReviewed ?? false,
          existingRating: response.data.rating ?? null,
          existingReviewText: response.data.reviewText ?? "",
          existingMeta: response.data.meta ?? null,
          isFetching: false,
        }));
      } else {
        setState((prev) => ({ ...prev, isFetching: false }));
      }
    } catch {
      setState((prev) => ({ ...prev, isFetching: false }));
    }
  }, [user?.id, contentType, contentId, isAuth]);

  useEffect(() => {
    if (enabled && isAuth) {
      fetchFeedback();
    }
  }, [fetchFeedback, enabled, isAuth]);

  /**
   * Submit or update feedback via upsert.
   * Returns true on success, false on failure.
   */
  const submitFeedback = async (
    rating: number,
    reviewText: string = "",
    overrideMeta?: Record<string, any>,
  ): Promise<boolean> => {
    if (!isAuth || !user?.id) return false;

    setState((prev) => ({ ...prev, isSubmitting: true }));

    const metaToSubmit = overrideMeta || meta;

    try {
      const response = await sendRequest({
        url: routes.api.contentFeedback,
        method: "POST",
        body: {
          userId: user.id,
          contentType,
          contentId,
          rating,
          reviewText,
          meta: metaToSubmit,
        },
      });

      if (response?.status) {
        setState((prev) => ({
          ...prev,
          hasReviewed: true,
          existingRating: rating,
          existingReviewText: reviewText,
          existingMeta: metaToSubmit || prev.existingMeta,
          isSubmitting: false,
        }));
        return true;
      }

      setState((prev) => ({ ...prev, isSubmitting: false }));
      return false;
    } catch {
      setState((prev) => ({ ...prev, isSubmitting: false }));
      return false;
    }
  };

  return {
    ...state,
    isAuth,
    submitFeedback,
    refetch: fetchFeedback,
  };
};

export default useContentFeedback;
