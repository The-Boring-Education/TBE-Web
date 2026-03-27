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
    const result = await sendRequest({
      url: `/quiz`,
      baseURL: config.API_BASE_URL,
    });
    if (!result.success)
      throw new Error(result.message || "Failed to fetch categories");
    return result;
  },

  // Get quiz questions for a category
  getQuestions: async (quizId: string, shuffle: boolean = true) => {
    const result = await sendRequest({
      url: `/quiz/${quizId}?shuffle=${shuffle}`,
      baseURL: config.API_BASE_URL,
    });
    if (!result.success)
      throw new Error(result.message || "Failed to fetch questions");
    return result;
  },

  // Start a quiz session
  startSession: async (payload: {
    userId: string;
    quizId: string;
    difficulty?: "easy" | "medium" | "hard" | "mixed";
    questionCount?: number;
  }) => {
    const result = await sendRequest({
      method: "POST",
      url: `/quiz/session/start`,
      body: payload,
      baseURL: config.API_BASE_URL,
    });
    if (!result.success)
      throw new Error(result.message || "Failed to start session");
    return result;
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
    const result = await sendRequest({
      method: "POST",
      url: `/quiz/session/${sessionId}/answer`,
      body: payload,
      baseURL: config.API_BASE_URL,
    });
    if (!result.success)
      throw new Error(result.message || "Failed to submit answer");
    return result;
  },

  // Complete a quiz session
  completeSession: async (sessionId: string) => {
    const result = await sendRequest({
      method: "POST",
      url: `/quiz/session/${sessionId}/complete`,
      baseURL: config.API_BASE_URL,
    });
    if (!result.success)
      throw new Error(result.message || "Failed to complete session");
    return result;
  },

  // Get user analytics
  getUserAnalytics: async (userId: string, categoryName?: string) => {
    let url = `/quiz/analytics/${userId}`;
    if (categoryName) url += `?categoryName=${categoryName}`;

    const result = await sendRequest({
      url,
      baseURL: config.API_BASE_URL,
    });
    if (!result.success)
      throw new Error(result.message || "Failed to fetch analytics");
    return result;
  },

  // Get leaderboard
  getLeaderboard: async (categoryName?: string, limit: number = 50) => {
    let url = `/quiz/leaderboard?limit=${limit}`;
    if (categoryName) url += `&categoryName=${categoryName}`;

    const result = await sendRequest({
      url,
      baseURL: config.API_BASE_URL,
    });
    if (!result.success)
      throw new Error(result.message || "Failed to fetch leaderboard");
    return result;
  },

  // Get user quiz sessions/history
  getUserSessions: async (userId: string, status?: string) => {
    let url = `/quiz/sessions/${userId}`;
    if (status) url += `?status=${status}`;

    const result = await sendRequest({
      url,
      baseURL: config.API_BASE_URL,
    });
    if (!result.success)
      throw new Error(result.message || "Failed to fetch user sessions");
    return result;
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
    const result = await sendRequest({
      method: "POST",
      url: `/quiz/${quizId}/submit`,
      body: payload,
      baseURL: config.API_BASE_URL,
    });
    if (!result.success)
      throw new Error(result.message || "Failed to submit quiz");
    return result;
  },

  submitAttempt: async (
    id: string,
    data: {
      userId: string;
      answers: number[];
      timeTaken: number;
    },
  ) => {
    const result = await sendRequest({
      method: "POST",
      url: `${API_ENDPOINTS.QUIZ_QUESTIONS(id)}/attempt`,
      body: data,
      baseURL: config.API_BASE_URL,
    });
    if (!result.success)
      throw new Error(result.message || "Failed to submit attempt");
    return result;
  },
};
