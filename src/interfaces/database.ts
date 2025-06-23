import type { Document, Schema, Types } from 'mongoose';

import type { ApplicationStatusType, FeedbackType, ProductType } from '@/constant';

import type {
  CertificateType,
  DifficultyType,
  PlatformUsageType,
  QuestionFrequencyType,
  RoadmapsType,
  SkillsType,
  TechStackType,
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
  workExperience:number;
  workDomain:WorkDomainType;
  techStack:TechStackType[];
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
  toObject: () => UserCourseModel;
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
  productId: Types.ObjectId;
  productType: ProductType;
  orderId: string;
  paymentId?: string;
  paymentLink: string;
  isPaid: boolean;
}

export interface WebhookEvent {
  order_id: string;
  payment_id?: string;
  isPaid: boolean;
  payment_status: 'SUCCESS' | 'FAILED';
}

export interface RecruiterModel extends Document{
  user: Types.ObjectId;
  recruiterName: string;
  email?: string
  phone?: string;
  company?: string;
  appliedPosition?: string;
  applicationStatus?: ApplicationStatusType;
  lastContacted?: string;
  follow_up_date?: string
  last_interview_date?: string;
  link?: string;
  comments?: string;
}

export interface PrepLogModel extends Document {
  user: Types.ObjectId;
  title: string;
  timeSpent: number;
  description?:string,
}