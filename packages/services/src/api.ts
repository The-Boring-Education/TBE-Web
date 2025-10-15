import { apiClient, APIError } from "./base"
import { API_ENDPOINTS } from "@tbe/config/quizes"
import type { APIResponse, PerformanceMetrics, CategoryPerformance, PerformanceHistory, LeaderboardData, UserProfile, UserPoints } from "@tbe/types";
import { QuizCategoryAPI, QuizQuestionsData, QuizAttempt } from "@tbe/types"

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