/**
 * Quiz Domain Types
 * 
 * All types related to the Quiz app including questions,
 * sessions, results, and quiz-specific features
 */

// ================================
// CORE QUIZ TYPES
// ================================



// ================================
// QUIZ API TYPES
// ================================


export interface QuizAttempt {
    _id: string
    quizId: string
    categoryName: string
    score: number
    correctAnswers: number
    totalQuestions: number
    timeTaken: number
    pointsEarned: number
    completedAt: string
}

export interface QuizStats {
    totalQuizzes: number
    totalPoints: number
    totalCorrectAnswers: number
    totalQuestions: number
    averageScore: number
    averageTimeTaken: number
    overallAccuracy: number
}

export interface QuizHistoryResponse {
    history: QuizAttempt[]
    stats: QuizStats
}

export interface UserPoints {
    points: number
}

export interface LeaderboardEntry {
    userId: string
    points: number
    user: {
        name: string
        email: string
        image?: string
    }
}

export interface QuizCategoryAPI {
    _id: string
    categoryName: string
    categoryDescription: string
    categoryIcon: string
}

// Generic API Response wrapper
export interface APIResponse<T> {
    success: boolean
    message?: string
    data: T
}

// Specific response types
export interface QuizCategoriesResponse {
    data: QuizCategoryAPI[]
}

// Quiz Question interfaces
export interface QuizQuestion {
    _id?: string
    question: string
    options: string[]
    correctAnswer: number
    explanation: string
    detailedExplanation?: string
    difficulty?: 'easy' | 'medium' | 'hard'
    category?: string
    tags?: string[]
    points?: number
}

export interface QuizQuestionsData {
    _id: string
    categoryName: string
    categoryDescription: string
    categoryIcon: string
    questions: QuizQuestion[]
}

// Enhanced Analytics Types
export interface PerformanceMetrics {
    totalAttempts: number
    totalQuizzes: number
    totalScore?: number // Optional field for total score/points earned
    averageScore: number
    bestScore: number
    totalTimeSpent: number
    averageTimePerQuiz?: number // Optional field for average time per quiz
    accuracyRate?: number // Optional field for accuracy rate percentage
    improvementRate?: number // Optional field for improvement rate percentage
    streakDays?: number // Optional field for consecutive active days
    lastActiveDate?: string // Optional field for last activity date
    categoryBreakdown: Array<{
        categoryName: string
        attempts: number
        averageScore: number
        bestScore: number
    }>
    recentAttempts: Array<{
        _id: string
        quizId: string
        categoryName: string
        score: number
        completedAt: string
        totalTimeSpent: number
    }>
}

export interface CategoryPerformance {
    categoryId: string
    categoryName: string
    attempts: number
    bestScore: number
    averageScore: number
    totalTimeSpent: number
    lastAttemptDate: string
    improvementTrend: "improving" | "declining" | "stable"
}

export interface PerformanceHistory {
    date: string
    score: number
    timeTaken: number
    categoryName: string
    quizId: string
}

export interface LeaderboardData {
    _id: string
    username: string
    image: string
    bestScore: number
    totalAttempts: number
    averageScore: number
    totalTimeSpent: number
}

export interface Achievement {
    id: string
    name: string
    description: string
    icon: string
    unlockedAt: string
    points: number
}

export interface UserProfile {
    userId: string
    userName: string
    userEmail: string
    userImage?: string
    totalPoints: number
    rank: number
    achievements: Achievement[]
    joinDate: string
    lastActiveDate: string
}


export interface Question {
    id: number | string
    question: string
    options: string[]
    correctAnswer: number
    explanation: string
    detailedExplanation: string
    category: string
    difficulty: 'easy' | 'medium' | 'hard'
    tags?: string[]
    estimatedTime?: number
    hints?: string[]
}


export interface QuizCategory {
    id: string
    name: string
    description: string
    icon: string
    questions: Question[]
    color: string
    difficulty?: 'easy' | 'medium' | 'hard'
    estimatedTime: number
    questionsCount: number
    isActive: boolean
    createdAt?: string
    updatedAt?: string
}

// ================================
// QUIZ SESSION TYPES
// ================================

export interface QuizSession {
    sessionId: string
    categoryName: string
    difficulty: string
    questionCount: number
    currentQuestionIndex: number
    currentQuestion: QuizQuestion | null
    timeLeft?: number
    startTime: number
    endTime?: number
    isCompleted: boolean
    isPaused: boolean
    progress: {
        answered: number
        total: number
        percentage: number
    }
    answers: QuizSessionAnswer[]
    userId?: string
}

export interface QuizSessionAnswer {
    questionIndex: number
    selectedOption: number | null
    isCorrect?: boolean
    timeTaken: number
    points?: number
}

export interface QuizState {
    currentQuestion: number
    answers: (number | null)[]
    timeLeft: number
    isActive: boolean
    isCompleted: boolean
    startTime: number
    score?: number
}

// ================================
// QUIZ RESULTS TYPES
// ================================

export interface QuizResult {
    sessionId: string
    score: number
    totalQuestions: number
    correctAnswers: number
    incorrectAnswers: number
    timeTaken: number
    averageTimePerQuestion: number
    accuracy: number
    rank?: number
    answers: QuizResultAnswer[]
    isCompleted: boolean
    completedAt: string
    categoryName: string
    difficulty: string
    pointsEarned: number
    progress: {
        answered: number
        total: number
        percentage: number
    }
}

export interface QuizResultAnswer {
    questionIndex: number
    question: string
    options: string[]
    selectedOption: number | null
    correctAnswer: number
    isCorrect: boolean
    explanation: string
    detailedExplanation?: string
    timeTaken: number
    points: number
}

export interface QuizPerformance {
    totalQuizzes: number
    averageScore: number
    totalTimePlayed: number
    bestCategory: string
    worstCategory: string
    improvementTrend: 'improving' | 'declining' | 'stable'
    recentScores: number[]
    accuracyByDifficulty: {
        easy: number
        medium: number
        hard: number
    }
}

// ================================
// QUIZ HISTORY & STATISTICS
// ================================

export interface QuizAttemptHistory {
    id: string
    sessionId: string
    userId: string
    categoryId: string
    categoryName: string
    difficulty: 'easy' | 'medium' | 'hard'
    score: number
    totalQuestions: number
    correctAnswers: number
    timeTaken: number
    accuracy: number
    rank: number
    pointsEarned: number
    completedAt: string
    answers: QuizResultAnswer[]
}

export interface UserQuizStats {
    userId: string
    totalQuizzesTaken: number
    totalQuestionsAnswered: number
    totalCorrectAnswers: number
    totalTimePlayed: number
    averageScore: number
    overallAccuracy: number
    currentStreak: number
    maxStreak: number
    totalPointsEarned: number
    level: number
    rank: number
    categoryStats: CategoryStats[]
    difficultyStats: DifficultyStats
    recentActivity: QuizAttemptHistory[]
    achievements: string[]
}

export interface CategoryStats {
    categoryId: string
    categoryName: string
    quizzesTaken: number
    averageScore: number
    accuracy: number
    timePlayed: number
    bestScore: number
    lastAttempt: string
}

export interface DifficultyStats {
    easy: {
        quizzesTaken: number
        averageScore: number
        accuracy: number
    }
    medium: {
        quizzesTaken: number
        averageScore: number
        accuracy: number
    }
    hard: {
        quizzesTaken: number
        averageScore: number
        accuracy: number
    }
}

// ================================
// LEADERBOARD TYPES
// ================================

export interface LeaderboardEntry {
    rank: number
    userId: string
    userName: string
    userImage?: string
    totalScore: number
    totalQuizzes: number
    averageScore: number
    accuracy: number
    pointsEarned: number
    level: number
    streak: number
    lastActive: string
}

export interface CategoryLeaderboard {
    categoryId: string
    categoryName: string
    entries: LeaderboardEntry[]
    updatedAt: string
}

export interface GlobalLeaderboard {
    entries: LeaderboardEntry[]
    totalUsers: number
    updatedAt: string
}

// ================================
// QUIZ CONFIGURATION TYPES
// ================================

export interface QuizConfig {
    maxQuestionsPerSession: number
    timePerQuestion: number
    passingScore: number
    pointsPerCorrectAnswer: number
    bonusPointsForSpeed: boolean
    allowReview: boolean
    showExplanations: boolean
    shuffleQuestions: boolean
    shuffleOptions: boolean
    categories: string[]
    difficulties: string[]
}

export interface QuizSettings {
    userId: string
    soundEnabled: boolean
    vibrationEnabled: boolean
    showTimer: boolean
    autoSubmit: boolean
    preferredDifficulty: 'easy' | 'medium' | 'hard' | 'mixed'
    preferredCategories: string[]
    notificationsEnabled: boolean
}

// ================================
// API REQUEST/RESPONSE TYPES
// ================================

export interface StartQuizRequest {
    categoryId: string
    difficulty: 'easy' | 'medium' | 'hard' | 'mixed'
    questionCount: number
    userId?: string
}

export interface SubmitAnswerRequest {
    sessionId: string
    questionIndex: number
    selectedOption: number
    timeTaken: number
}

export interface CompleteQuizRequest {
    sessionId: string
    finalAnswers: QuizSessionAnswer[]
    totalTimeTaken: number
}

export interface GetQuizHistoryRequest {
    userId: string
    page?: number
    limit?: number
    categoryId?: string
    difficulty?: string
    startDate?: string
    endDate?: string
}

export interface QuizResponse<T> {
    success: boolean
    data?: T
    message?: string
    error?: string
    statusCode?: number
}

// ================================
// QUIZ ANALYTICS TYPES
// ================================

export interface QuizAnalytics {
    sessionId: string
    userId?: string
    categoryId: string
    difficulty: string
    startTime: string
    endTime?: string
    questionsViewed: number
    questionsAnswered: number
    timeSpentPerQuestion: number[]
    correctAnswers: number
    incorrectAnswers: number
    hintsUsed: number
    pauseCount: number
    deviceInfo?: {
        platform: string
        browser: string
        screenSize: string
    }
}

export interface QuestionAnalytics {
    questionId: string
    timesAnswered: number
    timesCorrect: number
    averageTimeToAnswer: number
    difficultyRating: number
    popularWrongAnswers: number[]
    skipRate: number
}

export interface User {
    _id: string
    id?: string
    name?: string
    email?: string
    image?: string
    isOnboarded?: boolean
    userName?: string
    occupation?: string
    purpose?: string[]
}

export interface GoogleUserInfo {
    sub: string
    name: string
    email: string
    picture: string
}

export interface AuthContextType {
    user: User | null
    loading: boolean
    signInWithGoogle: () => Promise<void>
    signOut: () => Promise<void>
    updateUser: (updates: Partial<User>) => void
    refreshUserFromBackend: () => Promise<void>
    retryBackendVerification: () => Promise<void>
    checkAuth: () => Promise<void>
}