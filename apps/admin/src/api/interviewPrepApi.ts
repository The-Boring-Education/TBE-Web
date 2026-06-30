import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import api from "@/lib/axios";
import type { InterviewSheet, UserInterviewPrep } from "@/types";
interface UserInterviewPrepsResponse {
  data: UserInterviewPrep[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const useUserInterviewPreps = (page = 1, limit = 10, search = "") => {
  const query = useQuery<UserInterviewPrepsResponse>({
    queryKey: ["user-interview-preps", page, limit, search],
    queryFn: async () => {
      const response = await api.get("/admin/dashboard", {
        params: {
          type: "user-sheets",
          page,
          limit,
          search,
        },
      });

      const { items, total, totalPages } = response.data?.data || [];

      return {
        data: items,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      };
    },
  });

  return {
    ...query,
    data: query.data?.data || [],
    pagination: query.data?.pagination || {
      total: 0,
      page,
      limit,
      totalPages: 0,
    },
    isLoading: query.isLoading,
  };
};

// Admin: Interview Sheets list (webapp API)
export const useInterviewSheets = () => {
  const query = useQuery<{ data: InterviewSheet[] }>({
    queryKey: ["interview-sheets"],
    queryFn: async () => {
      const res = await api.get("/interview-prep");
      return { data: res.data?.data || [] };
    },
  });

  return {
    ...query,
    data: (query.data?.data || []) as InterviewSheet[],
    isLoading: query.isLoading,
  };
};

// Admin: Get single sheet by id (with questions)
export const useInterviewSheet = (sheetId?: string) => {
  const enabled = Boolean(sheetId);
  const query = useQuery<{ data: InterviewSheet } | undefined>({
    queryKey: ["interview-sheet", sheetId],
    enabled,
    queryFn: async () => {
      if (!sheetId) return undefined;
      const res = await api.get(`/interview-prep/${sheetId}`);
      return { data: res.data?.data };
    },
  });

  return {
    ...query,
    data: (query.data?.data as InterviewSheet) || ({} as InterviewSheet),
    isLoading: query.isLoading,
  };
};

// Admin: Update sheet meta fields
export const useUpdateInterviewSheet = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      sheetId,
      updatedData,
    }: {
      sheetId: string;
      updatedData: Partial<InterviewSheet>;
    }) => {
      const res = await api.patch(`/interview-prep/${sheetId}`, updatedData);
      return res.data?.data as InterviewSheet;
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["interview-sheets"] });
      qc.invalidateQueries({
        queryKey: ["interview-sheet", variables.sheetId],
      });
    },
  });
};

// Admin: Update question (chapter) inside a sheet
export const useUpdateInterviewQuestion = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      sheetId,
      questionId,
      updated,
    }: {
      sheetId: string;
      questionId: string;
      updated: Partial<
        Pick<
          InterviewSheet["questions"][number],
          "title" | "question" | "answer" | "frequency" | "resources"
        >
      >;
    }) => {
      const res = await api.patch(
        `/interview-prep/${sheetId}/question/${questionId}`,
        updated,
      );
      return res.data?.data as InterviewSheet;
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({
        queryKey: ["interview-sheet", variables.sheetId],
      });
    },
  });
};

// Admin: Create a new sheet
export const useCreateInterviewSheet = () => {
  return useMutation({
    mutationFn: async (payload: {
      name: string;
      description: string;
      coverImageURL: string;
      liveOn: string;
      slug: string;
      meta?: string;
      roadmap: "Frontend" | "Backend" | "Fullstack" | "Tech";
      isPremium?: boolean;
      price?: number;
      features?: string[];
    }) => {
      const res = await api.post(`/interview-prep`, payload);
      return res.data?.data as InterviewSheet;
    },
  });
};

// Admin: Add a question to a sheet
export const useAddInterviewQuestion = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      sheetId,
      question,
    }: {
      sheetId: string;
      question: {
        title: string;
        question: string;
        answer: string;
        resources?: any[];
        frequency: "Most Asked" | "Asked Frequently" | "Asked Sometimes";
      };
    }) => {
      const res = await api.post(
        `/interview-prep/${sheetId}/question`,
        question,
      );
      return res.data?.data as InterviewSheet;
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({
        queryKey: ["interview-sheet", variables.sheetId],
      });
    },
  });
};

// Admin: Delete a question from a sheet
export const useDeleteInterviewQuestion = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      sheetId,
      questionId,
    }: {
      sheetId: string;
      questionId: string;
    }) => {
      const res = await api.delete(
        `/interview-prep/${sheetId}/question/${questionId}`,
      );
      return res.data?.data as InterviewSheet;
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({
        queryKey: ["interview-sheet", variables.sheetId],
      });
    },
  });
};

// Admin: Delete entire sheet from database
export const useDeleteInterviewSheet = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (sheetId: string) => {
      const res = await api.delete(`/interview-prep/${sheetId}`);
      return res.data?.message;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["interview-sheets"] });
      qc.invalidateQueries({ queryKey: ["user-interview-preps"] });
    },
  });
};
