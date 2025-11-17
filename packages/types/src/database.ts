/**
 * Database Types & Model Interfaces
 * 
 * All database-related types including model interfaces,
 * schema types, and database-specific enums used across TBE platform apps.
 */

// ================================
// BASIC TYPES
// ================================

export type CertificateType = 'WEBINAR' | 'SHIKSHA';

export type QuestionFrequencyType =
  | 'Most Asked'
  | 'Asked Frequently'
  | 'Asked Sometimes';

export type DifficultyType = 'Beginner' | 'Intermediate' | 'Advanced';

export type RoadmapsType = 'Frontend' | 'Backend' | 'Fullstack' | 'Tech';

export type SkillsType =
  | 'React'
  | 'JavaScript'
  | 'HTML'
  | 'CSS'
  | 'Python'
  | 'Java'
  | 'TypeScript'
  | 'NodeJS'
  | 'ExpressJS'
  | 'MongoDB'
  | 'TailwindCSS'
  | 'NextJS';

export type UserRoleType =
  | 'TECH_STUDENT'
  | 'WORKING_PROFESSIONAL'
  | 'NON_TECH_STUDENT'
  | 'DEVREL_ADVOCATE'
  | 'DEVREL_LEAD';

export type PlatformUsageType =
  | 'LEARNING_TECH'
  | 'BUILDING_PROJECTS'
  | 'INTERVIEW_PREP'
  | 'JOB_SEARCH';

export type WorkDomainType =
  | 'MERN Full-stack'
  | 'Java Full-stack'
  | 'Python Full-stack'
  | 'Data Analysis'
  | 'Machine Learning'
  | 'AI'
  | 'App Development'
  | 'Others';

export type GoalType =
  | 'GET_JOB'
  | 'SWITCH_CAREER'
  | 'LEARN_NEW_SKILL'
  | 'BUILD_PORTFOLIO'
  | 'PREPARE_FOR_INTERVIEWS'
  | 'START_FREELANCING';

export type CompanyType =
  | 'FAANG'
  | 'STARTUP'
  | 'MID_SIZE'
  | 'MNC'
  | 'CONSULTING'
  | 'FINANCE'
  | 'EDTECH'
  | 'E-COMMERCE'
  | 'HEALTHCARE'
  | 'OTHER';

export type InterviewCategoryType =
  | 'TECHNICAL'
  | 'BEHAVIORAL'
  | 'SYSTEM_DESIGN'
  | 'CODING'
  | 'PROJECT_DISCUSSION'
  | 'CULTURE_FIT';

export type NotificationType =
  | 'WEBINAR'
  | 'SHIKSHA'
  | 'PROJECT'
  | 'INTERVIEW PREP'
  | 'UPDATE'
  | 'COHORT'
  | 'PREP YATRA'
  | 'TECH YATRA'
  | 'DSA YATRA'
  | 'RESUME YATRA'
  | 'TOOLS';

export type SubscriptionType =
  | 'FREE'
  | 'BASIC'
  | 'PREMIUM'
  | 'ENTERPRISE';

export type InterestEventType =
  | 'COURSE_VIEW'
  | 'COURSE_ENROLL'
  | 'PROJECT_VIEW'
  | 'PROJECT_ENROLL'
  | 'SHEET_VIEW'
  | 'SHEET_ENROLL'
  | 'WEBINAR_VIEW'
  | 'WEBINAR_ENROLL'
  | 'QUIZ_ATTEMPT'
  | 'CERTIFICATE_DOWNLOAD'
  | 'PAYMENT_SUCCESS'
  | 'FEEDBACK_SUBMIT';

// ================================
// MODEL INTERFACES
// ================================

export interface CompanyDetails {
  name: string;
  logo?: string;
  website?: string;
  description?: string;
}

export interface ProjectChapter {
  chapterId: string;
  chapterName: string;
  content: string;
  isOptional?: boolean;
  isCompleted: boolean;
}

export interface CourseChapterModel {
  chapterId: string;
  chapterName: string;
  content: string;
  isOptional?: boolean;
  isCompleted: boolean;
}

export interface CourseModel {
  _id: string;
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
  chapters?: CourseChapterModel[];
  createdAt: string;
  updatedAt: string;
}

export interface ProjectDocumentModel {
  _id: string;
  name: string;
  description: string;
  coverImageURL: string;
  slug: string;
  meta?: string;
  roadmap: RoadmapsType;
  difficultyLevel: DifficultyType;
  requiredSkills: SkillsType[];
  sections: Array<{
    sectionId: string;
    sectionName: string;
    chapters: ProjectChapter[];
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface InterviewSheetModel {
  _id: string;
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
  questions?: InterviewSheetQuestionModel[];
  createdAt: string;
  updatedAt: string;
}

export interface InterviewSheetQuestionModel {
  questionId: string;
  title: string;
  question: string;
  answer: string;
  frequency: QuestionFrequencyType;
  isCompleted: boolean;
  isStarred?: boolean;
}

export interface PlaylistModel {
  _id: string;
  playlistName: string;
  description: string;
  thumbnail: string;
  tags: string[];
  videos: Array<{
    title: string;
    thumbnail: string;
    videoId: string;
  }>;
  referrerBy: number;
  createdAt: string;
  updatedAt: string;
}

export interface WebinarEnrolledUsersProps {
  userId: string;
  name: string;
  email: string;
  enrolledAt: string;
}

// ================================
// USER POINTS ACTION TYPES
// ================================

const UserPointsActionType = [
  'ENROLL_COURSE',
  'ENROLL_SHEET',
  'ENROLL_PROJECT',
  'COMPLETE_COURSE_CHAPTER',
  'COMPLETE_PROJECT_CHAPTER',
  'COMPLETE_QUESTION',
  'COMPLETE_COURSE_CERTIFICATE',
  'COMPLETE_PROJECT',
  'COMPLETE_INTERVIEW_SHEET',
  'PROFILE_COMPLETION',
  'SOCIAL_SHARE',
  'FEEDBACK_SUBMIT',
  'VIDEO_WATCH_COMPLETE',
  'FIRST_LOGIN',
  'DAILY_VISIT',
  'STREAK',
  'REFER',
  'WEBINAR_ATTEND',
  'DOWNLOAD_CERTIFICATE',
  'HELP_COMMUNITY',
  'RECRUITER_ADDED',
  'PREPLOG_CREATED',
  'PREPLOG_STREAK_3',
  'PREPLOG_STREAK_7',
  'PREPLOG_STREAK_15',
  'PREPLOG_STREAK_30',
  'COMPLETE_QUIZ',
  'QUIZ_PERFECT_SCORE',
  'QUIZ_STREAK',
] as const;

export type UserPointsActionType = (typeof UserPointsActionType)[number];
