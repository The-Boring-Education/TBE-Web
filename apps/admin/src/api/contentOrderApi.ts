import {
  useMutation,
  type UseMutationResult,
  useQueryClient,
} from "@tanstack/react-query";
import type { ContentOrderRequest, ContentOrderType } from "@tbe/types";

import api from "@/lib/axios";

export const useContentOrder = (
  contentType: ContentOrderType,
  parentId: string,
): UseMutationResult<
  { status: boolean; message?: string },
  Error,
  Pick<ContentOrderRequest, "previousIds" | "orderedIds">,
  { queryKeys: string[][] }
> => {
  const queryClient = useQueryClient();
  const queryKeys = {
    "course-chapters": [["courses"], ["course", parentId]],
    "interview-questions": [
      ["interview-sheets"],
      ["interview-sheet", parentId],
      ["interview-all-sheets"],
      ["interview-sheet-detail", parentId],
      ["interview-database-questions", parentId],
    ],
    "project-sections": [["projects"]],
  }[contentType];

  return useMutation({
    onMutate: () => ({ queryKeys }),
    mutationFn: async (
      order: Pick<ContentOrderRequest, "previousIds" | "orderedIds">,
    ) => {
      const response = await api.patch<{
        status: boolean;
        message?: string;
      }>("/admin/content-order", { contentType, parentId, ...order });
      if (!response.data.status) {
        throw new Error(
          response.data.message || "Could not save content order",
        );
      }
      return response.data;
    },
    onSettled: (_data, _error, _variables, context) =>
      Promise.all(
        (context?.queryKeys || queryKeys).map((queryKey) =>
          queryClient.invalidateQueries({ queryKey }),
        ),
      ),
  });
};
