import { sendRequest } from "./api"
import { trackEvent } from "./analytics"
import type { QuizSession, QuizResult } from "@tbe/types";
import { QuizQuestion } from "@tbe/types"

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
                method: "GET"
            })

            if (!response.success) {
                throw new Error("Failed to fetch quiz categories")
            }

            return response.data || []
        } catch (error) {
            console.error("Error fetching quiz categories:", error)
            throw error
        }
    },

    // Get quiz questions for a category
    async getQuestions(quizId: string) {
        try {
            const response = await sendRequest({
                url: `/api/v1/quiz/${quizId}`,
                method: "GET"
            })

            if (!response.success) {
                throw new Error("Failed to fetch quiz questions")
            }

            return response.data || []
        } catch (error) {
            console.error("Error fetching quiz questions:", error)
            throw error
        }
    },

    // Start a new quiz session
    async startSession(
        quizId: string,
        difficulty: string,
        questionCount: number
    ): Promise<QuizSession> {
        try {
            const response = await sendRequest({
                url: "/api/v1/quiz/session/start",
                method: "POST",
                data: {
                    quizId,
                    difficulty,
                    questionCount
                }
            })

            if (!response.success) {
                throw new Error("Failed to start quiz session")
            }

            // Analytics
            try {
                trackEvent("quiz_session_start", {
                    action: "quiz_session_start",
                    category: "quiz",
                    label: quizId,
                    value: questionCount
                })
            } catch {}

            return response.data
        } catch (error) {
            console.error("Error starting quiz session:", error)
            throw error
        }
    },

    // Submit an answer
    async submitAnswer(
        sessionId: string,
        questionIndex: number,
        selectedOption: number
    ): Promise<QuizResult> {
        try {
            const response = await sendRequest({
                url: "/api/v1/quiz/session/answer",
                method: "POST",
                data: {
                    sessionId,
                    questionIndex,
                    selectedOption
                }
            })

            if (!response.success) {
                throw new Error("Failed to submit answer")
            }

            // Analytics
            try {
                trackEvent("quiz_answer_submit", {
                    action: "quiz_answer_submit",
                    category: "quiz",
                    value: selectedOption,
                    sessionId
                })
            } catch {}

            return response.data
        } catch (error) {
            console.error("Error submitting answer:", error)
            throw error
        }
    },

    // Get quiz session details
    async getSession(sessionId: string): Promise<QuizSession> {
        try {
            const response = await sendRequest({
                url: `/api/v1/quiz/session/${sessionId}`,
                method: "GET"
            })

            if (!response.success) {
                throw new Error("Failed to get quiz session")
            }

            return response.data
        } catch (error) {
            console.error("Error fetching quiz session:", error)
            throw error
        }
    },

    // Complete quiz session and get final results
    async completeSession(sessionId: string) {
        try {
            const response = await sendRequest({
                url: `/api/v1/quiz/session/${sessionId}/complete`,
                method: "POST"
            })

            if (!response.success) {
                throw new Error("Failed to complete quiz session")
            }

            // Analytics
            try {
                trackEvent("quiz_session_complete", {
                    action: "quiz_session_complete",
                    category: "quiz",
                    sessionId
                })
            } catch {}

            return response.data
        } catch (error) {
            console.error("Error completing quiz session:", error)
            throw error
        }
    },

    // Get user quiz history
    async getUserHistory(userId: string) {
        try {
            const response = await sendRequest({
                url: `/api/v1/quiz/history?userId=${userId}`,
                method: "GET"
            })

            if (!response.success) {
                throw new Error("Failed to fetch quiz history")
            }

            return response.data || []
        } catch (error) {
            console.error("Error fetching quiz history:", error)
            throw error
        }
    },

    // Get leaderboard
    async getLeaderboard(quizId?: string, limit: number = 10) {
        try {
            const url = quizId
                ? `/api/v1/quiz/leaderboard?quizId=${quizId}&limit=${limit}`
                : `/api/v1/quiz/leaderboard?limit=${limit}`

            const response = await sendRequest({
                url,
                method: "GET"
            })

            if (!response.success) {
                throw new Error("Failed to fetch leaderboard")
            }

            return response.data || []
        } catch (error) {
            console.error("Error fetching leaderboard:", error)
            throw error
        }
    }
}
