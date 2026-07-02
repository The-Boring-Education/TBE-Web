import { ANALYTICS_EVENTS } from "@tbe/constants";
import type { QuizResult, QuizSession } from "@tbe/types";

import { trackEvent } from "./analytics";
import { sendRequest } from "./api";

/**
 * Cleanup quiz option text by removing prefixes . "
 * reusable utility for both oncampus and quizes apps
 */
export const cleanOptionText = (text: string): string => {
  if (!text) return "";
  // Regex matches uppercase letters or numbers followed by dot/paren/space and optional extra whitespace
  return text.replace(/^[A-Z0-9][.)\s]\s*/, "").trim();
};

/**
 * Quiz Service
 *
 * Extracted from quizes app and made reusable
 * Handles all quiz-related API operations
 */

export const quizService = {
  // Get quiz categories
  async getCategories() {
    try {
      const response = await sendRequest({
        url: "/api/v1/quiz",
        method: "GET",
      });

      if (!response.success) {
        throw new Error("Failed to fetch quiz categories");
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching quiz categories:", error);
      throw error;
    }
  },

  // Get quiz questions for a category
  async getQuestions(quizId: string) {
    try {
      const response = await sendRequest({
        url: `/api/v1/quiz/${quizId}`,
        method: "GET",
      });

      if (!response.success) {
        throw new Error("Failed to fetch quiz questions");
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching quiz questions:", error);
      throw error;
    }
  },

  // Start a new quiz session
  async startSession(
    quizId: string,
    difficulty: string,
    questionCount: number,
  ): Promise<QuizSession> {
    try {
      const response = await sendRequest({
        url: "/api/v1/quiz/session/start",
        method: "POST",
        data: {
          quizId,
          difficulty,
          questionCount,
        },
      });

      if (!response.success) {
        throw new Error("Failed to start quiz session");
      }

      // Analytics
      try {
        trackEvent(ANALYTICS_EVENTS.QUIZ_SESSION_START, {
          action: "quiz_session_start",
          category: "quiz",
          label: quizId,
          value: questionCount,
        });
      } catch {
        /* Ignore tracking errors */
      }

      return response.data;
    } catch (error) {
      console.error("Error starting quiz session:", error);
      throw error;
    }
  },

  // Submit an answer
  async submitAnswer(
    sessionId: string,
    questionIndex: number,
    selectedOption: number,
  ): Promise<QuizResult> {
    try {
      const response = await sendRequest({
        url: "/api/v1/quiz/session/answer",
        method: "POST",
        data: {
          sessionId,
          questionIndex,
          selectedOption,
        },
      });

      if (!response.success) {
        throw new Error("Failed to submit answer");
      }

      // Analytics
      try {
        trackEvent(ANALYTICS_EVENTS.QUIZ_ANSWER_SUBMIT, {
          action: "quiz_answer_submit",
          category: "quiz",
          value: selectedOption,
          sessionId,
        });
      } catch {
        /* Ignore tracking errors */
      }

      return response.data;
    } catch (error) {
      console.error("Error submitting answer:", error);
      throw error;
    }
  },

  // Get quiz session details
  async getSession(sessionId: string): Promise<QuizSession> {
    try {
      const response = await sendRequest({
        url: `/api/v1/quiz/session/${sessionId}`,
        method: "GET",
      });

      if (!response.success) {
        throw new Error("Failed to get quiz session");
      }

      return response.data;
    } catch (error) {
      console.error("Error fetching quiz session:", error);
      throw error;
    }
  },

  // Complete quiz session and get final results
  async completeSession(sessionId: string) {
    try {
      const response = await sendRequest({
        url: `/api/v1/quiz/session/${sessionId}/complete`,
        method: "POST",
      });

      if (!response.success) {
        throw new Error("Failed to complete quiz session");
      }

      // Analytics
      try {
        trackEvent(ANALYTICS_EVENTS.QUIZ_SESSION_COMPLETE, {
          action: "quiz_session_complete",
          category: "quiz",
          sessionId,
        });
      } catch {
        /* Ignore tracking errors */
      }

      return response.data;
    } catch (error) {
      console.error("Error completing quiz session:", error);
      throw error;
    }
  },

  // Get user quiz history
  async getUserHistory(userId: string) {
    try {
      const response = await sendRequest({
        url: `/api/v1/quiz/history?userId=${userId}`,
        method: "GET",
      });

      if (!response.success) {
        throw new Error("Failed to fetch quiz history");
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching quiz history:", error);
      throw error;
    }
  },

  // Get leaderboard
  async getLeaderboard(quizId?: string, limit: number = 10) {
    try {
      const url = quizId
        ? `/api/v1/quiz/leaderboard?quizId=${quizId}&limit=${limit}`
        : `/api/v1/quiz/leaderboard?limit=${limit}`;

      const response = await sendRequest({
        url,
        method: "GET",
      });

      if (!response.success) {
        throw new Error("Failed to fetch leaderboard");
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      throw error;
    }
  },
};
