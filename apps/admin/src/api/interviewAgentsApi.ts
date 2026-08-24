import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { agentsClient } from "@/lib/agentsClient";
import api from "@/lib/axios";

// Types
export interface InterviewGenerationSession {
  sessionId: string;
  topic: string;
  agentType: "generic" | "dsa" | "tech" | "system_design";
  technology?: string;
  roadmap: string;
  questionCount: number;
  status: "pending" | "in_progress" | "completed" | "failed";
  progress: {
    percent: number;
    current_step: string;
    completed_questions: number;
    total_questions: number;
  };
  startedAt: string;
  completedAt?: string;
  outputFile?: string;
  sheetData?: any;
  sheet_data?: any;
  session_id?: string;
  error?: string;
}

export interface BulkGenerationRequest {
  topics: Array<{
    name: string;
    agentType: "generic" | "dsa" | "tech" | "system_design";
    technology?: string;
    questionCount: number;
    roadmap: string;
    difficulty: "Easy" | "Medium" | "Hard" | "Mixed";
  }>;
  generateAnswers: boolean;
  autoPublish: boolean;
}

// Legacy function - keep for backward compatibility
export async function createInterviewSheetFromMDX(payload: {
  mdx_file: string;
  agent_type?: "generic" | "dsa" | "tech";
  technology?: string;
  save?: boolean;
}) {
  const res = await agentsClient.post<{
    ok: boolean;
    message: string;
    output_file?: string;
    sheet?: any;
  }>(`/interview/create-sheet`, payload);
  return res.data;
}

// Helper function to validate session data
export const validateSessionData = (
  session: InterviewGenerationSession,
): { valid: boolean; issues: string[] } => {
  const issues: string[] = [];

  if (session.status === "completed") {
    if (!session.sheetData) {
      issues.push("No sheetData found in completed session");
    } else {
      const questionsLen = session.sheetData.questions?.length ?? 0;
      const sheetCount =
        typeof session.sheetData.question_count === "number"
          ? session.sheetData.question_count
          : undefined;
      const sessionCount =
        typeof session.questionCount === "number"
          ? session.questionCount
          : undefined;

      // Fallback: if no explicit count, use questions length so we don't flag false mismatches
      const expectedCount = sheetCount ?? sessionCount ?? questionsLen;

      if (questionsLen === 0 && (expectedCount ?? 0) > 0) {
        issues.push(
          `Questions array is empty (expected ${expectedCount} questions)`,
        );
      }

      // Only flag mismatch when we actually have a declared expected count
      if (
        expectedCount !== undefined &&
        questionsLen > 0 &&
        questionsLen !== expectedCount
      ) {
        issues.push(
          `Mismatch: questions array has ${questionsLen} items but question_count says ${expectedCount}`,
        );
      }
    }
  }

  return {
    valid: issues.length === 0,
    issues,
  };
};

// Enhanced Interview Generation API
export const enhancedInterviewApi = {
  // Start bulk generation for multiple topics
  startBulkGeneration: async (
    payload: BulkGenerationRequest,
  ): Promise<{ sessionIds: string[]; message: string }> => {
    const response = await agentsClient.post<{
      sessionIds: string[];
      message: string;
    }>(`/interview/bulk-generate`, payload);
    return response.data;
  },

  // Generate questions for a single topic
  generateTopicQuestions: async (payload: {
    topic: string;
    agentType: "generic" | "dsa" | "tech" | "system_design";
    technology?: string;
    questionCount: number;
    roadmap: string;
    difficulty: "Easy" | "Medium" | "Hard" | "Mixed";
    generateAnswers: boolean;
  }): Promise<{ sessionId: string; message: string }> => {
    const response = await agentsClient.post<{
      sessionId: string;
      message: string;
    }>(`/interview/generate-topic`, payload);
    return response.data;
  },

  // Get session progress
  getSessionProgress: async (
    sessionId: string,
  ): Promise<InterviewGenerationSession> => {
    const response = await agentsClient.get<InterviewGenerationSession>(
      `/interview/session/${sessionId}/progress`,
    );
    return response.data;
  },
  // Get single session details
  getSession: async (sessionId: string): Promise<any> => {
    try {
      const response = await agentsClient.get<any>(
        `/interview/session/${sessionId}/output`,
      );

      // Handle wrapped response structure
      const data = response.data;
      if (data.sheet_data) {
        // Response is wrapped: { status: 'success', session_id: '...', sheet_data: {...} }
        return data.sheet_data;
      }
      // If not wrapped, return as is
      return data;
    } catch (error) {
      throw error;
    }
  },

  // List all active/recent sessions
  listSessions: async (
    status?: string,
  ): Promise<InterviewGenerationSession[]> => {
    const params = status ? { status } : {};
    const response = await agentsClient.get<InterviewGenerationSession[]>(
      `/interview/sessions`,
      { params },
    );
    return response.data;
  },

  // Cancel a session
  cancelSession: async (sessionId: string): Promise<{ message: string }> => {
    const response = await agentsClient.post<{ message: string }>(
      `/interview/session/${sessionId}/cancel`,
    );
    return response.data;
  },

  // Retry failed session
  retrySession: async (
    sessionId: string,
  ): Promise<{ sessionId: string; message: string }> => {
    const response = await agentsClient.post<{
      sessionId: string;
      message: string;
    }>(`/interview/session/${sessionId}/retry`);
    return response.data;
  },

  pushToDatabase: async (
    sessionId: string,
    payload: {
      metadata: any;
      sheetData: any;
    },
  ): Promise<{ sheetId: string; message: string }> => {
    const response = await api.post("/interview-prep/upload", {
      sessionId,
      metadata: payload.metadata,
      sheetData: payload.sheetData,
    });
    return response.data;
  },

  // Delete a session
  deleteSession: async (sessionId: string): Promise<{ message: string }> => {
    const response = await agentsClient.delete<{ message: string }>(
      `/interview/session/${sessionId}`,
    );
    return response.data;
  },

  // Get available topics/templates
  getTopicTemplates: async (): Promise<
    Array<{
      name: string;
      description: string;
      agentTypes: string[];
      suggestedQuestionCount: number;
      difficulty: string;
      roadmaps: string[];
    }>
  > => {
    const response = await agentsClient.get<
      Array<{
        name: string;
        description: string;
        agentTypes: string[];
        suggestedQuestionCount: number;
        difficulty: string;
        roadmaps: string[];
      }>
    >(`/interview/topic-templates`);
    return response.data;
  },

  // Get roadmap suggestions
  getRoadmapSuggestions: async (): Promise<
    Array<{
      name: string;
      description: string;
      topics: string[];
      technologies: string[];
    }>
  > => {
    const response = await agentsClient.get<
      Array<{
        name: string;
        description: string;
        topics: string[];
        technologies: string[];
      }>
    >(`/interview/roadmap-suggestions`);
    return response.data;
  },

  // Update session sheet data (for JSON review/edit)
  updateSessionSheet: async (
    sessionId: string,
    sheetData: any,
  ): Promise<{ message: string }> => {
    const response = await agentsClient.put<{ message: string }>(
      `/interview/session/${sessionId}/sheet`,
      { sheetData },
    );
    return response.data;
  },

  // Update interview sheet in DB (for JSON review/edit)
  updateInterviewSheet: async (
    sheetId: string,
    sheetData: any,
  ): Promise<{ message: string }> => {
    const response = await api.patch(`/interview-prep/${sheetId}`, sheetData);
    return response.data;
  },
};

// React Query Hooks
export const useStartBulkGeneration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: enhancedInterviewApi.startBulkGeneration,
    onSuccess: (data) => {
      toast.success("Request accepted by backend", {
        description: `Generation started for ${data.sessionIds.length} topics. Please wait for some time and check the Sessions section to see the results.`,
      });
      queryClient.invalidateQueries({
        queryKey: ["interview-sessions"],
        exact: false,
      });
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to start bulk generation",
      );
    },
  });
};

export const useGenerateTopicQuestions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: enhancedInterviewApi.generateTopicQuestions,
    onSuccess: (data) => {
      toast.success("Request accepted by backend", {
        description:
          "The generation process has started. Please wait for some time and check the Sessions section to see the results.",
      });
      queryClient.invalidateQueries({
        queryKey: ["interview-sessions"],
        exact: false,
      });
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to start generation",
      );
    },
  });
};

export const useInterviewSessions = (status?: string) => {
  return useQuery({
    queryKey: ["interview-sessions", status],
    queryFn: async () => {
      const sessions = await enhancedInterviewApi.listSessions(status);

      // Validate sessions and log issues
      sessions.forEach((session) => {
        const validation = validateSessionData(session);
        if (!validation.valid) {
          if (session.status === "completed" && validation.issues.length > 0) {
            toast.warning(
              `Session "${
                session.topic
              }" has data integrity issues: ${validation.issues.join("; ")}`,
              {
                duration: 4000,
              },
            );
          }
        }
      });

      return sessions;
    },
    refetchInterval: (query) => {
      // Stop refetching if there's a connection error to prevent error spam
      if (query.state.error) {
        const error = query.state.error as any;
        const isConnectionError =
          error?.code === "ERR_NETWORK" ||
          error?.message?.includes("ERR_CONNECTION_REFUSED") ||
          error?.message?.includes("Network Error") ||
          error?.response === undefined; // Network errors don't have response

        if (isConnectionError) {
          // Stop polling on connection errors
          return false;
        }
      }
      return 2000; // Continue polling if no connection error
    },
    staleTime: 1000,
    retry: false, // Don't retry on connection errors
  });
};

export const useSessionProgress = (sessionId: string) => {
  return useQuery({
    queryKey: ["interview-session-progress", sessionId],
    queryFn: () => enhancedInterviewApi.getSessionProgress(sessionId),
    enabled: !!sessionId,
    refetchInterval: 1000, // Poll every second for progress updates
    staleTime: 500,
  });
};

export const useGetSession = (sessionId: string) => {
  return useQuery({
    queryKey: ["interview-session", sessionId],
    queryFn: () => {
      return enhancedInterviewApi.getSession(sessionId);
    },
    enabled: !!sessionId,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: "always",
  });
};

export const useCancelSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: enhancedInterviewApi.cancelSession,
    onSuccess: () => {
      toast.success("Session cancelled successfully");
      queryClient.invalidateQueries({
        queryKey: ["interview-sessions"],
        exact: false,
      });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to cancel session");
    },
  });
};

export const useRetrySession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: enhancedInterviewApi.retrySession,
    onSuccess: () => {
      toast.success("Session retry started");
      queryClient.invalidateQueries({
        queryKey: ["interview-sessions"],
        exact: false,
      });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to retry session");
    },
  });
};

export const useDeleteSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: enhancedInterviewApi.deleteSession,
    onSuccess: (data, sessionId) => {
      toast.success("Session deleted successfully");

      // Manually update the cache to immediately remove the session from UI
      // This prevents the session from lingering in the UI while refetch happens
      queryClient.setQueriesData(
        { queryKey: ["interview-sessions"], exact: false },
        (oldData: any) => {
          if (!Array.isArray(oldData)) return oldData;
          return oldData.filter(
            (session: any) => session.sessionId !== sessionId,
          );
        },
      );

      // Also invalidate and refetch to ensure we have fresh data from server
      queryClient.invalidateQueries({
        queryKey: ["interview-sessions"],
        exact: false,
      });

      // Force an immediate refetch to update UI with latest server data
      queryClient.refetchQueries({
        queryKey: ["interview-sessions"],
        exact: false,
        type: "active",
      });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to delete session");
    },
  });
};

export const usePushToDatabase = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      sessionId,
      payload,
    }: {
      sessionId: string;
      payload: {
        metadata: any;
        sheetData: any;
      };
    }) => enhancedInterviewApi.pushToDatabase(sessionId, payload),
    onSuccess: (data, variables) => {
      // Check if questions were actually saved
      const sheetData = data as any;
      if (
        sheetData.sheetData?.question_count === 0 &&
        sheetData.sheetData?.questions?.length === 0
      ) {
        toast.error(
          "Warning: Sheet was published but contains 0 questions. Backend may not have properly serialized the questions.",
          {
            duration: 5000,
          },
        );
      } else {
        toast.success("Interview sheet published to database successfully");
      }
      queryClient.invalidateQueries({ queryKey: ["interview-sheets"] });
      queryClient.invalidateQueries({
        queryKey: ["interview-sessions"],
        exact: false,
      });
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to publish to database",
      );
    },
  });
};

export const useTopicTemplates = () => {
  return useQuery({
    queryKey: ["interview-topic-templates"],
    queryFn: enhancedInterviewApi.getTopicTemplates,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useRoadmapSuggestions = () => {
  return useQuery({
    queryKey: ["interview-roadmap-suggestions"],
    queryFn: enhancedInterviewApi.getRoadmapSuggestions,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
export const useUpdateSessionSheet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      sessionId,
      sheetData,
    }: {
      sessionId: string;
      sheetData: any;
    }) => enhancedInterviewApi.updateSessionSheet(sessionId, sheetData),
    onSuccess: (data, variables) => {
      toast.success("Session data updated successfully");
      queryClient.invalidateQueries({
        queryKey: ["interview-session", variables.sessionId],
      });
      queryClient.invalidateQueries({
        queryKey: ["interview-sessions"],
        exact: false,
      });
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to update session data",
      );
    },
  });
};
