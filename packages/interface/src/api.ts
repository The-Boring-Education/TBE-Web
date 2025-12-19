import type {
    CertificateType,
    CompanyDetails,
    CourseChapterModel,
    CourseModel,
    InterviewSheetModel,
    InterviewSheetQuestionModel,
    NotificationType,
    PlatformUsageType,
    PlaylistModel,
    ProjectChapter,
    UserRoleType,
    WorkDomainType
} from "."
import type { InterestEventType } from "@tbe/constants"

export type APIMethodTypes = "GET" | "POST" | "PATCH" | "PUT"

export interface APIMakeRquestProps {
    method?: APIMethodTypes
    url: string
    headers?: { [key: string]: string }
    body?: any
}

export interface ClientAPIResponseProps {
    status: boolean
    data?: any
}

export interface APIResponseProps extends ClientAPIResponseProps {
    message?: string
    error?: any
}

export interface ApiHookResultProps {
    data: any | undefined
    isSuccess: boolean
    loading: boolean
    error: any
    makeRequest: (params: APIMakeRquestProps) => Promise<void>
}

export interface ClientAPIResponse {
    status: boolean
    data?: any
}

export interface APIResponseType extends ClientAPIResponse {
    message?: string
    error?: any
    details?: any
}

export type DatabaseQueryResponseType = {
    data?: any
    error?: any
    details?: any
}

export interface AddProjectRequestPayloadProps {
    name: string
    slug: string
    description: string
    coverImageURL: string
    requiredSkills: SkillsType[]
    roadmap: RoadmapsType
    difficultyLevel: DifficultyType
}

export interface AddSectionRequestPayloadProps {
    toObject: any
    sectionId: string
    sectionName: string
    chapters: ProjectChapter[]
}

export interface AddChapterRequestPayloadProps {
    toObject: any
    chapterId: string
    chapterName: string
    content: string
    isOptional?: boolean
    isCompleted: boolean
}

export interface UpateSectionRequestPayloadProps {
    projectId: string
    sectionId: string
    updatedSectionName: string
}

export interface DeleteSectionRequestPayloadProps {
    projectId: string
    sectionId: string
}

export interface UpdateProjectRequestPayloadProps {
    updatedData: {
        name?: string
        meta?: string
        description?: string
        coverImageURL?: string
        requiredSkills?: SkillsType[]
        roadmap?: RoadmapsType
        difficultyLevel?: DifficultyType
    }
    projectId: string
}

export interface UpdateChapterRequestPayloadProps {
    updatedChapterName: string
    updatedChapterContent: string
    updatedIsOptional: boolean
}

export interface UpdateChapterDBRequestProps
    extends UpdateChapterRequestPayloadProps {
    projectId: string
    sectionId: string
    chapterId: string
}

export interface AddCourseRequestPayloadProps {
    title: string
    description: string
    coverImageURL: string
    liveOn: string
    slug: string
    meta?: string
    roadmap: RoadmapsType
    isPremium?: boolean
    price?: number
    features?: string[]
}

export interface AddInterviewSheetRequestPayloadProps {
    name: string
    topic: string
    description: string
    coverImageURL: string
    liveOn: string
    slug: string
    meta?: string
    roadmap: RoadmapsType
    isPremium?: boolean
    price?: number
    features?: string[]
}

export interface UpdateInterviewSheetRequestPayloadProps {
    sheetId: string
    updatedData: Partial<AddInterviewSheetRequestPayloadProps>
}

export interface AddInterviewQuestionRequestPayloadProps {
    title: string
    question: string
    answer: string
    frequency: QuestionFrequencyType
}

export interface UpdateCourseRequestPayloadProps {
    updatedData: {
        title?: string
        description?: string
        coverImageURL?: string
        meta?: string
        price?: number
        isPremium?: boolean
        features?: string[]
    }
    courseId: string
}

export interface AddChapterToCourseRequestProps {
    name: string
    content: string
}

export interface UpdateChapterInCourseRequestProps {
    name?: string
    content?: string
    isOptional?: boolean
}

export interface EnrollCourseInDBRequestProps {
    userId: string
    courseId: string
}

export interface EnrollProjectInDBRequestProps {
    userId: string
    projectId: string
}

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

export type DifficultyType = "Beginner" | "Intermediate" | "Advanced"

export interface CreateUserRequestPayloadProps {
    name: string
    email: string
    image?: string
    provider: string
    providerAccountId?: string
}
export interface AddOnboardingPayloadProps {
    userId: string
    userName: string
    occupation: UserRoleType
    purpose: PlatformUsageType[]
    contactNo: string
    from?: string
}
export interface AddPrepYatraOnboardingPayloadProps {
    userId: string
    linkedInUrl: string
    workDomain: WorkDomainType
    from?: string
}
export interface CourseEnrollmentRequestProps {
    courseId: string
    userId: string
}

export interface ProjectEnrollmentRequestProps {
    projectId: string
    userId: string
}

export interface UpdateUserChapterInCourseRequestProps {
    userId: string
    courseId: string
    chapterId: string
    isCompleted: boolean
}

export interface UpdateUserChapterInProjectRequestProps {
    userId: string
    projectId: string
    sectionId: string
    chapterId: string
    isCompleted: boolean
}

export interface SheetEnrollmentRequestProps {
    sheetId: string
    userId: string
}

export interface ExtendedCourseChapterModel extends CourseChapterModel {
    isCompleted: boolean // Add `isCompleted` flag
}

export interface ExtendedInterviewSheetQuestionModel
    extends InterviewSheetQuestionModel {
    isCompleted: boolean // Add `isCompleted` flag
    isStarred?: boolean
}

export interface BaseShikshaCourseResponseProps extends Partial<CourseModel> {
    isEnrolled?: boolean
    chapters?: ExtendedCourseChapterModel[]
    isPremium?: boolean
    isCompleted?: boolean
    certificateId?: string
    _id: string
}

export interface BaseInterviewSheetResponseProps
    extends Partial<InterviewSheetModel> {
    _id: string
    isEnrolled?: boolean
    questions?: ExtendedInterviewSheetQuestionModel[]
    isPremium?: boolean
    price?: number
    features?: string[]
}

export interface MarkQuestionCompletedRequestProps {
    userId: string
    sheetId: string
    questionId: string
    isCompleted: boolean
}

export interface GetAllQuestionsRequestProps {
    userId: string
}

export interface UpdateEnrolledUsersRequestPayloadProps
    extends Partial<AddWebinarRequestPayloadProps> {
    users: WebinarEnrolledUsersProps[]
}

export interface AddWebinarRequestPayloadProps {
    slug: string
    name: string
    description: string
    isFree: boolean
    about: string[]
    learnings: string[]
    host: {
        name: string
        imageUrl: string
        role: string
        about: string[]
        linkedInUrl: string
    }
    registrationUrl: string
    dateAndTime: string
    enrolledUsersList: WebinarEnrolledUsersProps[]
}

export interface WebinarEnrolledUsersProps {
    name: string
    email: string
}

export interface AddCertificateRequestPayloadProps {
    type: CertificateType
    userName: string
    userId: string
    date: string
    programName: string
    programId: string
}

export interface AddNotificationRequestPayloadProps {
    type: NotificationType
    text: string
    isHTML?: boolean
    link?: string
    isExternalLink?: boolean
}

export interface UpdateNotificationRequestPayloadProps {
    notificationId: string
    updatedNotification: Partial<AddNotificationRequestPayloadProps>
}

export interface AddJobRequestPayloadProps {
    job_id: string
    job_title: string
    job_description: string
    company: CompanyDetails
    skills: string[]
    role: string[]
    location: string[]
    experience?: {
        min: number
        max: number
    }
    jobUrl: string
    salary?: {
        min: string
        max: string
    }
    isInternship?: boolean
    platform: string
}

export interface UserPlaylistResponseProps extends PlaylistModel {
    _id: string
    userId: string
    isPublic: boolean
    isRecommended: boolean
    learningTime: number
}

export interface AddFeedbackRequestProps {
    rating: number
    type: string
    ref: string
    userId: string
}

export interface UpdateFeedbackRequestProps {
    feedbackId: string
    userId: string
    feedback: string
}

export interface UnSkilledEvaluationRequestBody {
    skills: string[]
    domains: string[]
    experience: {
        min: number
        max: number
    }
}

export interface AddPaymentToDBRequestPayloadProps {
    userId: string
    productId: string
    productType: string
    amount: number
    orderId: string
    paymentLink: string
    appliedCoupon?: string
    couponCode?: string
}

export interface BuildOrderPayloadProps {
    orderId: string
    amount: number
    userId: string
    customerName: string
    customerEmail: string
}

export interface UpdatePaymentStatusPayloadProps {
    orderId: string
    paymentId: string | undefined
    status: "SUCCESS" | "FAILED"
}

// New types for PrepYatra integration
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

// New interfaces for PrepYatra API requests
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

export interface PrepYatraPaymentPayload
    extends AddPaymentToDBRequestPayloadProps {
    subscriptionType: SubscriptionType
    subscriptionDuration: number
    expiresAt: Date
}

export interface AddRecruiterToDBPayloadProps {
    userId: string
    recruiterName: string
    email?: string
    phone?: string
    company?: string
    appliedPosition?: string
    applicationStatus?: string
    lastContacted?: string
    comments?: string
    follow_up_date?: string
    last_interview_date?: string
    link?: string
}

export interface AddPrepLogToDBPayloadProps {
    userId: string
    title: string
    description: string
    timeSpent: number
}

export interface MarkQuestionStarredRequestProps {
    userId: string
    sheetId: string
    questionId: string
    isStarred: boolean
}

// User Interest API Interfaces
export interface CreateUserInterestRequestProps {
    userId: string
    eventType: InterestEventType
    eventDescription?: string
    metadata?: Record<string, any>
    source: "WEBAPP" | "PREPYATRA" | "ADMIN" | "API"
}

export interface GetUserInterestsRequestProps {
    userId?: string
    eventType?: InterestEventType
    source?: "WEBAPP" | "PREPYATRA" | "ADMIN" | "API"
    isActive?: boolean
    page?: number
    limit?: number
}

export interface UserInterestResponseProps {
    _id: string
    userId: string
    eventType: InterestEventType
    eventDescription?: string
    metadata?: Record<string, any>
    isActive: boolean
    source: "WEBAPP" | "PREPYATRA" | "ADMIN" | "API"
    ipAddress?: string
    userAgent?: string
    createdAt: string
    updatedAt: string
}
