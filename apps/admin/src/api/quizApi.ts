// Add new quiz admin API hooks
import { useMutation, useQuery } from "@tanstack/react-query";

import api from "@/lib/axios";

export interface QuizCategorySummary {
  _id: string;
  categoryName: string;
  categoryDescription: string;
  categoryIcon: string;
  questionCount?: number;
  isActive?: boolean;
}

export const useQuizCategories = (
  withCounts = true,
  includeInactive = true,
) => {
  const query = useQuery<{ data: QuizCategorySummary[] }>({
    queryKey: ["quiz-categories", withCounts, includeInactive],
    queryFn: async () => {
      const res = await api.get(`/quiz`, {
        params: {
          withCounts,
          includeInactive,
        },
      });
      return { data: (res.data?.data || []) as QuizCategorySummary[] };
    },
  });

  return {
    ...query,
    data: (query.data?.data || []) as QuizCategorySummary[],
    isLoading: query.isLoading,
  };
};

export const useAppendQuizQuestions = () => {
  return useMutation({
    mutationFn: async ({ id, questions }: { id: string; questions: any[] }) => {
      const res = await api.post(`/quiz/${id}`, { questions });
      return res.data;
    },
  });
};

export const useCreateQuiz = () => {
  return useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.post(`/quiz`, payload);
      return res.data;
    },
  });
};

// Interface for full quiz data with questions
export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  detailedExplanation: string;
  difficulty: "easy" | "medium" | "hard";
}

export interface QuizData {
  _id?: string;
  categoryName: string;
  categoryDescription: string;
  categoryIcon: string;
  questions: QuizQuestion[];
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Get individual quiz by ID
export const useQuizData = (id: string, includeInactive = true) => {
  const query = useQuery<{ data: QuizData }>({
    queryKey: ["quiz-data", id, includeInactive],
    queryFn: async () => {
      const res = await api.get(`/quiz/${id}`, {
        params: { includeInactive },
      });
      return { data: res.data?.data as QuizData };
    },
    enabled: !!id,
  });

  return {
    ...query,
    data: query.data?.data,
    isLoading: query.isLoading,
  };
};

// Update quiz data
export const useUpdateQuiz = () => {
  return useMutation({
    mutationFn: async ({
      id,
      updatedData,
    }: {
      id: string;
      updatedData: Partial<Omit<QuizData, "_id" | "createdAt" | "updatedAt">>;
    }) => {
      const res = await api.put(`/quiz/${id}`, updatedData);
      return res.data;
    },
  });
};

import { getStoredAgentsEnv } from "@/hooks/useEnvironment";
import { agentsClient } from "@/lib/agentsClient";

export type GenerateQuizPayload = {
  topic: string;
  question_count?: number;
  target_audience?: string;
  save?: boolean;
  environment?: string; // Add environment tracking
};

export async function generateQuiz(payload: GenerateQuizPayload) {
  const env = getStoredAgentsEnv();

  const res = await agentsClient.post("/quiz/generate", {
    ...payload,
    environment: env, // Pass environment info to Agents
  });
  return res.data;
}

export async function validateQuiz(quiz: any) {
  const res = await agentsClient.post<{ ok: boolean; message: string }>(
    "/quiz/validate",
    { quiz },
  );
  return res.data;
}

// Removed upload via Agents; uploads now go directly to Platform API using axios instance

export async function getQuizTopics(): Promise<string[]> {
  const res = await agentsClient.get<{ topics?: string[] }>("/quiz/topics");
  return (res.data?.topics || []) as string[];
}

export async function pingAgents(): Promise<{
  ok: boolean;
  service: string;
  version?: string;
}> {
  const res = await agentsClient.get<{
    ok: boolean;
    service: string;
    version?: string;
  }>("/ping");
  return res.data;
}

// Pending quizzes (from Agents output dir)
export type PendingQuiz = {
  filename: string;
  session_id?: string;
  topic?: string;
  question_count?: number;
  categoryName?: string;
};

export async function listPendingQuizzes(): Promise<PendingQuiz[]> {
  const res = await agentsClient.get<{ pending?: PendingQuiz[] }>(
    "/quiz/pending",
  );
  return (res.data?.pending || []) as PendingQuiz[];
}

export async function deletePendingQuiz(filename: string): Promise<boolean> {
  const res = await agentsClient.delete<{ ok?: boolean }>(
    `/quiz/pending/${encodeURIComponent(filename)}`,
  );
  return !!res.data?.ok;
}

export async function getPendingQuizContent(filename: string): Promise<any> {
  const res = await agentsClient.get(
    `/quiz/pending/${encodeURIComponent(filename)}/content`,
  );
  return res.data;
}
