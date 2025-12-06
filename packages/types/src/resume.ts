/**
 * Resume Types
 * Types for resume parsing and evaluation feature
 */

// ============================================================================
// FRONTEND TYPES - For UI Display
// ============================================================================

/**
 * Parsed resume data from PDF/DOCX extraction
 * Only skills are extracted from resume, domains and experience are UI selections
 */
export interface ParsedResumeData {
  skills: string[]
}

/**
 * Complete evaluation request payload
 * Combines extracted skills + user UI selections
 */
export interface ResumeEvaluationRequest {
  resumeSkills: string[]
  domains: string[]
  experienceLevel: string
}

/**
 * Experience level options for UI dropdown
 */
export type ExperienceLevelType =
  | "Fresher (0 yrs)"
  | "Early Career (1-2 yrs)"
  | "Mid-Level (2-4 yrs)"
  | "Senior (4-7 yrs)"
  | "Staff Engineer (7-10 yrs)"
  | "Principal Engineer (10+ yrs)"

// ============================================================================
// BACKEND RESPONSE TYPES - From Unskilled API
// ============================================================================

/**
 * Skill data with job market statistics
 */
export interface SkillData {
  skill: string
  percentage: number
  jobCount: number
}

/**
 * Company type distribution data
 */
export interface CompanyTypeData {
  type: string
  percentage: number
  jobCount: number
}

/**
 * Main evaluation response data
 * Contains all information needed for frontend UI display
 */
export interface ResumeEvaluationData {
  resumeScore: number
  skillsMatched: number
  skillsMissing: number
  remoteJobs: number
  jobsAnalyzed: number
  matchingSkills: SkillData[]
  missingSkills: SkillData[]
  companyTypeDistribution: CompanyTypeData[]
}

/**
 * Complete API response structure from Unskilled backend
 */
export interface ResumeEvaluationResponse {
  status: boolean
  message: string
  data: ResumeEvaluationData
}

// ============================================================================
// PARSING TYPES
// ============================================================================

/**
 * Response from Next.js parse API route
 */
export interface ParseResumeResponse {
  status: boolean
  message: string
  data?: ParsedResumeData
  error?: string
}

/**
 * File upload state for hook
 */
export interface ResumeFileState {
  file: File | null
  extractedSkills: string[]
  isLoading: boolean
  error: string | null
}
