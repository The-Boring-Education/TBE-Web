import { apiClient, APIError } from "./base"
import { API_ENDPOINTS } from "@/config"
import { APIResponse, QuizCategoryAPI, QuizQuestionsData, QuizAttempt, PerformanceMetrics, CategoryPerformance, PerformanceHistory, LeaderboardData, UserProfile, UserPoints } from "@/types/api"

// User APIs
export const userApi = {
    createOrFindUser: async (data: {
        name: string
        email: string
        image?: string
        provider: string
        providerAccountId: string
    }) => {
        try {
            return await apiClient.post(API_ENDPOINTS.USER_CREATE, data)
        } catch (error) {
            console.error("Error creating/finding user:", error)
            throw error
        }
    },

    getUserByEmail: async (email: string) => {
        try {
            const response = await apiClient.get(API_ENDPOINTS.USER_CREATE, {
                params: { email }
            })
            return response
        } catch (error) {
            console.error("Error getting user by email:", error)
            return { data: { data: null } }
        }
    },

    getUserById: async (userId: string) => {
        try {
            const response = await apiClient.get(API_ENDPOINTS.USER_CREATE, {
                params: { userId }
            })
            return response
        } catch (error) {
            console.error("Error getting user by ID:", error)
            return { data: { data: null } }
        }
    },

    onboardUser: async (
        userId: string,
        data: {
            userName: string
            occupation: string
            purpose: string[]
            contactNo?: string
        }
    ) => {
        try {
            return await apiClient.post(API_ENDPOINTS.USER_ONBOARDING, data, {
                params: { userId }
            })
        } catch (error) {
            console.error("Error onboarding user:", error)
            throw error
        }
    },

    checkUsername: async (userName: string) => {
        try {
            return await apiClient.get(API_ENDPOINTS.USER_ONBOARDING, {
                params: { userName }
            })
        } catch (error) {
            console.error("Error checking username:", error)
            throw error
        }
    }
}

// Auth APIs (for future use)
export const authApi = {
    getSession: async () => {
        try {
            return await apiClient.get(API_ENDPOINTS.AUTH_SESSION)
        } catch (error) {
            console.error("Error getting session:", error)
            throw error
        }
    },

    signOut: async () => {
        try {
            return await apiClient.post(API_ENDPOINTS.AUTH_SIGNOUT)
        } catch (error) {
            console.error("Error signing out:", error)
            throw error
        }
    }
}

// Quiz APIs
export const quizApi = {
    // Get all quiz categories
    getCategories: async (): Promise<APIResponse<QuizCategoryAPI[]>> => {
        try {
            return await apiClient.get<APIResponse<QuizCategoryAPI[]>>(API_ENDPOINTS.QUIZ_CATEGORIES)
        } catch (error) {
            console.error("Error fetching quiz categories:", error)
            throw error
        }
    },

    // Get 10 questions for a quiz (simplified)
    getQuestions: async (id: string): Promise<APIResponse<QuizQuestionsData>> => {
        try {
            // Add query parameters to ensure consistent ordering
            return await apiClient.get<APIResponse<QuizQuestionsData>>(`${API_ENDPOINTS.QUIZ_QUESTIONS(id)}?shuffle=false&random=false&sort=original`)
        } catch (error) {
            console.error("Error fetching quiz questions:", error)
            throw error
        }
    },

    // Submit completed quiz with all answers (matching TBE webapp format)
    submitQuiz: async (
        id: string, 
        data: {
            userId: string
            answers: {
                questionIndex: number
                selectedAnswer: number
                isCorrect: boolean
                timeSpent: number
            }[]
            totalTimeSpent: number
        }
    ) => {
        try {
            return await apiClient.post(API_ENDPOINTS.QUIZ_SUBMIT(id), data)
        } catch (error) {
            console.error("Error submitting quiz:", error)
            throw error
        }
    },

    // Get user performance analytics
    getUserPerformance: async (userId: string) => {
        try {
            return await apiClient.get(API_ENDPOINTS.QUIZ_PERFORMANCE(userId))
        } catch (error) {
            console.error("Error fetching user performance:", error)
            throw error
        }
    },

    // Get global leaderboard
    getLeaderboard: async (category?: string, limit: number = 50) => {
        try {
            const params: Record<string, string> = { limit: limit.toString() }
            if (category) params.category = category
            
            return await apiClient.get(API_ENDPOINTS.QUIZ_LEADERBOARD, { params })
        } catch (error) {
            console.error("Error fetching leaderboard:", error)
            throw error
        }
    },

    // Legacy methods for backward compatibility
    submitAttempt: async (
        id: string, 
        data: {
            userId: string
            answers: number[]
            timeTaken: number
        }
    ) => {
        try {
            return await apiClient.post(
                `${API_ENDPOINTS.QUIZ_QUESTIONS(id)}/attempt`, 
                data
            )
        } catch (error) {
            console.error("Error submitting quiz attempt:", error)
            throw error
        }
    },

    getUserAttempts: async (userId: string): Promise<APIResponse<QuizAttempt[]>> => {
        try {
            return await apiClient.get<APIResponse<QuizAttempt[]>>(API_ENDPOINTS.QUIZ_ATTEMPTS, {
                params: { userId }
            })
        } catch (error) {
            console.error("Error fetching user attempts:", error)
            throw error
        }
    }
}

// Analytics & Performance APIs (using quiz endpoints)
export const analyticsApi = {
    getPerformanceMetrics: async (userId: string): Promise<APIResponse<PerformanceMetrics>> => {
        try {
            return await apiClient.get<APIResponse<PerformanceMetrics>>(API_ENDPOINTS.QUIZ_PERFORMANCE(userId))
        } catch (error) {
            console.error("Error fetching performance metrics:", error)
            throw error
        }
    },

    getCategoryPerformance: async (userId: string): Promise<APIResponse<CategoryPerformance[]>> => {
        try {
            return await apiClient.get<APIResponse<CategoryPerformance[]>>(API_ENDPOINTS.QUIZ_ANALYTICS(userId))
        } catch (error) {
            console.error("Error fetching category performance:", error)
            throw error
        }
    },

    getPerformanceHistory: async (userId: string, days: number = 30): Promise<APIResponse<PerformanceHistory[]>> => {
        try {
            return await apiClient.get<APIResponse<PerformanceHistory[]>>(API_ENDPOINTS.QUIZ_ANALYTICS(userId), {
                params: { days: days.toString() }
            })
        } catch (error) {
            console.error("Error fetching performance history:", error)
            throw error
        }
    }
}

// Leaderboard APIs (using quiz endpoints)
export const leaderboardApi = {
    getLeaderboard: async (limit: number = 50): Promise<APIResponse<LeaderboardData[]>> => {
        try {
            return await apiClient.get<APIResponse<LeaderboardData[]>>(API_ENDPOINTS.QUIZ_LEADERBOARD, {
                params: { limit: limit.toString() }
            })
        } catch (error) {
            console.error("Error fetching leaderboard:", error)
            throw error
        }
    },

    getUserRank: async (userId: string): Promise<APIResponse<{ rank: number }>> => {
        try {
            return await apiClient.get<APIResponse<{ rank: number }>>(API_ENDPOINTS.GAMIFICATION_LEADERBOARD, {
                params: { userId }
            })
        } catch (error) {
            console.error("Error fetching user rank:", error)
            throw error
        }
    }
}

// User Profile APIs
export const userProfileApi = {
    getUserProfile: async (userId: string): Promise<APIResponse<UserProfile>> => {
        try {
            return await apiClient.get<APIResponse<UserProfile>>(API_ENDPOINTS.USER_PROFILE, {
                params: { userId }
            })
        } catch (error) {
            console.error("Error fetching user profile:", error)
            throw error
        }
    }
}

// Gamification APIs
export const gamificationApi = {
    getuserGamificationPoints:async(userId:string):Promise<APIResponse<any>> => {
        try {
            const response = await apiClient.get<APIResponse<UserPoints>>(API_ENDPOINTS.GAMIFICATION_USER_POINTS, {
                params: { userId }
            })

            console.log(response.data.points)
            return response
        } catch (error) {
            console.error("Error fetching user gamification points:", error)
            throw error
        }
    },

    updateuserGamificationPoints:async(data:{
        userId:string
        actionType:string
    }):Promise<APIResponse<any>> => {

        try {
            // Build URL with userId as query parameter
            const url = `${API_ENDPOINTS.GAMIFICATION_USER_POINTS}?userId=${data.userId}`
            
            const response = await apiClient.post<APIResponse<UserPoints>>(url, {
                actionType: data.actionType
            })
            
            return response
        } catch (error) {
            console.error("Error updating user gamification points:", error)
            throw error
        }
    }
}


export { apiClient, APIError }