import type { ProjectDocumentModel } from "./database"

export interface APIResponse<T = any> {
    success: boolean
    status?: boolean
    data?: T
    message?: string
    error?: string
    statusCode?: number
}

export type APIMethodTypes = "GET" | "POST" | "PATCH" | "PUT"

export type DatabaseQueryResponseType = {
    data?: any
    error?: any
    details?: any
}

export interface APIResponseType {
    success?: boolean
    status?: number | boolean
    error?: any
    message?: string
    data?: any
}

export type UserRoleType =
    | "TECH_STUDENT"
    | "WORKING_PROFESSIONAL"
    | "NON_TECH_STUDENT"
    | "DEVREL_ADVOCATE"
    | "DEVREL_LEAD"

export type SkillsType =
    | "HTML"
    | "CSS"
    | "JavaScript"
    | "React"
    | "TypeScript"
    | "NodeJS"
    | "ExpressJS"
    | "MongoDB"
    | "TailwindCSS"
    | "NextJS"

export type RoadmapsType = "Frontend" | "Backend" | "Fullstack" | "Tech"

export type QuestionFrequencyType =
    | "Most Asked"
    | "Asked Frequently"
    | "Asked Sometimes"

export type PlatformUsageType =
    | "LEARNING_TECH"
    | "BUILDING_PROJECTS"
    | "INTERVIEW_PREP"
    | "JOB_SEARCH"

export type DifficultyType = "Beginner" | "Intermediate" | "Advanced"

export type CompanyType = "Startup" | "MidSize" | "MNC" | "FAANG"
export type PriorityType = "High" | "Medium" | "Low"
export type GoalType = "3Months" | "6Months" | "1Year"
export type SubscriptionStatus = "Active" | "Expired" | "Trial" | "Cancelled"
export type SubscriptionType = "3Months" | "5Months" | "Lifetime"
export type InterviewCategoryType =
    | "MNC"
    | "MERN"
    | "CollegePlacement"
    | "DSA"
    | "SystemDesign"
    | "GeneralTech"
export type SubscriptionFeature =
    | "InterviewQuestions"
    | "SystemDesignResources"
    | "DSAResources"
    | "ResumeWorkshop"
    | "JobApplicationWorkshop"
    | "ColdEmailAutomation"
    | "LinkedInAutomation"

export type UserPointsActionType =
    | "ENROLL_COURSE"
    | "ENROLL_SHEET"
    | "ENROLL_PROJECT"
    | "COMPLETE_COURSE_CHAPTER"
    | "COMPLETE_PROJECT_CHAPTER"
    | "COMPLETE_QUESTION"
    | "COMPLETE_COURSE_CERTIFICATE"
    | "COMPLETE_PROJECT"
    | "COMPLETE_INTERVIEW_SHEET"
    | "PROFILE_COMPLETION"
    | "SOCIAL_SHARE"
    | "FEEDBACK_SUBMIT"
    | "VIDEO_WATCH_COMPLETE"
    | "FIRST_LOGIN"
    | "DAILY_VISIT"
    | "STREAK"
    | "REFER"
    | "WEBINAR_ATTEND"
    | "DOWNLOAD_CERTIFICATE"
    | "HELP_COMMUNITY"
    | "RECRUITER_ADDED"
    | "PREPLOG_CREATED"
    | "PREPLOG_STREAK_3"
    | "PREPLOG_STREAK_7"
    | "PREPLOG_STREAK_15"
    | "PREPLOG_STREAK_30"
    | "COMPLETE_QUIZ"
    | "QUIZ_PERFECT_SCORE"
    | "QUIZ_STREAK"

export type WorkDomainType =
    | "MERN Full-stack"
    | "Java Full-stack"
    | "Python Full-stack"
    | "Data Analysis"
    | "Machine Learning"
    | "AI"
    | "App Development"
    | "Others"

export type CertificateType = "WEBINAR" | "SHIKSHA"

export type ApplicationStatusType =
    | "Applied"
    | "Interview"
    | "Rejected"
    | "Offer"
    | "Joined"

export type FeedbackType =
    | "GENERAL"
    | "SHIKSHA_CHAPTER"
    | "SHIKSHA_COURSE"
    | "INTERVIEW_SHEET"
    | "CERTIFICATE"

export type ProductType =
    | "COURSE"
    | "PROJECT"
    | "SHEET"
    | "WEBINAR"
    | "SUBSCRIPTION"

export type InterestEventType =
    | "SUBSCRIPTION_INTEREST"
    | "FEATURE_REQUEST"
    | "BETA_ACCESS"

export type LeaderboardEnum = "DAILY" | "WEEKLY" | "MONTHLY"

export type NotificationType =
    | "WEBINAR"
    | "SHIKSHA"
    | "PROJECT"
    | "INTERVIEW PREP"
    | "UPDATE"
    | "COHORT"
    | "PREP YATRA"
    | "TECH YATRA"
    | "DSA YATRA"
    | "RESUME YATRA"
    | "TOOLS"

export interface PrepYatraOnboardingPayload {
    userId: string
    name: string
    username: string
    experienceLevel: string
    workDomain: WorkDomainType
    linkedInUrl?: string
    githubUrl?: string
    leetCodeUrl?: string
    goal: GoalType
    targetCompanies: CompanyType[]
    preferredCategories: InterviewCategoryType[]
}

export interface UpdateCompanyTypePayload {
    questionIds: string[]
    companyTypes: CompanyType[]
}

export interface CreateSubscriptionPayload {
    userId: string
    type: SubscriptionType
    amount: number
    duration: number
}

export type LeaderboardType = "DAILY" | "WEEKLY" | "MONTHLY"

export type ProjectPickedPageProps = Pick<
    ProjectDocumentModel,
    | "_id"
    | "name"
    | "meta"
    | "roadmap"
    | "difficultyLevel"
    | "sections"
    | "requiredSkills"
> & {
    isEnrolled?: boolean
    _id: string
}
