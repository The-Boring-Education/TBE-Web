import type { Document, Schema, Types } from "mongoose"

import type {
    APIMethodTypes,
    ApplicationStatusType,
    CertificateType,
    CompanyType,
    DifficultyType,
    DSADifficultyType,
    DSADomainType,
    DSATopicType,
    FeedbackType,
    GoalType,
    InterestEventType,
    InterviewCategoryType,
    LeaderboardEnum,
    NotificationType,
    PlatformUsageType,
    PriorityType,
    ProductType,
    QuestionFrequencyType,
    RoadmapsType,
    SkillsType,
    SubscriptionFeature,
    SubscriptionStatus,
    SubscriptionType,
    UserPointsActionType,
    UserRoleType,
    WorkDomainType
} from "./api"

export interface UserModel {
    name: string
    userName?: string
    email: string
    image?: string
    provider: string
    providerAccountId?: string
    occupation?: UserRoleType
    purpose?: PlatformUsageType[]
    contactNo?: string
    isOnboarded?: boolean
    linkedInUrl?: string
    githubUrl?: string
    leetCodeUrl?: string
    userSkills?: string[]
    userSkillsLastUpdated?: Date
    from?: string
    prepYatra?: {
        pyOnboarded?: boolean
        experienceLevel?: string
        workDomain?: WorkDomainType
        goal?: GoalType
        targetCompanies?: CompanyType[]
        preferences: {
            interviewCategories?: InterviewCategoryType[]
            focusAreas?: string[]
        }
        prepLog?: {
            currentStreak?: number
            longestStreak?: number
            lastLoggedDate?: Date
            totalLogs?: number
        }
    }
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

export interface ProjectChapter {
    isCompleted?: boolean
    chapterId: string
    chapterName: string
    content: string
    isOptional?: boolean
    toObject: any
}

export interface ProjectSection {
    sectionId: string
    sectionName: string
    chapters: ProjectChapter[]
    toObject: any
}

export interface ProjectDocumentModel extends Document {
    name: string
    meta: string
    slug: string
    description: string
    coverImageURL: string
    sections: ProjectSection[]
    requiredSkills: SkillsType[]
    roadmap: RoadmapsType
    difficultyLevel: DifficultyType
    isActive: boolean
}

export interface UserProjectModel extends Document {
    userId: typeof Schema.Types.ObjectId
    projectId: typeof Schema.Types.ObjectId
    sections: UserProjectSectionModel[]
}

export interface UserProjectSectionModel {
    sectionId: string
    chapters: UserProjectChapterModel[]
}

export interface UserProjectChapterModel {
    chapterId: string
    isCompleted?: boolean
}

export interface CourseModel extends Document {
    name: string
    meta: string
    slug: string
    description: string
    isPremium: boolean
    price: number
    coverImageURL: string
    liveOn: Date
    chapters: CourseChapterModel[]
    roadmap: RoadmapsType
    difficultyLevel: DifficultyType
    features: string[]
}

export interface CourseChapterModel {
    _id: typeof Schema.Types.ObjectId
    name: string
    content: string
    isOptional?: boolean
    toObject: () => UserCourseModel
}

export interface UserCourseModel {
    userId: typeof Schema.Types.ObjectId
    courseId: typeof Schema.Types.ObjectId
    course: CourseModel
    chapters: UserCourseChapterModel[]
    isCompleted: boolean
    certificateId: string
}

export interface UserCourseChapterModel {
    chapterId: string
    isCompleted?: boolean
}

export interface InterviewSheetModel extends Document {
    name: string
    meta: string
    slug: string
    description: string
    coverImageURL: string
    liveOn: Date
    isPremium: boolean
    price: number
    discountPercentage: number
    appliedCoupon?: typeof Schema.Types.ObjectId
    questions?: InterviewSheetQuestionModel[]
    dsaQuestions?: DSAQuestionModel[]
    roadmap: RoadmapsType
    features: string[]
}

export interface QuestionResourcesModel {
    youtubeURL?: string
    leetcodeURL?: string
    blogURL?: string
}

export interface InterviewSheetQuestionModel {
    _id: typeof Schema.Types.ObjectId
    title: string
    question: string
    answer: string
    frequency: QuestionFrequencyType
    companyTypes?: CompanyType[]
    priority: PriorityType
    toObject: () => UserCourseModel
    resources?: QuestionResourcesModel
}

export interface UserSheetModel extends Document {
    userId: typeof Schema.Types.ObjectId
    sheetId: typeof Schema.Types.ObjectId
    sheet: InterviewSheetModel
    questions: UserSheetQuestionModel[]
}

export interface UserSheetQuestionModel {
    questionId: typeof Schema.Types.ObjectId
    isCompleted?: boolean
    isStarred?: boolean
}

export interface DSAQuestionModel extends Document {
    _id: typeof Schema.Types.ObjectId
    title: string
    answer: string
    resources: QuestionResourcesModel
    domain: DSADomainType[]
    difficulty: DSADifficultyType
    companyTypes: CompanyType[]
    topics: DSATopicType[]
    order?: number
    createdAt: Date
    updatedAt: Date
}

export interface DSASheetModel extends Document {
    _id: typeof Schema.Types.ObjectId
    name: string
    meta?: string
    slug: string
    coverImageURL: string
    description: string
    liveOn: Date
    isPremium: boolean
    price: number
    discountPercentage: number
    appliedCoupon?: typeof Schema.Types.ObjectId
    questions: typeof Schema.Types.ObjectId[]
    targetDomains: DSADomainType[]
    targetDifficulties: DSADifficultyType[]
    targetCompanyTypes: CompanyType[]
    targetTopics: DSATopicType[]
    features: string[]
    isActive: boolean
    createdAt: Date
    updatedAt: Date
}

export interface UserDSASheetQuestionModel {
    questionId: typeof Schema.Types.ObjectId
    isCompleted: boolean
    isStarred: boolean
    notes?: string
    completedAt?: Date
}

export interface UserDSASheetModel extends Document {
    _id: typeof Schema.Types.ObjectId
    userId: typeof Schema.Types.ObjectId
    sheetId: typeof Schema.Types.ObjectId
    sheet?: DSASheetModel
    questions: UserDSASheetQuestionModel[]
    lastAccessedAt: Date
    createdAt: Date
    updatedAt: Date
}

export interface CouponModel extends Document {
    code: string
    discountPercentage: number
    description: string
    isActive: boolean
    expiryDate: Date
    maxUsage?: number
    currentUsage: number
    applicableProducts: string[]
    minimumAmount: number
    createdBy: typeof Schema.Types.ObjectId
    isExpired: boolean
    isUsageLimitReached: boolean
    isValid: boolean
}

export interface PaymentModel extends Document {
    _id: Types.ObjectId
    user: Types.ObjectId
    amount: number
    productId: string
    productType: ProductType
    orderId: string
    paymentId?: string
    paymentLink: string
    isPaid: boolean
    subscriptionType?: SubscriptionType
    subscriptionDuration?: number
    expiresAt?: Date
    appliedCoupon?: typeof Schema.Types.ObjectId
    couponCode?: string
}

export interface WebhookEvent {
    order_id: string
    payment_id?: string
    isPaid: boolean
    payment_status: "SUCCESS" | "FAILED"
}

export interface Video {
    title: string
    videoId: string
    thumbnail: string
}

export interface PlaylistModel {
    playlistId: string
    playlistName: string
    description: string
    referrerBy?: number
    thumbnail: string
    tags?: string[]
    videos: Video[]
}

export interface UserPlaylistModel {
    _id: typeof Schema.Types.ObjectId
    userId: typeof Schema.Types.ObjectId
    playlistId: typeof Schema.Types.ObjectId
    playlist: PlaylistModel
    isPublic: boolean
    learningTime: number
    isRecommended?: boolean
}

export interface WebinarModel {
    _id: typeof Schema.Types.ObjectId
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
    whatYoullLearn: string[]
    enrolledUsersList: WebinarEnrolledUsersProps[]
    recordedVideoUrl: string
    coverImageURL: string
    toObject: () => WebinarModel
}

export interface CertificateModel extends Document {
    _id: typeof Schema.Types.ObjectId
    type: CertificateType
    userName: string
    userId: string
    date: string
    programName: string
    programId: typeof Schema.Types.ObjectId
}

export interface NotificationModel extends Document {
    type: string
    text: string
    isHTML: boolean
    link?: string
    isExternalLink: boolean
}

export interface CompanyDetails {
    id: string
    name: string
    email?: string
    location?: string
    linkedIn?: string
    website?: string
    description: string
    logo: string
    emp_count?: number
    company_founded?: number
}

export interface JobModel extends Document {
    job_id: string
    job_title: string
    job_description: string
    company: CompanyDetails
    skills: string[]
    role: string[]
    location: string
    experience?: {
        min?: number
        max?: number
    }
    jobUrl: string
    salary?: {
        min?: number
        max?: number
    }
    isInternship?: boolean
    platform: string
    postedAt: Date
}

export interface UnskilledLandingGraphDataProps {
    name: string
    count: number
}

export interface JobAggregateModel extends Document {
    trendingSkills: UnskilledLandingGraphDataProps[]
    topLocations: UnskilledLandingGraphDataProps[]
    jobDomains: UnskilledLandingGraphDataProps[]
    companyTypes: UnskilledLandingGraphDataProps[]
}

export interface UserPointsAction {
    actionType: UserPointsActionType
    pointsEarned: number
    createdAt?: Date
    updatedAt?: Date
}

export interface GamificationModel {
    userId: Schema.Types.ObjectId
    points: number
    actions: UserPointsAction[]
}

export interface LeaderboardModel extends Document {
    type: LeaderboardEnum
    date: Date
    entries: {
        userId: Types.ObjectId
        points: number
    }[]
}

export interface FeedbackModel extends Document {
    _id: typeof Schema.Types.ObjectId
    rating: number
    feedback?: string
    type: FeedbackType
    ref?: typeof Schema.Types.ObjectId
    user: typeof Schema.Types.ObjectId
    createdAt: Date
    updatedAt: Date
}

export interface PrepYatraUserModel extends Document {
    _id: Types.ObjectId
    userId: string
    goal: GoalType
    targetCompanies: CompanyType[]
    subscriptionStatus: SubscriptionStatus
    subscriptionExpiry?: Date
    preferences: {
        interviewCategories: InterviewCategoryType[]
        focusAreas: string[]
    }
}

export interface PrepYatraSubscriptionModel extends Document {
    _id: Types.ObjectId
    userId: Types.ObjectId
    type: SubscriptionType
    amount: number
    duration: number
    startDate: Date
    expiryDate: Date
    isActive: boolean
    features: SubscriptionFeature[]
}

export interface RecruiterModel extends Document {
    user: Types.ObjectId
    recruiterName: string
    email?: string
    phone?: string
    company?: string
    appliedPosition?: string
    applicationStatus?: ApplicationStatusType
    lastContacted?: string
    follow_up_date?: string
    last_interview_date?: string
    link?: string
    comments?: string
}

export interface PrepLogModel extends Document {
    user: Types.ObjectId
    title: string
    timeSpent: number
    description?: string
    mentorFeedback?: string
}

export interface ChallengeModel extends Document {
    user: Types.ObjectId
    name: string
    description?: string
    totalDays: number
    currentDay: number
    status: "active" | "completed" | "paused" | "cancelled"
    startDate: Date
    endDate: Date
    isPredefined: boolean
    predefinedType?: "21DaysPython" | "21DaysJava" | "50DaysInternship"
    gamificationPoints: number
}

export interface ChallengeLogModel extends Document {
    challenge: Types.ObjectId
    user: Types.ObjectId
    day: number
    progressText: string
    hoursSpent: number
    date: Date
    copiedToPrepLogs: boolean
    prepLogId?: Types.ObjectId
    gamificationPoints: number
}

export interface UserInterestModel {
    userId: Types.ObjectId
    eventType: InterestEventType
    eventDescription?: string
    metadata?: Record<string, any>
    isActive: boolean
    source: "WEBAPP" | "PREPYATRA" | "ADMIN" | "API"
    ipAddress?: string
    userAgent?: string
}

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
    meta: string
    slug: string
    description: string
    coverImageURL: string
    liveOn: string
    isPremium?: boolean
    price?: number
    discountPercentage?: number
    appliedCoupon?: typeof Schema.Types.ObjectId
    questions: InterviewSheetQuestionModel[]
    roadmap: RoadmapsType
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
    eventType: import("@/lib/constants").InterestEventType
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
