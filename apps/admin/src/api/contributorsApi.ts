import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import api from "@/lib/axios";

export interface ContributorSubmission {
  _id: string;
  contributorId: string;
  userId: string;
  contributorName: string;
  contributorEmail: string;
  category: string;
  proofUrl: string;
  title: string;
  description?: string;
  standardXp: number;
  awardedXp: number;
  status: "pending" | "approved" | "rejected";
  adminFeedback?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
}

export const useAdminSubmissions = (status = "All", search = "") => {
  return useQuery<ContributorSubmission[]>({
    queryKey: ["admin-submissions", status, search],
    queryFn: async () => {
      const response = await api.get("/admin/contributors/submissions", {
        params: { status, search },
      });
      return response.data?.data || [];
    },
  });
};

export const useReviewSubmission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      action,
      awardedXp,
      feedback,
    }: {
      id: string;
      action: "approve" | "reject";
      awardedXp?: number;
      feedback?: string;
    }) => {
      const response = await api.patch("/admin/contributors/submissions", {
        id,
        action,
        awardedXp,
        feedback,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-submissions"] });
    },
  });
};
