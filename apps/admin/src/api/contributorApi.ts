import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import api from "@/lib/axios";
import type {
  AdminContributionsResponse,
  ReviewSubmissionPayload,
} from "@/types/contributor";

export const useAdminContributions = (
  status = "all",
  category = "all",
  search = "",
  page = 1,
  limit = 20,
) => {
  return useQuery<AdminContributionsResponse>({
    queryKey: ["admin-contributions", status, category, search, page, limit],
    queryFn: async () => {
      const cleanSearch = search
        ?.trim()
        .slice(0, 100)
        .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      const params: Record<string, any> = {
        status: status !== "all" ? status : undefined,
        category: category !== "all" ? category : undefined,
        search: cleanSearch || undefined,
        page,
        limit,
      };

      const response = await api.get("/admin/contributors/submissions", {
        params,
      });

      return (
        response.data?.data || {
          items: [],
          total: 0,
          currentPage: page,
          totalPages: 0,
        }
      );
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useReviewContribution = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: ReviewSubmissionPayload;
    }) => {
      const response = await api.patch(
        `/admin/contributors/submissions/${id}/review`,
        payload,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-contributions"] });
    },
  });
};
