import { API_ENDPOINTS, config } from "@tbe/config/quizes";
import { sendRequest } from "@tbe/utils";

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  difficulty: "easy" | "medium" | "hard";
  explanation: string;
  detailedExplanation: string;
}

export interface QuizSession {
  sessionId: string;
  categoryName: string;
  difficulty: string;
  questionCount: number;
  currentQuestionIndex: number;
  currentQuestion: QuizQuestion | null;
  progress: {
    answered: number;
    total: number;
    percentage: number;
  };
}

export interface QuizResult {
  isCorrect: boolean;
  explanation: string;
  detailedExplanation?: string;
  nextQuestion?: QuizQuestion;
  isCompleted?: boolean;
  progress: {
    answered: number;
    total: number;
    percentage: number;
  };
}

export const quizApi = {
  // Get quiz categories
  getCategories: async () => {
    try {
      const result = await sendRequest({
        url: `/quiz`,
        baseURL: config.API_BASE_URL,
      });
      if (!result.success)
        throw new Error(result.message || "Failed to fetch categories");
      return result;
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : "Failed to fetch categories",
      );
    }
  },

  // Get quiz questions for a category
  getQuestions: async (quizId: string, shuffle: boolean = true) => {
    try {
      const result = await sendRequest({
        url: `/quiz/${quizId}?shuffle=${shuffle}`,
        baseURL: config.API_BASE_URL,
      });
      if (!result.success)
        throw new Error(result.message || "Failed to fetch quiz questions");
      return result;
    } catch (error) {
      throw new Error(
        error instanceof Error
          ? error.message
          : "Failed to fetch quiz questions",
      );
    }
  },

  // Start a quiz session
  startSession: async (payload: {
    userId: string;
    quizId: string;
    difficulty?: "easy" | "medium" | "hard" | "mixed";
    questionCount?: number;
  }) => {
    try {
      const result = await sendRequest({
        method: "POST",
        url: `/quiz/session/start`,
        body: payload,
        baseURL: config.API_BASE_URL,
      });
      if (!result.success)
        throw new Error(result.message || "Failed to start quiz session");
      return result;
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : "Failed to start quiz session",
      );
    }
  },

  // Submit an answer
  submitAnswer: async (
    sessionId: string,
    payload: {
      questionIndex: number;
      answer: number;
      timeSpent: number;
    },
  ) => {
    try {
      const result = await sendRequest({
        method: "POST",
        url: `/quiz/session/${sessionId}/answer`,
        body: payload,
        baseURL: config.API_BASE_URL,
      });
      if (!result.success)
        throw new Error(result.message || "Failed to submit answer");
      return result;
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : "Failed to submit answer",
      );
    }
  },

  // Complete a quiz session
  completeSession: async (sessionId: string) => {
    try {
      const result = await sendRequest({
        method: "POST",
        url: `/quiz/session/${sessionId}/complete`,
        baseURL: config.API_BASE_URL,
      });
      if (!result.success)
        throw new Error(result.message || "Failed to complete quiz session");
      return result;
    } catch (error) {
      throw new Error(
        error instanceof Error
          ? error.message
          : "Failed to complete quiz session",
      );
    }
  },

  // Get user analytics
  getUserAnalytics: async (userId: string, categoryName?: string) => {
    try {
      let url = `/quiz/analytics/${userId}`;
      if (categoryName) url += `?categoryName=${categoryName}`;

      const result = await sendRequest({
        url,
        baseURL: config.API_BASE_URL,
      });
      if (!result.success)
        throw new Error(result.message || "Failed to fetch analytics");
      return result;
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : "Failed to fetch analytics",
      );
    }
  },

  // Get leaderboard
  getLeaderboard: async (categoryName?: string, limit: number = 50) => {
    try {
      let url = `/quiz/leaderboard?limit=${limit}`;
      if (categoryName) url += `&categoryName=${categoryName}`;

      const result = await sendRequest({
        url,
        baseURL: config.API_BASE_URL,
      });
      if (!result.success)
        throw new Error(result.message || "Failed to fetch leaderboard");
      return result;
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : "Failed to fetch leaderboard",
      );
    }
  },

  // Get user quiz sessions/history
  getUserSessions: async (userId: string, status?: string) => {
    try {
      let url = `/quiz/sessions/${userId}`;
      if (status) url += `?status=${status}`;

      const result = await sendRequest({
        url,
        baseURL: config.API_BASE_URL,
      });
      if (!result.success)
        throw new Error(result.message || "Failed to fetch user sessions");
      return result;
    } catch (error) {
      throw new Error(
        error instanceof Error
          ? error.message
          : "Failed to fetch user sessions",
      );
    }
  },

  // Submit quiz answers
  submitQuiz: async (
    quizId: string,
    payload: {
      userId: string;
      answers: Array<{
        questionIndex: number;
        selectedAnswer: number;
        isCorrect: boolean;
        timeSpent: number;
      }>;
      totalTimeSpent: number;
    },
  ) => {
    try {
      const result = await sendRequest({
        method: "POST",
        url: `/quiz/${quizId}/submit`,
        body: payload,
        baseURL: config.API_BASE_URL,
      });
      if (!result.success)
        throw new Error(result.message || "Failed to submit quiz");
      return result;
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : "Failed to submit quiz",
      );
    }
  },

  submitAttempt: async (
    id: string,
    data: {
      userId: string;
      answers: number[];
      timeTaken: number;
    },
  ) => {
    try {
      const result = await sendRequest({
        method: "POST",
        url: `${API_ENDPOINTS.QUIZ_QUESTIONS(id)}/attempt`,
        body: data,
        baseURL: config.API_BASE_URL,
      });
      if (!result.success)
        throw new Error(result.message || "Failed to submit attempt");
      return result;
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : "Failed to submit attempt",
      );
    }
  },
};
