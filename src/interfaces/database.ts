import type { Document, Schema, Types } from 'mongoose';

import type {
  ApplicationStatusType,
  FeedbackType,
  InterestEventType,
  LeaderboardEnum,
  ProductType,
} from '@/constant';

import type {
  CertificateType,
  CompanyType,
  DifficultyType,
  GoalType,
  InterviewCategoryType,
  PlatformUsageType,
  PriorityType,
  QuestionFrequencyType,
  RoadmapsType,
  SkillsType,
  SubscriptionFeature,
  SubscriptionStatus,
  SubscriptionType,
  UnskilledLandingGraphDataProps,
  UserPointsActionType,
  UserRoleType,
  WebinarEnrolledUsersProps,
  WorkDomainType,
} from '.';

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

export interface InterviewSheetModel extends Document {
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
  questions: InterviewSheetQuestionModel[];
  roadmap: RoadmapsType;
  features: string[];
}

export interface InterviewSheetQuestionModel {
  _id: typeof Schema.Types.ObjectId;
  title: string;
  question: string;
  answer: string;
  frequency: QuestionFrequencyType;
  companyTypes?: CompanyType[];
  priority: PriorityType;
  toObject: () => UserCourseModel;
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
  createdBy: typeof Schema.Types.ObjectId;
  isExpired: boolean;
  isUsageLimitReached: boolean;
  isValid: boolean;
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
export interface UserPointsAction {
  actionType: UserPointsActionType;
  pointsEarned: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface GamificationModel {
  userId: Schema.Types.ObjectId;
  points: number;
  actions: UserPointsAction[];
}

export interface JobAggregateModel extends Document {
  trendingSkills: UnskilledLandingGraphDataProps[];
  topLocations: UnskilledLandingGraphDataProps[];
  jobDomains: UnskilledLandingGraphDataProps[];
  companyTypes: UnskilledLandingGraphDataProps[];
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

export interface PaymentModel extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  amount: number;
  productId: string;
  productType: ProductType;
  orderId: string;
  paymentId?: string;
  paymentLink: string;
  isPaid: boolean;
  subscriptionType?: SubscriptionType;
  subscriptionDuration?: number;
  expiresAt?: Date;
  appliedCoupon?: typeof Schema.Types.ObjectId;
  couponCode?: string;
}

export interface WebhookEvent {
  order_id: string;
  payment_id?: string;
  isPaid: boolean;
  payment_status: 'SUCCESS' | 'FAILED';
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
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  startDate: Date;
  endDate: Date;
  isPredefined: boolean;
  predefinedType?: '21DaysPython' | '21DaysJava' | '50DaysInternship';
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

export interface LeaderboardModel extends Document {
  type: LeaderboardEnum;
  date: Date;
  entries: {
    userId: Types.ObjectId;
    points: number;
  }[];
}

export interface ChallengeModel {
  _id: string;
  user: Types.ObjectId;
  name: string;
  totalDays: number;
  currentDay: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  category?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChallengeLogModel {
  _id: string;
  challenge: Types.ObjectId;
  day: number;
  progressText: string;
  hoursSpent: number;
  nextGoals: string[];
  loggedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserInterestModel {
  userId: Types.ObjectId;
  eventType: InterestEventType;
  eventDescription?: string;
  metadata?: Record<string, any>;
  isActive: boolean;
  source: 'WEBAPP' | 'PREPYATRA' | 'ADMIN' | 'API';
  ipAddress?: string;
  userAgent?: string;
}