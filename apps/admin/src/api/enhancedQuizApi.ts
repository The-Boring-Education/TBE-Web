import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAccessToken } from "@tbe/auth";
import { toast } from "sonner";

import type {
  ApiResponse,
  LeaderboardEntry,
  QuizAnalytics,
  QuizSession,
  QuizSessionData,
  UserAnalytics,
} from "@/types";

const API_BASE_URL =
  (import.meta.env.VITE_BASE_API_URL as string) ||
  "http://localhost:3004/api/v1";

const authHeaders = (): HeadersInit => {
  const token = getAccessToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// API Functions
export const enhancedQuizApi = {
  // Start a quiz session
  startQuizSession: async (payload: {
    userId: string;
    quizId: string;
    difficulty: "easy" | "medium" | "hard" | "mixed";
    questionCount: number;
  }): Promise<ApiResponse<QuizSessionData>> => {
    const response = await fetch(`${API_BASE_URL}/quiz/session/start`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error("Failed to start quiz session");
    return response.json();
  },

  // Submit an answer
  submitAnswer: async (
    sessionId: string,
    payload: {
      questionIndex: number;
      answer: number;
      timeSpent: number;
    },
  ): Promise<ApiResponse<any>> => {
    const response = await fetch(
      `${API_BASE_URL}/quiz/session/${sessionId}/answer`,
      {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(payload),
      },
    );
    if (!response.ok) throw new Error("Failed to submit answer");
    return response.json();
  },

  // Complete a quiz session
  completeQuizSession: async (sessionId: string): Promise<ApiResponse<any>> => {
    const response = await fetch(
      `${API_BASE_URL}/quiz/session/${sessionId}/complete`,
      {
        method: "POST",
        headers: authHeaders(),
      },
    );
    if (!response.ok) throw new Error("Failed to complete quiz session");
    return response.json();
  },

  // Get user analytics
  getUserAnalytics: async (
    userId: string,
    categoryName?: string,
  ): Promise<ApiResponse<UserAnalytics>> => {
    const params = new URLSearchParams();
    if (categoryName) params.append("categoryName", categoryName);

    const response = await fetch(
      `${API_BASE_URL}/quiz/analytics/${userId}?${params}`,
      {
        headers: authHeaders(),
      },
    );
    if (!response.ok) throw new Error("Failed to fetch user analytics");
    return response.json();
  },

  // Get leaderboard
  getLeaderboard: async (
    categoryName?: string,
    limit: number = 50,
  ): Promise<ApiResponse<LeaderboardEntry[]>> => {
    const params = new URLSearchParams();
    if (categoryName) params.append("categoryName", categoryName);
    params.append("limit", limit.toString());

    const response = await fetch(`${API_BASE_URL}/quiz/leaderboard?${params}`, {
      headers: authHeaders(),
    });
    if (!response.ok) throw new Error("Failed to fetch leaderboard");
    return response.json();
  },

  // Get user quiz sessions
  getUserQuizSessions: async (
    userId: string,
    status?: string,
  ): Promise<ApiResponse<QuizSession[]>> => {
    const params = new URLSearchParams();
    if (status) params.append("status", status);

    const response = await fetch(
      `${API_BASE_URL}/quiz/sessions/${userId}?${params}`,
      { headers: authHeaders() },
    );
    if (!response.ok) throw new Error("Failed to fetch user sessions");
    return response.json();
  },

  // Get quiz admin analytics (aggregated)
  getQuizAdminAnalytics: async (): Promise<ApiResponse<QuizAnalytics>> => {
    const response = await fetch(`${API_BASE_URL}/admin/quiz-analytics`, {
      headers: authHeaders(),
    });
    if (!response.ok) throw new Error("Failed to fetch admin analytics");
    return response.json();
  },

  // Get all active sessions (admin view)
  getActiveSessions: async (): Promise<ApiResponse<QuizSession[]>> => {
    const response = await fetch(`${API_BASE_URL}/admin/quiz-active-sessions`, {
      headers: authHeaders(),
    });
    if (!response.ok) throw new Error("Failed to fetch active sessions");
    return response.json();
  },
};

// React Query Hooks
export const useStartQuizSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: enhancedQuizApi.startQuizSession,
    onSuccess: () => {
      toast.success("Quiz session started successfully!");
      queryClient.invalidateQueries({ queryKey: ["quiz-sessions"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to start quiz session");
    },
  });
};

export const useSubmitAnswer = () => {
  return useMutation({
    mutationFn: ({ sessionId, payload }: { sessionId: string; payload: any }) =>
      enhancedQuizApi.submitAnswer(sessionId, payload),
    onError: (error: Error) => {
      toast.error(error.message || "Failed to submit answer");
    },
  });
};

export const useCompleteQuizSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: enhancedQuizApi.completeQuizSession,
    onSuccess: () => {
      toast.success("Quiz completed successfully!");
      queryClient.invalidateQueries({ queryKey: ["quiz-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["user-analytics"] });
      queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to complete quiz");
    },
  });
};

export const useUserAnalytics = (userId: string, categoryName?: string) => {
  return useQuery({
    queryKey: ["user-analytics", userId, categoryName],
    queryFn: () => enhancedQuizApi.getUserAnalytics(userId, categoryName),
    enabled: !!userId,
  });
};

export const useLeaderboard = (categoryName?: string, limit: number = 50) => {
  return useQuery({
    queryKey: ["leaderboard", categoryName, limit],
    queryFn: () => enhancedQuizApi.getLeaderboard(categoryName, limit),
  });
};

export const useUserQuizSessions = (userId: string, status?: string) => {
  return useQuery({
    queryKey: ["quiz-sessions", userId, status],
    queryFn: () => enhancedQuizApi.getUserQuizSessions(userId, status),
    enabled: !!userId,
  });
};

export const useQuizAdminAnalytics = () => {
  return useQuery({
    queryKey: ["admin-analytics"],
    queryFn: enhancedQuizApi.getQuizAdminAnalytics,
  });
};

export const useActiveSessions = () => {
  return useQuery({
    queryKey: ["active-sessions"],
    queryFn: enhancedQuizApi.getActiveSessions,
    refetchInterval: 30000, // Refresh every 30 seconds
  });
};
