/**
 * Common Types - Shared across ALL TBE apps
 * 
 * This file contains types that are used by multiple apps
 * including API responses, base user types, and shared utilities
 */

// ================================
// BASE USER & AUTHENTICATION TYPES
// ================================

export interface BaseUser {
    _id: string
    id?: string
    name?: string
    email?: string
    image?: string
    provider?: string
    providerAccountId?: string
    createdAt?: string
    updatedAt?: string
    contactNo?: string
    isOnboarded?: boolean
    occupation?: string
    purpose?: string[]
    userName?: string
    prepYatra?: any
}

export interface User {
    id: string
    email: string
    name: string
    picture?: string
    provider: string
    providerAccountId: string
}

export interface GoogleUser {
    sub: string
    email: string
    name: string
    picture?: string
}

export interface AuthContextType {
    user: User | null
    loading: boolean
    signIn: (googleUser: GoogleUser) => Promise<void>
    signOut: () => Promise<void>
    checkAuth: () => Promise<void>
}

// ================================
// API RESPONSE TYPES
// ================================

export interface APIResponse<T = any> {
    success: boolean
    status?: boolean
    data?: T
    message?: string
    error?: string
    statusCode?: number
}

export interface APIResponseType<T = any> {
    success: boolean
    data?: T
    error?: string
    message?: string
    statusCode?: number
}

export interface APIMakeRequestProps {
    url: string
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
    data?: any
    headers?: Record<string, string>
    timeout?: number
}

export interface PaginatedResponse<T> {
    data: T[]
    pagination: {
        page: number
        limit: number
        total: number
        totalPages: number
        hasNext: boolean
        hasPrev: boolean
    }
}

// ================================
// ANALYTICS & TRACKING TYPES
// ================================

export interface TrackEventProps {
    action: string
    category?: string
    label?: string
    // Accept numeric values for GA-style events and
    // structured payloads for custom analytics pipelines
    value?: number | Record<string, any>
    [key: string]: any
}

export interface AnalyticsEvent {
    event: string
    properties?: Record<string, any>
    userId?: string
    timestamp?: string
}

// ================================
// GAMIFICATION TYPES
// ================================

export interface GamificationAction {
    action: string
    points: number
    category: string
    description?: string
}

export interface UserPoints {
    userId: string
    totalPoints: number
    level: number
    achievements: string[]
    streak: number
}

export interface Achievement {
    id: string
    name: string
    description: string
    icon: string
    points: number
    condition: string
    unlocked: boolean
    unlockedAt?: string
}

// ================================
// QUIZ API TYPES
// ================================

export interface QuizAttempt {
    id: string
    userId: string
    quizId: string
    score: number
    totalQuestions: number
    correctAnswers: number
    timeTaken: number
    completedAt: string
    answers: QuizAnswer[]
}

export interface QuizAnswer {
    questionId: string
    selectedOption: number
    isCorrect: boolean
    timeTaken: number
}

export interface QuizCategory {
    id: string
    name: string
    description: string
    icon: string
    color: string
    questionsCount: number
    difficulty: 'easy' | 'medium' | 'hard'
    estimatedTime: number
}

export interface QuizCategoryAPI {
    _id: string
    name: string
    description: string
    icon: string
    color: string
    questions: any[]
    createdAt: string
    updatedAt: string
    __v: number
}

export interface LeaderboardEntry {
    userId: string
    userName: string
    userImage?: string
    totalScore: number
    totalQuizzes: number
    averageScore: number
    rank: number
}

export interface QuizStats {
    totalQuizzesTaken: number
    averageScore: number
    totalTimePlayed: number
    favoriteCategory: string
    streak: number
    rank: number
    improvementTrend: 'up' | 'down' | 'stable'
}

// ================================
// ERROR HANDLING TYPES
// ================================

export interface APIError {
    message: string
    statusCode: number
    code?: string
    details?: any
}

export interface ValidationError {
    field: string
    message: string
    code: string
}

// ================================
// FORM & UI TYPES
// ================================

export interface SelectOption {
    value: string | number
    label: string
    disabled?: boolean
}

export interface FormField {
    name: string
    label: string
    type: 'text' | 'email' | 'password' | 'select' | 'textarea' | 'checkbox' | 'radio'
    required?: boolean
    placeholder?: string
    options?: SelectOption[]
    validation?: {
        pattern?: RegExp
        minLength?: number
        maxLength?: number
        custom?: (value: any) => boolean | string
    }
}

// ================================
// UTILITY TYPES
// ================================

export type LoadingState = 'idle' | 'loading' | 'succeeded' | 'failed'

export type Theme = 'light' | 'dark' | 'system'

export type UserRole = 'user' | 'admin' | 'moderator'

export type ExperienceLevel = 'fresher' | 'junior' | 'mid' | 'senior'

export type SubscriptionTier = 'free' | 'pro' | 'enterprise'

// ================================
// DATE & TIME TYPES
// ================================

export interface DateRange {
    startDate: string
    endDate: string
}

export interface TimeSlot {
    startTime: string
    endTime: string
    timezone?: string
}

// ================================
// NOTIFICATION TYPES
// ================================

export interface Notification {
    id: string
    title: string
    message: string
    type: 'info' | 'success' | 'warning' | 'error'
    read: boolean
    createdAt: string
    actionUrl?: string
}

export interface NotificationPreferences {
    email: boolean
    push: boolean
    sms: boolean
    categories: {
        updates: boolean
        marketing: boolean
        security: boolean
    }
}
