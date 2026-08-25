import type { Document, Schema, Types } from "mongoose";

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
  PaymentStatusType,
  PlatformUsageType,
  PriorityType,
  ProductType,
  QuestionFrequencyType,
  RoadmapsType,
  SkillsType,
  SubscriptionFeature,
  SubscriptionStatus,
  SubscriptionType,
  TBEAppType,
  UserPointsActionType,
  UserRoleType,
  WorkDomainType,
} from "./api";

export interface UserModel {
  name: string;
  userName?: string;
  email: string;
  image?: string;
  provider: string;
  providerAccountId?: string;
  occupation?: UserRoleType;
  purpose?: PlatformUsageType[];
  contactNo?: string;
  isOnboarded?: boolean;
  linkedInUrl?: string;
  githubUrl?: string;
  leetCodeUrl?: string;
  codeforcesUrl?: string;
  location?: string;
  headline?: string;
  aboutMe?: string;
  userSkills?: string[];
  userSkillsLastUpdated?: Date;
  from?: string;
  prepYatra?: {
    pyOnboarded?: boolean;
    experienceLevel?: string;
    workDomain?: WorkDomainType;
    goal?: GoalType;
    targetCompanies?: CompanyType[];
    preferences: {
      interviewCategories?: InterviewCategoryType[];
      focusAreas?: string[];
    };
    prepLog?: {
      currentStreak?: number;
      longestStreak?: number;
      lastLoggedDate?: Date;
      totalLogs?: number;
    };
  };
  dsaYatra?: {
    dyOnboarded?: boolean;
    experienceLevel?: string;
    timeline?: string;
    target?: string;
    preferredLanguage?: string;
    targetTopics?: DSATopicType[];
    progress?: {
      completedQuestionIds?: string[];
      todayStats?: {
        date?: string;
        solvedCount?: number;
      };
    };
  };
  oncampus?: {
    onboardingCompleted?: boolean;
    experienceLevel?: string;
    duration?: "1Month" | "3Months" | "6Months" | "1Year";
    offCampus?: boolean;
  };
  techYatra?: {
    tyOnboarded?: boolean;
    focus?: string;
  };
  resumeYatra?: {
    ryOnboarded?: boolean;
    experienceBand?: string;
  };
}

export interface WebinarEnrolledUsersProps {
  name: string;
  email: string;
}

export interface AddCertificateRequestPayloadProps {
  type: CertificateType;
  userName: string;
  userId: string;
  date: string;
  programName: string;
  programId: string;
}

export interface ProjectChapter {
  isCompleted?: boolean;
  chapterId: string;
  chapterName: string;
  content: string;
  isOptional?: boolean;
  toObject: any;
}

export interface ProjectSection {
  sectionId: string;
  sectionName: string;
  chapters: ProjectChapter[];
  toObject: any;
}

export interface ProjectDocumentModel extends Document {
  contentId?: string;
  name: string;
  meta: string;
  slug: string;
  description: string;
  coverImageURL: string;
  sections: ProjectSection[];
  requiredSkills: SkillsType[];
  roadmap: RoadmapsType;
  difficultyLevel: DifficultyType;
  isActive: boolean;
}

export interface UserProjectModel extends Document {
  userId: typeof Schema.Types.ObjectId;
  projectId: typeof Schema.Types.ObjectId;
  sections: UserProjectSectionModel[];
}

export interface UserProjectSectionModel {
  sectionId: string;
  chapters: UserProjectChapterModel[];
}

export interface UserProjectChapterModel {
  chapterId: string;
  isCompleted?: boolean;
}

export interface CourseModel extends Document {
  contentId?: string;
  name: string;
  meta: string;
  slug: string;
  description: string;
  isPremium: boolean;
  price: number;
  coverImageURL: string;
  liveOn: Date;
  chapters: CourseChapterModel[];
  roadmap: RoadmapsType;
  difficultyLevel: DifficultyType;
  features: string[];
}

export interface CourseChapterModel {
  _id: typeof Schema.Types.ObjectId;
  name: string;
  content: string;
  isOptional?: boolean;
  toObject: () => UserCourseModel;
}

export interface UserCourseModel {
  userId: typeof Schema.Types.ObjectId;
  courseId: typeof Schema.Types.ObjectId;
  course: CourseModel;
  chapters: UserCourseChapterModel[];
  isCompleted: boolean;
  certificateId: string;
}

export interface UserCourseChapterModel {
  chapterId: string;
  isCompleted?: boolean;
}

export interface InterviewSheetModel extends Document {
  contentId?: string;
  name: string;
  meta: string;
  slug: string;
  description: string;
  coverImageURL: string;
  liveOn: Date;
  isPremium: boolean;
  price: number;
  discountPercentage: number;
  appliedCoupon?: typeof Schema.Types.ObjectId;
  questions?: InterviewSheetQuestionModel[];
  dsaQuestions?: DSAQuestionModel[];
  roadmap: RoadmapsType;
  features: string[];
}

export interface QuestionResourcesModel {
  youtubeURL?: string;
  leetcodeURL?: string;
  blogURL?: string;
}

export interface InterviewSheetQuestionModel {
  _id: typeof Schema.Types.ObjectId;
  title: string;
  question: string;
  answer: string;
  frequency: QuestionFrequencyType;
  companyTypes?: CompanyType[];
  priority: PriorityType;
  difficulty?: string;
  content?: {
    markdownContent?: string;
  };
  toObject: () => InterviewSheetQuestionModel;
  resources?: QuestionResourcesModel;
}

export interface UserSheetModel extends Document {
  userId: typeof Schema.Types.ObjectId;
  sheetId: typeof Schema.Types.ObjectId;
  sheet: InterviewSheetModel;
  questions: UserSheetQuestionModel[];
}

export interface UserSheetQuestionModel {
  questionId: typeof Schema.Types.ObjectId;
  isCompleted?: boolean;
  isStarred?: boolean;
  notes?: string;
}

export interface UserAptitudeTopicModel extends Document {
  userId: typeof Schema.Types.ObjectId;
  topicSlug: string;
  questions: UserAptitudeTopicQuestionModel[];
}

/** Per-question progress for an aptitude topic (mirrors UserSheet question rows). */
export interface UserAptitudeTopicQuestionModel {
  questionId: typeof Schema.Types.ObjectId;
  isCompleted?: boolean;
}

export interface DSAFirstPrinciples {
  paragraphs: string[];
  key_observation: string;
}

export interface DSAConstraintEntry {
  constraint: string;
  plain_meaning: string;
  implication: string;
}

export interface DSAExampleEntry {
  label: string;
  input: string;
  output: string;
  explanation: string;
  step_by_step: string[] | null;
}

export interface DSAApproachEntry {
  approach_number: number;
  name: string;
  description: string;
  time_complexity: string;
  time_reason: string;
  space_complexity: string;
  space_reason: string;
  verdict: "too_slow" | "acceptable" | "optimal";
  verdict_label: string;
}

export interface DSAHowToApproach {
  steps: {
    step_number: number;
    heading: string;
    body: string;
  }[];
}

export interface DSAPseudoCode {
  code: string;
  annotations: {
    line_reference: string;
    note: string;
  }[];
}

export interface DSAWorkingCode {
  default_language: string;
  languages: Record<string, { code: string }>;
}

export interface DSACommonMistake {
  mistake_number: number;
  title: string;
  wrong_code: string;
  explanation: string;
  fix: string;
}

export interface DSAQuestionSections {
  first_principles?: DSAFirstPrinciples;
  constraints?: DSAConstraintEntry[];
  examples?: DSAExampleEntry[];
  ways_to_solve?: DSAApproachEntry[];
  how_to_approach?: DSAHowToApproach;
  pseudo_code?: DSAPseudoCode;
  working_code?: DSAWorkingCode;
  common_mistakes?: DSACommonMistake[];
}

export interface DSAQuestionModel extends Document {
  _id: typeof Schema.Types.ObjectId;
  contentId?: string;
  title: string;
  answer: string;
  resources: QuestionResourcesModel;
  domain: DSADomainType[];
  difficulty: DSADifficultyType;
  companyTypes: CompanyType[];
  topics: DSATopicType[];
  sections?: DSAQuestionSections;
  order?: number;
  isRealWorldProblem?: boolean;
  visualizerId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DSASheetModel extends Document {
  _id: typeof Schema.Types.ObjectId;
  name: string;
  meta?: string;
  slug: string;
  coverImageURL: string;
  description: string;
  liveOn: Date;
  isPremium: boolean;
  price: number;
  discountPercentage: number;
  appliedCoupon?: typeof Schema.Types.ObjectId;
  questions: (typeof Schema.Types.ObjectId)[];
  targetDomains: DSADomainType[];
  targetDifficulties: DSADifficultyType[];
  targetCompanyTypes: CompanyType[];
  targetTopics: DSATopicType[];
  features: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserDSASheetQuestionModel {
  questionId: typeof Schema.Types.ObjectId;
  isCompleted: boolean;
  isStarred: boolean;
  notes?: string;
  completedAt?: Date;
}

export interface UserDSASheetModel extends Document {
  _id: typeof Schema.Types.ObjectId;
  userId: typeof Schema.Types.ObjectId;
  sheetId: typeof Schema.Types.ObjectId;
  sheet?: DSASheetModel;
  questions: UserDSASheetQuestionModel[];
  lastAccessedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CouponModel extends Document {
  code: string;
  discountPercentage: number;
  description: string;
  isActive: boolean;
  expiryDate: Date;
  maxUsage?: number;
  currentUsage: number;
  applicableProducts: string[];
  minimumAmount: number;
  showOnPricingBanner?: boolean;
  createdBy: typeof Schema.Types.ObjectId;
  isExpired: boolean;
  isUsageLimitReached: boolean;
  isValid: boolean;
}

export interface AdminUserModel extends Document {
  email: string;
  name?: string;
  isActive: boolean;
  notes?: string;
  addedBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PaymentModel extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  amount: number;
  productId: string;
  productType: ProductType;
  orderId: string;
  paymentId?: string;
  paymentLink: string;
  status: PaymentStatusType;
  gateway: string;
  appliedCoupon?: typeof Schema.Types.ObjectId;
  couponCode?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/** One row per (productType, planKey) subscription SKU; amounts are authoritative for checkout. */
export interface SubscriptionPlanModel extends Document {
  /**
   * Stable id for the same plan across envs / migrations (seed JSON or derived).
   * Unique when set; legacy rows may omit until re-seeded.
   */
  planUuid?: string;
  productType: ProductType;
  /** Normalized to lowercase in DB (e.g. lifetime, 3months). */
  planKey: string;
  /** User-facing name (e.g. "Lifetime Access", "3-Month Plan") */
  displayName: string;
  /** Short description for pricing cards */
  description: string;
  /** INR, matches Cashfree order_amount units. */
  amountInr: number;
  /** Original price before discount (for strike-through pricing). 0 = no original price. */
  originalAmountInr: number;
  currency: string;
  /** Access type: ONE_TIME = single purchase, SUBSCRIPTION = duration-based */
  accessType: "ONE_TIME" | "SUBSCRIPTION";
  /** Duration in months (0 = lifetime) */
  durationMonths: number;
  /** Feature list shown on pricing cards */
  features: string[];
  /** Whether this plan is highlighted / recommended */
  isPopular: boolean;
  isActive: boolean;
  /** Sort order for pricing page display */
  sortOrder: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface WebhookEvent {
  order_id: string;
  payment_id?: string;
  payment_status: "SUCCESS" | "FAILED";
}

export interface Video {
  title: string;
  videoId: string;
  thumbnail: string;
}

export interface PlaylistModel {
  playlistId: string;
  playlistName: string;
  description: string;
  referrerBy?: number;
  thumbnail: string;
  tags?: string[];
  videos: Video[];
}

export interface UserPlaylistModel {
  _id: typeof Schema.Types.ObjectId;
  userId: typeof Schema.Types.ObjectId;
  playlistId: typeof Schema.Types.ObjectId;
  playlist: PlaylistModel;
  isPublic: boolean;
  learningTime: number;
  isRecommended?: boolean;
}

export interface WebinarModel {
  _id: typeof Schema.Types.ObjectId;
  slug: string;
  name: string;
  description: string;
  isFree: boolean;
  about: string[];
  learnings: string[];
  host: {
    name: string;
    imageUrl: string;
    role: string;
    about: string[];
    linkedInUrl: string;
  };
  registrationUrl: string;
  dateAndTime: string;
  whatYoullLearn: string[];
  enrolledUsersList: WebinarEnrolledUsersProps[];
  recordedVideoUrl: string;
  coverImageURL: string;
  toObject: () => WebinarModel;
}

export interface CertificateModel extends Document {
  _id: typeof Schema.Types.ObjectId;
  type: CertificateType;
  userName: string;
  userId: string;
  date: string;
  programName: string;
  programId: typeof Schema.Types.ObjectId;
}

export interface NotificationModel extends Document {
  type: string;
  text: string;
  isHTML: boolean;
  link?: string;
  isExternalLink: boolean;
}

export interface CompanyDetails {
  id: string;
  name: string;
  email?: string;
  location?: string;
  linkedIn?: string;
  website?: string;
  description: string;
  logo: string;
  emp_count?: number;
  company_founded?: number;
}

export interface JobModel extends Document {
  job_id: string;
  job_title: string;
  job_description: string;
  company: CompanyDetails;
  skills: string[];
  role: string[];
  location: string;
  experience?: {
    min?: number;
    max?: number;
  };
  jobUrl: string;
  salary?: {
    min?: number;
    max?: number;
  };
  isInternship?: boolean;
  platform: string;
  postedAt: Date;
}

export interface UnskilledLandingGraphDataProps {
  name: string;
  count: number;
}

export interface JobAggregateModel extends Document {
  trendingSkills: UnskilledLandingGraphDataProps[];
  topLocations: UnskilledLandingGraphDataProps[];
  jobDomains: UnskilledLandingGraphDataProps[];
  companyTypes: UnskilledLandingGraphDataProps[];
}

export interface UserPointsAction {
  actionType: UserPointsActionType;
  pointsEarned: number;
  app?: TBEAppType;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface GamificationModel {
  userId: Schema.Types.ObjectId;
  points: number;
  actions: UserPointsAction[];
}

export interface LeaderboardModel extends Document {
  type: LeaderboardEnum;
  app?: TBEAppType;
  date: Date;
  entries: {
    userId: Types.ObjectId;
    points: number;
  }[];
}

export interface UserActivityLogModel extends Document {
  userId: Types.ObjectId;
  app: TBEAppType;
  actionType: UserPointsActionType;
  /** YYYY-MM-DD calendar day of the activity for fast streak lookups */
  date: string;
  metadata?: Record<string, unknown>;
}

export interface FeedbackModel extends Document {
  _id: typeof Schema.Types.ObjectId;
  rating: number;
  feedback?: string;
  type: FeedbackType;
  ref?: typeof Schema.Types.ObjectId;
  user: typeof Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContentFeedbackModel extends Document {
  _id: typeof Schema.Types.ObjectId;
  userId: string;
  contentType: FeedbackType;
  contentId: string;
  rating: number;
  reviewText: string;
  meta?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface PrepYatraUserModel extends Document {
  _id: Types.ObjectId;
  userId: string;
  goal: GoalType;
  targetCompanies: CompanyType[];
  subscriptionStatus: SubscriptionStatus;
  subscriptionExpiry?: Date;
  preferences: {
    interviewCategories: InterviewCategoryType[];
    focusAreas: string[];
  };
}

export interface PrepYatraSubscriptionModel extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  type: SubscriptionType;
  productType?: string;
  amount: number;
  duration: number;
  startDate: Date;
  expiryDate: Date;
  isActive: boolean;
  features: SubscriptionFeature[];
}

export interface RecruiterModel extends Document {
  user: Types.ObjectId;
  recruiterName: string;
  email?: string;
  phone?: string;
  company?: string;
  appliedPosition?: string;
  applicationStatus?: ApplicationStatusType;
  lastContacted?: string;
  follow_up_date?: string;
  last_interview_date?: string;
  link?: string;
  comments?: string;
}

export interface PrepLogModel extends Document {
  user: Types.ObjectId;
  title: string;
  timeSpent: number;
  description?: string;
  mentorFeedback?: string;
}

export interface ChallengeModel extends Document {
  user: Types.ObjectId;
  name: string;
  description?: string;
  totalDays: number;
  currentDay: number;
  status: "active" | "completed" | "paused" | "cancelled";
  startDate: Date;
  endDate: Date;
  isPredefined: boolean;
  predefinedType?: "21DaysPython" | "21DaysJava" | "50DaysInternship";
  gamificationPoints: number;
}

export interface ChallengeLogModel extends Document {
  challenge: Types.ObjectId;
  user: Types.ObjectId;
  day: number;
  progressText: string;
  hoursSpent: number;
  date: Date;
  copiedToPrepLogs: boolean;
  prepLogId?: Types.ObjectId;
  gamificationPoints: number;
}

export interface UserInterestModel {
  userId: Types.ObjectId;
  eventType: InterestEventType;
  eventDescription?: string;
  metadata?: Record<string, any>;
  isActive: boolean;
  source: "WEBAPP" | "PREPYATRA" | "ADMIN" | "API";
  ipAddress?: string;
  userAgent?: string;
}

export interface APIMakeRquestProps {
  method?: APIMethodTypes;
  url: string;
  headers?: { [key: string]: string };
  body?: any;
}

export interface ClientAPIResponseProps {
  status: boolean;
  data?: any;
}

export interface APIResponseProps extends ClientAPIResponseProps {
  message?: string;
  error?: any;
}

export interface ApiHookResultProps {
  data: any | undefined;
  isSuccess: boolean;
  loading: boolean;
  error: any;
  makeRequest: (params: APIMakeRquestProps) => Promise<void>;
}

export interface ClientAPIResponse {
  status: boolean;
  data?: any;
}

export interface AddProjectRequestPayloadProps {
  name: string;
  slug: string;
  description: string;
  coverImageURL: string;
  requiredSkills: SkillsType[];
  roadmap: RoadmapsType;
  difficultyLevel: DifficultyType;
}

export interface AddSectionRequestPayloadProps {
  toObject: any;
  sectionId: string;
  sectionName: string;
  chapters: ProjectChapter[];
}

export interface AddChapterRequestPayloadProps {
  toObject: any;
  chapterId: string;
  chapterName: string;
  content: string;
  isOptional?: boolean;
  isCompleted: boolean;
}

export interface UpateSectionRequestPayloadProps {
  projectId: string;
  sectionId: string;
  updatedSectionName: string;
}

export interface DeleteSectionRequestPayloadProps {
  projectId: string;
  sectionId: string;
}

export interface UpdateProjectRequestPayloadProps {
  updatedData: {
    name?: string;
    meta?: string;
    description?: string;
    coverImageURL?: string;
    requiredSkills?: SkillsType[];
    roadmap?: RoadmapsType;
    difficultyLevel?: DifficultyType;
  };
  projectId: string;
}

export interface UpdateChapterRequestPayloadProps {
  updatedChapterName: string;
  updatedChapterContent: string;
  updatedIsOptional: boolean;
}

export interface UpdateChapterDBRequestProps extends UpdateChapterRequestPayloadProps {
  projectId: string;
  sectionId: string;
  chapterId: string;
}

export interface AddCourseRequestPayloadProps {
  title: string;
  description: string;
  coverImageURL: string;
  liveOn: string;
  slug: string;
  meta?: string;
  roadmap: RoadmapsType;
  isPremium?: boolean;
  price?: number;
  features?: string[];
}

export interface AddInterviewSheetRequestPayloadProps {
  name: string;
  meta: string;
  slug: string;
  description: string;
  coverImageURL: string;
  liveOn: string;
  isPremium?: boolean;
  price?: number;
  discountPercentage?: number;
  appliedCoupon?: typeof Schema.Types.ObjectId;
  questions: InterviewSheetQuestionModel[];
  roadmap: RoadmapsType;
  features?: string[];
}

export interface UpdateInterviewSheetRequestPayloadProps {
  sheetId: string;
  updatedData: Partial<AddInterviewSheetRequestPayloadProps>;
}

export interface AddInterviewQuestionRequestPayloadProps {
  title: string;
  question: string;
  answer: string;
  frequency: QuestionFrequencyType;
  priority?: PriorityType;
  companyTypes?: CompanyType[];
  resources?: QuestionResourcesModel;
}

export interface UpdateCourseRequestPayloadProps {
  updatedData: {
    title?: string;
    description?: string;
    coverImageURL?: string;
    meta?: string;
    price?: number;
    isPremium?: boolean;
    features?: string[];
  };
  courseId: string;
}

export interface AddChapterToCourseRequestProps {
  name: string;
  content: string;
}

export interface UpdateChapterInCourseRequestProps {
  name?: string;
  content?: string;
  isOptional?: boolean;
}

export interface EnrollCourseInDBRequestProps {
  userId: string;
  courseId: string;
}

export interface EnrollProjectInDBRequestProps {
  userId: string;
  projectId: string;
}

export interface CreateUserRequestPayloadProps {
  name: string;
  email: string;
  image?: string;
  provider: string;
  providerAccountId?: string;
}
export interface UpdateDSAQuestionRequestPayloadProps {
  title?: string;
  answer?: string;
  resources?: QuestionResourcesModel;
  domain?: DSADomainType[];
  difficulty?: DSADifficultyType;
  companyTypes?: CompanyType[];
  topics?: DSATopicType[];
  sections?: DSAQuestionSections;
  order?: number;
  isRealWorldProblem?: boolean;
  visualizerId?: string;
}

export interface AddOnboardingPayloadProps {
  userId: string;
  userName: string;
  occupation: UserRoleType;
  purpose: PlatformUsageType[];
  contactNo: string;
  from?: string;
}
export interface AddPrepYatraOnboardingPayloadProps {
  userId: string;
  linkedInUrl: string;
  workDomain: WorkDomainType;
  from?: string;
}
export interface CourseEnrollmentRequestProps {
  courseId: string;
  userId: string;
}

export interface ProjectEnrollmentRequestProps {
  projectId: string;
  userId: string;
}

export interface UpdateUserChapterInCourseRequestProps {
  userId: string;
  courseId: string;
  chapterId: string;
  isCompleted: boolean;
}

export interface UpdateUserChapterInProjectRequestProps {
  userId: string;
  projectId: string;
  sectionId: string;
  chapterId: string;
  isCompleted: boolean;
}

export interface SheetEnrollmentRequestProps {
  sheetId: string;
  userId: string;
}

export interface ExtendedCourseChapterModel extends CourseChapterModel {
  isCompleted: boolean; // Add `isCompleted` flag
}

export interface ExtendedInterviewSheetQuestionModel extends InterviewSheetQuestionModel {
  isCompleted: boolean; // Add `isCompleted` flag
  isStarred?: boolean;
}

export interface BaseShikshaCourseResponseProps extends Partial<CourseModel> {
  isEnrolled?: boolean;
  chapters?: ExtendedCourseChapterModel[];
  isPremium?: boolean;
  isCompleted?: boolean;
  certificateId?: string;
  _id: string;
}

export interface BaseInterviewSheetResponseProps extends Partial<InterviewSheetModel> {
  _id: string;
  isEnrolled?: boolean;
  questions?: ExtendedInterviewSheetQuestionModel[];
  isPremium?: boolean;
  price?: number;
  features?: string[];
}

export interface MarkQuestionCompletedRequestProps {
  userId: string;
  sheetId: string;
  questionId: string;
  isCompleted: boolean;
}

export interface MarkAptitudeQuestionCompletedRequestProps {
  userId: string;
  topicSlug: string;
  questionId: string;
  isCompleted: boolean;
}

export interface GetAllQuestionsRequestProps {
  userId: string;
}

export interface UpdateEnrolledUsersRequestPayloadProps extends Partial<AddWebinarRequestPayloadProps> {
  users: WebinarEnrolledUsersProps[];
}

export interface AddWebinarRequestPayloadProps {
  slug: string;
  name: string;
  description: string;
  isFree: boolean;
  about: string[];
  learnings: string[];
  host: {
    name: string;
    imageUrl: string;
    role: string;
    about: string[];
    linkedInUrl: string;
  };
  registrationUrl: string;
  dateAndTime: string;
  enrolledUsersList: WebinarEnrolledUsersProps[];
}

export interface WebinarEnrolledUsersProps {
  name: string;
  email: string;
}

export interface AddCertificateRequestPayloadProps {
  type: CertificateType;
  userName: string;
  userId: string;
  date: string;
  programName: string;
  programId: string;
}

export interface AddNotificationRequestPayloadProps {
  type: NotificationType;
  text: string;
  isHTML?: boolean;
  link?: string;
  isExternalLink?: boolean;
}

export interface UpdateNotificationRequestPayloadProps {
  notificationId: string;
  updatedNotification: Partial<AddNotificationRequestPayloadProps>;
}

export interface AddJobRequestPayloadProps {
  job_id: string;
  job_title: string;
  job_description: string;
  company: CompanyDetails;
  skills: string[];
  role: string[];
  location: string[];
  experience?: {
    min: number;
    max: number;
  };
  jobUrl: string;
  salary?: {
    min: string;
    max: string;
  };
  isInternship?: boolean;
  platform: string;
}

export interface UserPlaylistResponseProps extends PlaylistModel {
  _id: string;
  userId: string;
  isPublic: boolean;
  isRecommended: boolean;
  learningTime: number;
}

export interface AddFeedbackRequestProps {
  rating: number;
  type: string;
  ref: string;
  userId: string;
}

export interface UpdateFeedbackRequestProps {
  feedbackId: string;
  userId: string;
  feedback: string;
}

export interface UnSkilledEvaluationRequestBody {
  skills: string[];
  domains: string[];
  experience: {
    min: number;
    max: number;
  };
}

export interface AddPaymentToDBRequestPayloadProps {
  userId: string;
  productId: string;
  productType: string;
  amount: number;
  orderId: string;
  paymentLink: string;
  appliedCoupon?: string;
  couponCode?: string;
}

export interface BuildOrderPayloadProps {
  orderId: string;
  amount: number;
  userId: string;
  customerName: string;
  customerEmail: string;
}

export interface UpdatePaymentStatusPayloadProps {
  orderId: string;
  paymentId: string | undefined;
  status: "SUCCESS" | "FAILED";
}

export interface PrepYatraPaymentPayload extends AddPaymentToDBRequestPayloadProps {
  subscriptionType: SubscriptionType;
  subscriptionDuration: number;
  expiresAt: Date;
}

export interface AddRecruiterToDBPayloadProps {
  userId: string;
  recruiterName: string;
  email?: string;
  phone?: string;
  company?: string;
  appliedPosition?: string;
  applicationStatus?: string;
  lastContacted?: string;
  comments?: string;
  follow_up_date?: string;
  last_interview_date?: string;
  link?: string;
}

export interface AddPrepLogToDBPayloadProps {
  userId: string;
  title: string;
  description: string;
  timeSpent: number;
}

export interface MarkQuestionStarredRequestProps {
  userId: string;
  sheetId: string;
  questionId: string;
  isStarred: boolean;
}

// User Interest API Interfaces
export interface CreateUserInterestRequestProps {
  userId: string;
  eventType: import("@/lib/constants").InterestEventType;
  eventDescription?: string;
  metadata?: Record<string, any>;
  source: "WEBAPP" | "PREPYATRA" | "ADMIN" | "API";
}

export interface GetUserInterestsRequestProps {
  userId?: string;
  eventType?: InterestEventType;
  source?: "WEBAPP" | "PREPYATRA" | "ADMIN" | "API";
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface UserInterestResponseProps {
  _id: string;
  userId: string;
  eventType: InterestEventType;
  eventDescription?: string;
  metadata?: Record<string, any>;
  isActive: boolean;
  source: "WEBAPP" | "PREPYATRA" | "ADMIN" | "API";
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AptitudeQuestionOptionModel {
  text: string;
  isCorrect: boolean;
}

export interface AptitudeTopicModel extends Document {
  _id: typeof Schema.Types.ObjectId;
  contentId?: string;
  topic: string;
  studyGuide?: string;
  questions: AptitudeQuestionModel[];
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AptitudeQuestionOptionModel {
  text: string;
  isCorrect: boolean;
}

export interface AptitudeQuestionModel {
  _id: typeof Schema.Types.ObjectId;
  question: string;
  options: AptitudeQuestionOptionModel[];
  answer: string;
  difficulty: DSADifficultyType;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AddAptitudeQuestionPayload {
  question: string;
  options: AptitudeQuestionOptionModel[];
  answer: string;
  difficulty?: DSADifficultyType;
  order?: number;
}

export interface AptitudeUploadPayload {
  topic: string;
  questions: AddAptitudeQuestionPayload[];
}

export interface AptitudeStudyGuideUploadPayload {
  topic: string;
  content: string;
}

// Section types for StudyGuide
export type StudyGuideSectionType =
  "intro" | "concept" | "pattern" | "cheatsheet";

export type StudyGuideDifficulty = "Easy" | "Medium" | "Hard";

export type StudyGuideCodeLanguage =
  "python" | "java" | "cpp" | "javascript" | "go" | "pseudocode";

export type StudyGuideCalloutVariant =
  "info" | "success" | "warning" | "danger";

// Shared sub-types
export interface StudyGuidePrereqCard {
  title: string;
  body: string;
  sortOrder: number;
}

export interface StudyGuideCalloutBox {
  variant: StudyGuideCalloutVariant;
  body: string;
  sortOrder: number;
}

export interface StudyGuideCodeBlock {
  language: StudyGuideCodeLanguage;
  code: string;
  label: string | null;
  sortOrder: number;
}

export interface StudyGuideTableRow {
  isHeader: boolean;
  cells: string[];
}

export interface StudyGuideDryRunStep {
  stepNumber: number;
  description: string;
  arrayState: string | null;
  pointerState: string | null;
  stateLabel: string | null;
  isSolutionFound: boolean;
  highlightedIndexes: number[];
  foundIndexes: number[];
}

export interface StudyGuideSolutionCode {
  language: StudyGuideCodeLanguage;
  code: string;
}

export interface StudyGuidePracticeQuestion {
  name: string;
  difficulty: StudyGuideDifficulty;
  hint: string;
  leetcodeUrl: string;
  youtubeSearch: string;
  sortOrder: number;
}

export interface StudyGuideCheatsheetRow {
  patternName: string;
  triggerWords: string;
  timeComplexity: string;
  spaceComplexity: string;
  coreTrick: string;
  sortOrder: number;
}

export interface StudyGuideCheatsheetQuestion {
  name: string;
  difficulty: StudyGuideDifficulty;
  leetcodeUrl: string;
}

export interface StudyGuideCheatsheetQuestionGroup {
  groupName: string;
  sortOrder: number;
  questions: StudyGuideCheatsheetQuestion[];
}

// Content types (one per section type)
export interface StudyGuideIntroContent {
  pageTitle: string;
  subtitle: string;
  openingParagraph: string;
  prereqCards: StudyGuidePrereqCard[];
  callouts: StudyGuideCalloutBox[];
  howToUseHeading: string;
  howToUseParagraphs: string[];
}

export interface StudyGuideConceptSubsection {
  subheading: string;
  bodyText: string | null;
  tableData: StudyGuideTableRow[] | null;
  codeBlocks: StudyGuideCodeBlock[];
  sortOrder: number;
}

export interface StudyGuideConceptContent {
  pageTitle: string;
  subtitle: string;
  subsections: StudyGuideConceptSubsection[];
}

export interface StudyGuideWorkedExample {
  problemTitle: string;
  problemStatement: string;
  inputExample: string;
  outputExample: string;
  bruteForceDesc: string;
  keyInsight: string;
  dryRunSteps: StudyGuideDryRunStep[];
  solutionCode: StudyGuideSolutionCode[];
  timeComplexity: string;
  timeReason: string;
  spaceComplexity: string;
  spaceReason: string;
  coreTrick: string;
  leetcodeUrl: string;
  youtubeSearch: string;
}

export interface StudyGuidePatternContent {
  pageTitle: string;
  subtitle: string;
  whatIsIt: string;
  triggerPhrases: string[];
  whenNotToUse: string;
  codeTemplates: StudyGuideCodeBlock[];
  visualAscii: string | null;
  workedExample: StudyGuideWorkedExample;
  practiceQuestions: StudyGuidePracticeQuestion[];
}

export interface StudyGuideCheatsheetContent {
  pageTitle: string;
  subtitle: string;
  patternRows: StudyGuideCheatsheetRow[];
  decisionGuide: string;
  questionGroups: StudyGuideCheatsheetQuestionGroup[];
  oneThingToRemember: string[];
}

// Section (nav item or divider)
export interface StudyGuideContentSection {
  id: string | null;
  label: string | null;
  type: StudyGuideSectionType | null;
  isDivider: boolean;
  dividerLabel: string | null;
  sortOrder: number;
  content:
    | StudyGuideIntroContent
    | StudyGuideConceptContent
    | StudyGuidePatternContent
    | StudyGuideCheatsheetContent
    | any;
}

// Top-level document
export interface StudyGuideModel extends Document {
  contentId?: string;
  topicId: string;
  title: string;
  hasGuide: boolean;
  sortOrder: number;
  sections: StudyGuideContentSection[];
  createdAt: Date;
  updatedAt: Date;
}
