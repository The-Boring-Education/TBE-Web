/**
 * Prep-Yatra Domain Types
 * 
 * All types related to the Prep-Yatra app including challenges,
 * recruiters, recruitment processes, and prep-yatra specific features
 */

// ================================
// PREP-YATRA USER TYPES
// ================================

export interface PrepYatraUser {
    _id: string
    name: string
    email: string
    userName: string
    goal: string
    targetCompanies: string[]
    preferences: {
        interviewCategories: string[]
        difficultyLevel: string
        reminderFrequency: string
    }
    experienceLevel: string
    linkedInUrl?: string
    githubUrl?: string
    leetCodeUrl?: string
    skills: string[]
    achievements: string[]
    streak: number
    totalPrepTime: number
    isOnboarded: boolean
    createdAt: string
    updatedAt: string
}

// ================================
// CHALLENGE TYPES
// ================================

export type ChallengeStatus = 'active' | 'completed' | 'paused' | 'cancelled'

export interface Challenge {
    _id: string
    user: string
    name: string
    description?: string
    totalDays: number
    currentDay: number
    startDate: string
    endDate: string
    isActive: boolean
    category?: string
    predefinedType?: string
    createdAt: string
    updatedAt: string
    __v: number
}

export interface ChallengeLog {
    _id: string
    challenge: string
    day: number
    progressText: string
    hoursSpent: number
    nextGoals: string[]
    loggedAt: string
    createdAt: string
    updatedAt: string
    __v: number
}

export interface CreateChallengeRequest {
    name: string
    description?: string
    totalDays: number
    category?: string
    predefinedType?: string
}

export interface UpdateChallengeRequest {
    challengeId: string
    name?: string
    description?: string
    totalDays?: number
    category?: string
    isActive?: boolean
}

export interface CreateChallengeLogRequest {
    challengeId: string
    day: number
    progressText: string
    hoursSpent: number
    nextGoals: string[]
    copyToPrepLogs?: boolean
}

export interface ChallengeProgress {
    challengeId: string
    totalDays: number
    completedDays: number
    currentDay: number
    progressPercentage: number
    totalHours: number
    currentStreak: number
    maxStreak: number
    startDate: string
    endDate: string
    isActive: boolean
}

export interface ChallengesResponse {
    success: boolean
    message: string
    data: Challenge[]
}

export interface ChallengeLogsResponse {
    success: boolean
    message: string
    data: ChallengeLog[]
}

export interface SingleChallengeResponse {
    success: boolean
    message: string
    data: Challenge
}

// ================================
// SOCIAL MEDIA TYPES
// ================================

export interface SocialMediaTemplate {
    challengeName: string
    currentDay: number
    progressText: string
    nextGoals: string[]
    appUrl: string
}

export interface SocialMediaShareData {
    title: string
    text: string
    url: string
    hashtags?: string[]
}

export interface PrepYatraShareData {
    challengeName?: string
    currentDay?: number
    progressText?: string
    nextGoals?: string[]
    totalTime?: number
    streak?: number
}

// ================================
// RECRUITER TYPES
// ================================

export interface RecruiterContact {
    _id: string
    user: string
    name: string
    company: string
    position: string
    email?: string
    linkedIn?: string
    notes?: string
    connectionStatus: 'not_contacted' | 'contacted' | 'responded' | 'interview_scheduled' | 'rejected'
    lastContactDate?: string
    nextFollowUpDate?: string
    createdAt: string
    updatedAt: string
    __v: number
}

export interface CreateRecruiterRequest {
    name: string
    company: string
    position: string
    email?: string
    linkedIn?: string
    notes?: string
}

export interface UpdateRecruiterRequest {
    recruiterId: string
    name?: string
    company?: string
    position?: string
    email?: string
    linkedIn?: string
    notes?: string
    connectionStatus?: 'not_contacted' | 'contacted' | 'responded' | 'interview_scheduled' | 'rejected'
    nextFollowUpDate?: string
}

// ================================
// RECRUITMENT PROCESS TYPES
// ================================

export type InterviewStatus = 
    | 'scheduled'
    | 'completed'
    | 'cancelled'
    | 'rescheduled'
    | 'pending_feedback'
    | 'passed'
    | 'failed'

export interface InterviewProcess {
    _id: string
    user: string
    company: string
    position: string
    recruiterContact?: string
    stages: InterviewStage[]
    currentStage: number
    overallStatus: 'active' | 'completed' | 'rejected' | 'offer_received'
    applicationDate: string
    lastUpdateDate: string
    notes?: string
    createdAt: string
    updatedAt: string
}

export interface InterviewStage {
    id: string
    name: string
    type: 'screening' | 'technical' | 'behavioral' | 'system_design' | 'final'
    status: InterviewStatus
    scheduledDate?: string
    completedDate?: string
    interviewers: string[]
    feedback?: string
    notes?: string
    duration?: number
    location?: string
    meetingLink?: string
}

export interface CreateInterviewProcessRequest {
    company: string
    position: string
    recruiterContact?: string
    applicationDate: string
    initialStages?: Partial<InterviewStage>[]
    notes?: string
}

export interface UpdateInterviewStageRequest {
    processId: string
    stageId: string
    status?: InterviewStatus
    scheduledDate?: string
    completedDate?: string
    feedback?: string
    notes?: string
    duration?: number
    location?: string
    meetingLink?: string
}

// ================================
// PREP LOG TYPES
// ================================

export interface PrepLog {
    _id: string
    user: string
    title: string
    description?: string
    timeSpent: number
    mentorFeedback?: string
    createdAt: string
    updatedAt: string
    __v: number
}

export interface CreatePrepLogRequest {
    title: string
    description?: string
    timeSpent: number
}

export interface UpdatePrepLogRequest {
    logId: string
    title?: string
    description?: string
    timeSpent?: number
    mentorFeedback?: string
}

export interface PrepLogsResponse {
    status: boolean
    data: PrepLog[]
}

// ================================
// PREP-YATRA STATISTICS
// ================================

export interface PrepYatraStats {
    totalChallenges: number
    activeChallenges: number
    completedChallenges: number
    totalPrepTime: number
    currentStreak: number
    maxStreak: number
    totalPrepLogs: number
    averageSessionTime: number
    recruiterContacts: number
    activeInterviewProcesses: number
    completedInterviews: number
    successRate: number
}

// ================================
// ONBOARDING SPECIFIC TO PREP-YATRA
// ================================

export interface PrepYatraOnboardingData {
    name: string
    username: string
    goal: string
    targetCompanies: string[]
    preferredCategories: string[]
    experienceLevel: string
    linkedInUrl?: string
    githubUrl?: string
    leetCodeUrl?: string
    skills?: string[]
}