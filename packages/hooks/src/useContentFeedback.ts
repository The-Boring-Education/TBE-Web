import { CACHE_TIMES, useMutation, useQuery, useQueryClient } from "@tbe/query";
import { contentFeedbackService } from "@tbe/services";
import type { ContentFeedbackType } from "@tbe/types";
import type {
  CreateContentFeedbackRequestPayloadProps,
  GetContentFeedbackResponsePayloadProps,
} from "@tbe/types";
import type { APIResponseType } from "@tbe/utils";

interface UseContentFeedbackOptions {
  contentType: ContentFeedbackType;
  contentId: string;
  /** When true, also fetch the existing feedback list for this content. */
  enableList?: boolean;
}

const contentFeedbackQueryKey = (
  contentType: ContentFeedbackType,
  contentId: string,
) => ["contentFeedback", contentType, contentId] as const;

export const useContentFeedback = ({
  contentType,
  contentId,
  enableList = false,
}: UseContentFeedbackOptions) => {
  const queryClient = useQueryClient();

  const listQuery = useQuery<
    APIResponseType & { data?: GetContentFeedbackResponsePayloadProps }
  >({
    queryKey: contentFeedbackQueryKey(contentType, contentId),
    queryFn: () => contentFeedbackService.list({ contentType, contentId }),
    enabled: Boolean(enableList && contentType && contentId),
    ...CACHE_TIMES.STANDARD,
  });

  const submitMutation = useMutation<
    APIResponseType,
    Error,
    Omit<CreateContentFeedbackRequestPayloadProps, "contentType" | "contentId">
  >({
    mutationFn: async (input) => {
      const response = await contentFeedbackService.create({
        contentType,
        contentId,
        ...input,
      });
      if (response.status === false || response.success === false) {
        throw new Error(response.message || "Failed to submit feedback");
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: contentFeedbackQueryKey(contentType, contentId),
      });
    },
  });

  return {
    feedbackItems: listQuery.data?.data?.items ?? [],
    isListLoading: listQuery.isLoading,
    submit: submitMutation.mutateAsync,
    isSubmitting: submitMutation.isPending,
    submitError: submitMutation.error?.message ?? null,
    isSuccess: submitMutation.isSuccess,
    reset: submitMutation.reset,
  };
};

export default useContentFeedback;
