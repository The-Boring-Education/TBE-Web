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
    return sendRequest({
      url: `/quiz`,
      baseURL: config.API_BASE_URL,
    });
  },

  // Get quiz questions for a category
  getQuestions: async (quizId: string, shuffle: boolean = true) => {
    return sendRequest({
      url: `/quiz/${quizId}?shuffle=${shuffle}`,
      baseURL: config.API_BASE_URL,
    });
  },

  // Start a quiz session
  startSession: async (payload: {
    userId: string;
    quizId: string;
    difficulty?: "easy" | "medium" | "hard" | "mixed";
    questionCount?: number;
  }) => {
    return sendRequest({
      method: "POST",
      url: `/quiz/session/start`,
      body: payload,
      baseURL: config.API_BASE_URL,
    });
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
    return sendRequest({
      method: "POST",
      url: `/quiz/session/${sessionId}/answer`,
      body: payload,
      baseURL: config.API_BASE_URL,
    });
  },

  // Complete a quiz session
  completeSession: async (sessionId: string) => {
    return sendRequest({
      method: "POST",
      url: `/quiz/session/${sessionId}/complete`,
      baseURL: config.API_BASE_URL,
    });
  },

  // Get user analytics
  getUserAnalytics: async (userId: string, categoryName?: string) => {
    let url = `/quiz/analytics/${userId}`;
    if (categoryName) url += `?categoryName=${categoryName}`;

    return sendRequest({
      url,
      baseURL: config.API_BASE_URL,
    });
  },

  // Get leaderboard
  getLeaderboard: async (categoryName?: string, limit: number = 50) => {
    let url = `/quiz/leaderboard?limit=${limit}`;
    if (categoryName) url += `&categoryName=${categoryName}`;

    return sendRequest({
      url,
      baseURL: config.API_BASE_URL,
    });
  },

  // Get user quiz sessions/history
  getUserSessions: async (userId: string, status?: string) => {
    let url = `/quiz/sessions/${userId}`;
    if (status) url += `?status=${status}`;

    return sendRequest({
      url,
      baseURL: config.API_BASE_URL,
    });
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
    return sendRequest({
      method: "POST",
      url: `/quiz/${quizId}/submit`,
      body: payload,
      baseURL: config.API_BASE_URL,
    });
  },

  submitAttempt: async (
    id: string,
    data: {
      userId: string;
      answers: number[];
      timeTaken: number;
    },
  ) => {
    return sendRequest({
      method: "POST",
      url: `${API_ENDPOINTS.QUIZ_QUESTIONS(id)}/attempt`,
      body: data,
      baseURL: config.API_BASE_URL,
    });
  },
};
