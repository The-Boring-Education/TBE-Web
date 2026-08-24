import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { toast } from "sonner";

import { agentsClient } from "@/lib/agentsClient";
import api from "@/lib/axios";
import { logApiError, logApiSuccess } from "@/lib/logInterceptor";

// Types
export interface IResource {
  type: "YOUTUBE" | "ARTICLE" | "CODE" | "LEETCODE" | "BLOG";
  url: string;
  label?: string;
}

export interface IQuestion {
  id?: string;
  _id?: string;
  question: string;
  difficulty: "Easy" | "Medium" | "Hard" | "Intermediate";
  category?: string;
  answer?: string;
  resources?: IResource[];
  frequency?: string;
  priority?: string;
  company_types?: string[];
  followup_questions?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface ISheet {
  id: string;
  name: string;
  topic: string;
  question_count: number;
  questions: IQuestion[];
  created_at: string;
  updated_at: string;
}

// API Functions
export const interviewSheetModifyApi = {
  // Get all sheets from database
  getAllSheets: async (): Promise<ISheet[]> => {
    try {
      const response = await api.get(`/interview-prep`);
      logApiSuccess("GET", "/api/v1/interview-prep", 200, response.data);
      return response.data.data || response.data;
    } catch (error: any) {
      const status = error?.response?.status || "Network Error";
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to fetch sheets";
      logApiError(
        "GET",
        "/api/v1/interview-prep",
        status,
        message,
        error?.response?.data,
      );
      throw error;
    }
  },

  // Get sheet detail from database
  getSheetDetail: async (sheetId: string): Promise<ISheet> => {
    try {
      const response = await api.get(`/interview-prep/${sheetId}`);
      logApiSuccess(
        "GET",
        `/api/v1/interview-prep/${sheetId}`,
        200,
        response.data,
      );
      return response.data.data || response.data;
    } catch (error: any) {
      const status = error?.response?.status || "Network Error";
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to fetch sheet details";
      logApiError(
        "GET",
        `/api/v1/interview-prep/${sheetId}`,
        status,
        message,
        error?.response?.data,
      );
      throw error;
    }
  },

  // Get questions list from database sheet
  getDatabaseQuestions: async (sheetId: string): Promise<IQuestion[]> => {
    try {
      const response = await api.get(`/interview-prep/${sheetId}/question`);
      logApiSuccess(
        "GET",
        `/api/v1/interview-prep/${sheetId}/question`,
        200,
        response.data,
      );
      return response.data.data || response.data;
    } catch (error: any) {
      const status = error?.response?.status || "Network Error";
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to fetch questions";
      logApiError(
        "GET",
        `/api/v1/interview-prep/${sheetId}/question`,
        status,
        message,
        error?.response?.data,
      );
      throw error;
    }
  },

  // Get available company types
  getCompanyTypes: async (): Promise<string[]> => {
    try {
      const response = await api.get(`/interview-prep/company-types`);
      logApiSuccess(
        "GET",
        "/api/v1/interview-prep/company-types",
        200,
        response.data,
      );
      return response.data.data || response.data;
    } catch (error: any) {
      const status = error?.response?.status || "Network Error";
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to fetch company types";
      logApiError(
        "GET",
        "/api/v1/interview-prep/company-types",
        status,
        message,
        error?.response?.data,
      );
      throw error;
    }
  },

  // Get complete sheet with all questions from session
  getSheet: async (sessionId: string): Promise<ISheet> => {
    const response = await agentsClient.get<any>(
      `/interview/session/${sessionId}/output`,
    );

    // Handle both response structures
    const sheetData = response.data.sheet_data || response.data;

    // Transform questions to match IQuestion interface
    const transformedQuestions: IQuestion[] = (sheetData.questions || []).map(
      (q: any, index: number) => ({
        id: q.id || q._id || `question_${index}`,
        question: q.question || q.title || "",
        difficulty: q.difficulty || "Medium",
        category: q.category || "",
        answer: q.answer || "",
        resources: q.resources || [],
        frequency: q.frequency,
        priority: q.priority,
        company_types: q.company_types,
        followup_questions: q.followup_questions,
        created_at: q.created_at,
        updated_at: q.updated_at,
      }),
    );

    return {
      id: sheetData.id || sheetData._id || sessionId,
      name: sheetData.name || "Untitled Sheet",
      topic: sheetData.topic || sheetData.roadmap || "",
      question_count: transformedQuestions.length,
      questions: transformedQuestions,
      created_at:
        sheetData.created_at || sheetData.liveOn || new Date().toISOString(),
      updated_at: sheetData.updated_at || new Date().toISOString(),
    };
  },

  // Get questions with pagination
  getQuestions: async (
    sessionId: string,
    skip = 0,
    limit = 100,
  ): Promise<{ questions: IQuestion[]; total: number }> => {
    const response = await agentsClient.get<{
      questions: IQuestion[];
      total: number;
    }>(`/interview/session/${sessionId}/questions`, {
      params: { skip, limit },
    });
    return response.data;
  },

  // Get single question by ID
  getQuestion: async (
    sessionId: string,
    questionId: string,
  ): Promise<IQuestion> => {
    const response = await agentsClient.get<IQuestion>(
      `/interview/session/${sessionId}/questions/${questionId}`,
    );
    return response.data;
  },

  // Update a question
  updateQuestion: async (
    sessionId: string,
    questionId: string,
    updates: Partial<IQuestion>,
  ) => {
    const response = await agentsClient.put(
      `/interview/session/${sessionId}/questions/${questionId}`,
      updates,
    );
    return response.data;
  },

  // Delete a question
  deleteQuestion: async (
    sessionId: string,
    questionId: string,
  ): Promise<{ message: string; remaining_questions: number }> => {
    const response = await agentsClient.delete<{
      message: string;
      remaining_questions: number;
    }>(`/interview/session/${sessionId}/questions/${questionId}`);
    return response.data;
  },

  // Add new custom question
  addQuestion: async (
    sessionId: string,
    question: Omit<IQuestion, "id" | "created_at" | "updated_at">,
  ): Promise<{ question: IQuestion; total_questions: number }> => {
    const response = await agentsClient.post<{
      question: IQuestion;
      total_questions: number;
    }>(`/interview/session/${sessionId}/questions`, question);
    return response.data;
  },

  // Save sheet to local JSON file
  saveSheetLocally: async (sessionId: string): Promise<ISheet> => {
    const response = await agentsClient.post<ISheet>(
      `/interview/session/${sessionId}/output`,
    );
    return response.data;
  },

  // ===== DATABASE SHEET EDITING OPERATIONS =====

  // Update a question in database sheet
  updateDatabaseQuestion: async (
    sheetId: string,
    questionId: string,
    updates: Partial<IQuestion>,
  ) => {
    try {
      const response = await api.patch(
        `/interview-prep/${sheetId}/question/${questionId}`,
        updates,
        { headers: { "Content-Type": "application/json" } },
      );
      logApiSuccess(
        "PATCH",
        `/api/v1/interview-prep/${sheetId}/question/${questionId}`,
        200,
        response.data,
      );
      return response.data;
    } catch (error: any) {
      const status = error?.response?.status || "Network Error";
      const message = error?.response?.data?.message || error?.message;
      logApiError(
        "PATCH",
        `/api/v1/interview-prep/${sheetId}/question/${questionId}`,
        status,
        message,
        error?.response?.data,
      );
      throw error;
    }
  },

  // Delete a question from database sheet
  deleteDatabaseQuestion: async (
    sheetId: string,
    questionId: string,
  ): Promise<{ success: boolean; remaining_questions: number }> => {
    try {
      const response = await api.delete(
        `/interview-prep/${sheetId}/question/${questionId}`,
      );
      logApiSuccess(
        "DELETE",
        `/api/v1/interview-prep/${sheetId}/question/${questionId}`,
        200,
        response.data,
      );
      return response.data;
    } catch (error: any) {
      const status = error?.response?.status || "Network Error";
      const message = error?.response?.data?.message || error?.message;
      logApiError(
        "DELETE",
        `/api/v1/interview-prep/${sheetId}/question/${questionId}`,
        status,
        message,
        error?.response?.data,
      );
      throw error;
    }
  },

  // Add a question to database sheet
  addDatabaseQuestion: async (
    sheetId: string,
    question: Omit<IQuestion, "id" | "created_at" | "updated_at">,
  ): Promise<{
    success: boolean;
    question: IQuestion;
    total_questions: number;
  }> => {
    try {
      const response = await api.post(
        `/interview-prep/${sheetId}/question`,
        question,
        { headers: { "Content-Type": "application/json" } },
      );
      logApiSuccess(
        "POST",
        `/api/v1/interview-prep/${sheetId}/question`,
        200,
        response.data,
      );
      return response.data;
    } catch (error: any) {
      const status = error?.response?.status || "Network Error";
      const message = error?.response?.data?.message || error?.message;
      logApiError(
        "POST",
        `/api/v1/interview-prep/${sheetId}/question`,
        status,
        message,
        error?.response?.data,
      );
      throw error;
    }
  },

  // Update sheet metadata in database
  updateSheetMetadata: async (
    sheetId: string,
    metadata: Partial<{
      name: string;
      description: string;
      meta: string;
      slug: string;
      coverImageURL: string;
      liveOn: Date | string;
      isPremium: boolean;
      price: number;
      discountPercentage: number;
      appliedCoupon: string | null;
      roadmap: string;
      features: string[];
      frequency: string;
      priority: string;
      companyTypes: string[];
      resource_link: string;
    }>,
  ): Promise<{
    success: boolean;
    data: any;
    message: string;
  }> => {
    try {
      const response = await api.patch(`/interview-prep/${sheetId}`, metadata, {
        headers: { "Content-Type": "application/json" },
      });
      logApiSuccess(
        "PATCH",
        `/api/v1/interview-prep/${sheetId}`,
        200,
        response.data,
      );
      return response.data;
    } catch (error: any) {
      const status = error?.response?.status || "Network Error";
      const message = error?.response?.data?.message || error?.message;
      logApiError(
        "PATCH",
        `/api/v1/interview-prep/${sheetId}`,
        status,
        message,
        error?.response?.data,
      );
      throw error;
    }
  },

  // Delete  sheet from database
  deleteSheet: async (
    sheetId: string,
  ): Promise<{
    success: boolean;
    message: string;
  }> => {
    try {
      const response = await api.delete(`/interview-prep/${sheetId}`);
      logApiSuccess(
        "DELETE",
        `/api/v1/interview-prep/${sheetId}`,
        200,
        response.data,
      );
      return response.data;
    } catch (error: any) {
      const status = error?.response?.status || "Network Error";
      const message = error?.response?.data?.message || error?.message;
      logApiError(
        "DELETE",
        `/api/v1/interview-prep/${sheetId}`,
        status,
        message,
        error?.response?.data,
      );
      throw error;
    }
  },
};

// React Query Hooks

export const useGetAllSheets = () => {
  return useQuery({
    queryKey: ["interview-all-sheets"],
    queryFn: () => interviewSheetModifyApi.getAllSheets(),
  });
};

export const useGetSheetDetail = (sheetId: string) => {
  return useQuery({
    queryKey: ["interview-sheet-detail", sheetId],
    queryFn: () => interviewSheetModifyApi.getSheetDetail(sheetId),
    enabled: !!sheetId,
  });
};

export const useGetDatabaseQuestions = (sheetId: string) => {
  return useQuery({
    queryKey: ["interview-database-questions", sheetId],
    queryFn: () => interviewSheetModifyApi.getDatabaseQuestions(sheetId),
    enabled: !!sheetId,
  });
};

export const useGetCompanyTypes = () => {
  return useQuery({
    queryKey: ["interview-company-types"],
    queryFn: () => interviewSheetModifyApi.getCompanyTypes(),
  });
};

export const useGetSheet = (sessionId: string) => {
  return useQuery({
    queryKey: ["interview-sheet", sessionId],
    queryFn: () => interviewSheetModifyApi.getSheet(sessionId),
    enabled: !!sessionId,
  });
};

export const useGetQuestions = (sessionId: string, skip = 0, limit = 100) => {
  return useQuery({
    queryKey: ["interview-questions", sessionId, skip, limit],
    queryFn: () => interviewSheetModifyApi.getQuestions(sessionId, skip, limit),
    enabled: !!sessionId,
  });
};

export const useUpdateQuestion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      sessionId,
      questionId,
      updates,
    }: {
      sessionId: string;
      questionId: string;
      updates: Partial<IQuestion>;
    }) =>
      interviewSheetModifyApi.updateQuestion(sessionId, questionId, updates),
    onSuccess: (data, variables) => {
      toast.success("Question updated successfully");
      queryClient.invalidateQueries({
        queryKey: ["interview-sheet", variables.sessionId],
      });
      queryClient.invalidateQueries({
        queryKey: ["interview-questions", variables.sessionId],
      });
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to update question",
      );
    },
  });
};

export const useDeleteQuestion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      sessionId,
      questionId,
    }: {
      sessionId: string;
      questionId: string;
    }) => interviewSheetModifyApi.deleteQuestion(sessionId, questionId),
    onSuccess: (data, variables) => {
      toast.success("Question deleted successfully");
      queryClient.invalidateQueries({
        queryKey: ["interview-sheet", variables.sessionId],
      });
      queryClient.invalidateQueries({
        queryKey: ["interview-questions", variables.sessionId],
      });
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to delete question",
      );
    },
  });
};

export const useAddQuestion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      sessionId,
      question,
    }: {
      sessionId: string;
      question: Omit<IQuestion, "id" | "created_at" | "updated_at">;
    }) => interviewSheetModifyApi.addQuestion(sessionId, question),
    onSuccess: (data, variables) => {
      toast.success("Question added successfully");
      queryClient.invalidateQueries({
        queryKey: ["interview-sheet", variables.sessionId],
      });
      queryClient.invalidateQueries({
        queryKey: ["interview-questions", variables.sessionId],
      });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to add question");
    },
  });
};

export const useSaveSheetLocally = () => {
  return useMutation({
    mutationFn: (sessionId: string) =>
      interviewSheetModifyApi.saveSheetLocally(sessionId),
    onSuccess: (data) => {
      toast.success("Sheet saved successfully");
      // Optionally trigger download
      downloadSheetAsJSON(data);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to save sheet");
    },
  });
};

// Database Sheet CRUD Hooks

export const useUpdateDatabaseQuestion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      sheetId,
      questionId,
      updates,
    }: {
      sheetId: string;
      questionId: string;
      updates: Partial<IQuestion>;
    }) =>
      interviewSheetModifyApi.updateDatabaseQuestion(
        sheetId,
        questionId,
        updates,
      ),
    onSuccess: (data, variables) => {
      toast.success("Question updated successfully");
      queryClient.invalidateQueries({
        queryKey: ["interview-sheet-detail", variables.sheetId],
      });
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to update question",
      );
    },
  });
};

export const useDeleteDatabaseQuestion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      sheetId,
      questionId,
    }: {
      sheetId: string;
      questionId: string;
    }) => interviewSheetModifyApi.deleteDatabaseQuestion(sheetId, questionId),
    onSuccess: (data, variables) => {
      toast.success("Question deleted successfully");
      queryClient.invalidateQueries({
        queryKey: ["interview-sheet-detail", variables.sheetId],
      });
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to delete question",
      );
    },
  });
};

export const useAddDatabaseQuestion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      sheetId,
      question,
    }: {
      sheetId: string;
      question: Omit<IQuestion, "id" | "created_at" | "updated_at">;
    }) => interviewSheetModifyApi.addDatabaseQuestion(sheetId, question),
    onSuccess: (data, variables) => {
      toast.success("Question added successfully");
      queryClient.invalidateQueries({
        queryKey: ["interview-sheet-detail", variables.sheetId],
      });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to add question");
    },
  });
};

export const useUpdateSheetMetadata = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      sheetId,
      metadata,
    }: {
      sheetId: string;
      metadata: Partial<{
        name: string;
        description: string;
        meta: string;
        slug: string;
        coverImageURL: string;
        liveOn: Date | string;
        isPremium: boolean;
        price: number;
        discountPercentage: number;
        appliedCoupon: string | null;
        roadmap: string;
        features: string[];
        frequency: string;
        priority: string;
        companyTypes: string[];
      }>;
    }) => interviewSheetModifyApi.updateSheetMetadata(sheetId, metadata),
    onSuccess: (data, variables) => {
      toast.success("Sheet metadata updated successfully");
      queryClient.invalidateQueries({
        queryKey: ["interview-all-sheets"],
      });
      queryClient.invalidateQueries({
        queryKey: ["interview-sheet-detail", variables.sheetId],
      });
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to update sheet metadata",
      );
    },
  });
};

export const useDeleteSheet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sheetId: string) =>
      interviewSheetModifyApi.deleteSheet(sheetId),
    onSuccess: () => {
      toast.success("Sheet deleted successfully");
      queryClient.invalidateQueries({
        queryKey: ["interview-all-sheets"],
      });
      queryClient.invalidateQueries({
        queryKey: ["interview-sheets"],
      });
    },
    onError: (error: AxiosError) => {
      toast.error(
        (error?.response?.data as any)?.message || "Failed to delete sheet",
      );
    },
  });
};

// Helper function to download sheet as JSON
export const downloadSheetAsJSON = (sheet: ISheet) => {
  const dataStr = JSON.stringify(sheet, null, 2);
  const dataBlob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${sheet.topic}_interview_questions.json`;
  link.click();
  URL.revokeObjectURL(url);
};
