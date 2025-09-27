/**
 * TBE Platform Types - Central Type Definitions
 *
 * Consolidated, well-organized types for the entire TBE platform
 * Provides a single source of truth for all TypeScript definitions
 */

// ================================
// COMMON TYPES (Used across all apps)
// ================================
export type {
    // Re-export all common types except conflicting ones
    BaseUser,
    APIResponse,
    TrackEventProps,
    GamificationAction,
    UserPoints,
    Achievement,
    // Conflicting types with aliases
    APIMakeRequestProps as CommonAPIMakeRequestProps,
    LeaderboardEntry as CommonLeaderboardEntry,
    QuizCategory as CommonQuizCategory
} from "./common"

// ================================
// DOMAIN-SPECIFIC TYPES
// ================================

// Database models and schemas

// Additional database types that are commonly used

// API types and request/response interfaces
export * from "./api"

// Component interfaces and UI types
export * from "./components"

// Additional component types that are commonly used
export type {
    MentorshipCardProps,
    PortfolioTemplateProps,
    PrimaryCardProps,
    PrimaryCardWithCTAProps,
    RadioButtonOptionsProps,
    TestimonialCardProps,
    UserLevel
} from "./components"

// Platform-specific shared types (with explicit exports to avoid conflicts)
export type {
    // Re-export all platform types except conflicting ones
    GetSEOMetaResponseType,
    SEOProps,
    ServerSessionProp,
    LeaderboardType,
    LEADERBOARD_TYPES,
    ProductDataProps,
    CohortDataProps,
    CohortRoadmapProps,
    CohortUserCategoryProps,
    TopNavbarContainerProps,
    // Email types from platform (these conflict with email module)
    EmailSendRequest as PlatformEmailSendRequest,
    EmailSendResponse as PlatformEmailSendResponse,
    EmailTemplate as PlatformEmailTemplate
} from "./platform"

// Email and communication types
export * from "./email"

// Onboarding (used across all apps)
export * from "./onboarding"

// Prep-Yatra domain
export * from "./prepyatra"

// Quiz domain
export * from "./quiz"

// ================================
// LEGACY EXPORTS (for backward compatibility)
// ================================
// Re-export common types with their original names
export type {
    BaseUser as User,
    APIResponse as CommonAPIResponseType
} from "./common"

// Re-export database types with their original names for compatibility
// Note: Do NOT alias UserModel as PlatformUser to avoid conflict with platform PlatformUser

// Re-export API types with their original names for compatibility
export type {
    APIMakeRequestProps as APIMakeRquestProps,
    APIResponseProps as APIResponseType
} from "./api"

// ================================
// TYPE UTILITIES
// ================================

// Utility types for better development experience
export type Prettify<T> = {
    [K in keyof T]: T[K]
} & {}

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>

export type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

export type NonEmptyArray<T> = [T, ...T[]]

export type ValueOf<T> = T[keyof T]

// ================================
// GLOBAL TYPE AUGMENTATIONS
// ================================

// Note: Global Window interface extensions are handled in individual modules
// to avoid conflicts with existing declarations

// ================================
// EXPORT SUMMARY
// ================================
/*
 * This index file exports types from:
 *
 * 📄 common.ts (304 lines)
 *    - Base user & auth types
 *    - API response types
 *    - Analytics & tracking types
 *    - Gamification types
 *    - Error handling types
 *    - Form & UI types
 *    - Utility types
 *
 * 📄 database.ts (600+ lines)
 *    - Database models and schemas
 *    - User, Project, Course models
 *    - MongoDB document interfaces
 *    - Gamification & feedback models
 *    - Prep Yatra specific models
 *
 * 📄 api.ts (400+ lines)
 *    - API request/response types
 *    - CRUD operation payloads
 *    - Authentication & authorization
 *    - Payment & subscription APIs
 *    - External service integrations
 *
 * 📄 components.ts (800+ lines)
 *    - React component interfaces
 *    - UI component props
 *    - Form & input types
 *    - Layout & navigation types
 *    - Modal & overlay interfaces
 *
 * 📄 platform.ts (400+ lines)
 *    - Platform-specific types
 *    - SEO & meta types
 *    - Analytics & tracking
 *    - GitHub integrations
 *    - Email & communication
 *
 * 📄 onboarding.ts (180+ lines)
 *    - Onboarding field configurations
 *    - Product configurations
 *    - State management types
 *    - Flow & progress types
 *    - Analytics types
 *
 * 📄 prepyatra.ts (300+ lines)
 *    - Challenge management types
 *    - Recruiter & recruitment types
 *    - Prep log types
 *    - Social media types
 *    - Statistics types
 *
 * 📄 quiz.ts (400+ lines)
 *    - Quiz question & session types
 *    - Result & performance types
 *    - Leaderboard types
 *    - Configuration types
 *    - Analytics types
 *
 * TOTAL: 3400+ well-organized, documented types
 */
