const baseApiUrl = process.env.NEXT_PUBLIC_TBE_WEBAPP_API_URL as string

export const config = {
    API_BASE_URL: baseApiUrl?.endsWith("/api/v1")
        ? baseApiUrl
        : `${baseApiUrl}/api/v1`,
    GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID as string,
    ONBOARDING_APP_URL: process.env.NEXT_PUBLIC_ONBOARDING_APP_URL as string
}

export const API_ENDPOINTS = {
    // Auth - These endpoints should be relative to API_BASE_URL (http://localhost:3000/api/v1)
    AUTH_SESSION: "/auth/session",
    AUTH_SIGNOUT: "/auth/signout",

    // Quiz - Matching actual TBE webapp API structure
    QUIZ_CATEGORIES: "/quiz", // GET /api/v1/quiz
    QUIZ_QUESTIONS: (id: string) => `/quiz/${id}`, // GET /api/v1/quiz/[id]
    QUIZ_SUBMIT: (id: string) => `/quiz/${id}/submit`, // POST /api/v1/quiz/[id]/submit
    QUIZ_PERFORMANCE: (userId: string) => `/quiz/performance/${userId}`, // GET /api/v1/quiz/performance/[userId]
    QUIZ_LEADERBOARD: "/quiz/leaderboard", // GET /api/v1/quiz/leaderboard
    QUIZ_ATTEMPTS: "/quiz/attempts", // GET /api/v1/quiz/attempts
    QUIZ_ANALYTICS: (userId: string) => `/quiz/analytics/${userId}`, // GET /api/v1/quiz/analytics/[userId]

    // User - Relative paths since API_BASE_URL includes /api/v1
    USER_CREATE: "/user",
    USER_ONBOARDING: "/user/onboarding",
    USER_PROFILE: "/user",

    // Admin
    ADMIN_QUIZ_ANALYTICS: "/admin/quiz-analytics", // GET /api/v1/admin/quiz-analytics

    // Legacy gamification endpoints (if needed)
    GAMIFICATION_LEADERBOARD: "/gamification/leaderboard",
    USER_RANK: "/gamification/user-rank",

    // Gamification endpoints
    GAMIFICATION_USER_POINTS: "/gamification"
}
