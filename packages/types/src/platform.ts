/**
 * Platform-Specific Types
 * 
 * Types specific to the TBE platform that are shared across multiple apps
 * but not necessarily part of the common domain types.
 */

// Define FooterLinksContainerProps locally to avoid dependency on @tbe/interface
interface FooterLinksContainerProps {
  heading: string;
  links: Array<{
    label: string;
    href: string;
    target?: '_blank';
  }>;
}

// ================================
// PLATFORM NAVIGATION & STRUCTURE
// ================================

export interface FooterNavigationDataProps extends FooterLinksContainerProps {
  id: string;
  isShow: boolean;
}

export type ProductLabelType =
  | 'Roadmaps'
  | 'Projects'
  | 'Shiksha'
  | 'Interview Prep'
  | 'Webinar'
  | 'Open Source'
  | 'Interview Prep'
  | 'Portfolio'
  | 'YouFocus'
  | 'UnSkilled'
  | 'Prep Yatra'
  | 'Tech Yatra'
  | 'DSA Yatra'
  | 'Resume Yatra';

export type CohortLabelType = 'Bring Your Idea';

export interface ProductDataProps {
  [key: string]: {
    label: ProductLabelType;
    slug: string;
    description: string;
  };
}

export interface CohortDataProps {
  [key: string]: {
    label: CohortLabelType;
    slug: string;
    description: string;
  };
}

export interface TopNavbarContainerProps {
  user: TopNavbarLinkProps[];
  products: TopNavbarLinkProps[];
  cohorts: TopNavbarLinkProps[];
  tools: TopNavbarLinkProps[];
  links: TopNavbarLinkProps[];
  issues: TopNavbarLinkProps[];
}

export interface TopNavbarLinkProps {
  id: string;
  name: string;
  href: string;
  description?: string;
  target?: '_blank';
  isDevelopment?: boolean;
}

// ================================
// SEO & META TYPES
// ================================

export type GetSEOMetaResponseType = {
  title: string;
  siteName: string;
  description: string;
  url: string;
  type: string;
  robots: string;
  image: string;
  keywords: string;
  author: string;
  publisher: string;
  linkedIn: string;
  instagram: string;
  github: string;
};

export interface SEOProps {
  seoMeta: GetSEOMetaResponseType;
}

// ================================
// SESSION & AUTH TYPES
// ================================

export interface ServerSessionProp {
  user: {
    name: string;
    email: string;
    image: string;
  };
  expires: Date;
}

// ================================
// WEBINAR PLATFORM TYPES
// ================================

export interface WebinarPageProps extends WebinarModel {
  bannerImageUrl: string;
  seoMeta: GetSEOMetaResponseType;
  date: string;
  time: string;
  isWebinarStarted: boolean;
  webinarId: string;
}

// ================================
// NOTIFICATION ITEM TYPE (for hooks/UI)
// ================================

export interface NotificationItemProps {
  _id: string;
  type: string;
  text: string;
  isHTML: boolean;
  link?: string;
  isExternalLink: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

// ================================
// COHORT TYPES
// ================================

export interface CohortRoadmapProps {
  week: string;
  title: string;
  description: string;
  activities?: string[];
  deliverables?: string[];
  resources?: string[];
}

export interface CohortJourneySectionProps {
  weeks: CohortRoadmapProps[];
}

export interface CohortUserCategoryProps {
  key: string;
  label: string;
  data: CohortRoadmapProps[];
  duration: string;
  price: number;
  discount: number;
  slashedPrice: number;
  features: string[];
}

// ================================
// DATE & TIME UTILITIES
// ================================

export type FormatDateType = {
  dateAndTime?: string;
  dateFormat?: Intl.DateTimeFormatOptions;
  timeFormat?: Intl.DateTimeFormatOptions;
};

// ================================
// LEADERBOARD TYPES
// ================================

export type LeaderboardType = 'DAILY' | 'WEEKLY' | 'MONTHLY';

export const LEADERBOARD_TYPES: LeaderboardType[] = [
  'DAILY',
  'WEEKLY',
  'MONTHLY',
];

// ================================
// GITHUB & EXTERNAL INTEGRATIONS
// ================================

export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  clone_url: string;
  ssh_url: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  watchers_count: number;
  size: number;
  default_branch: string;
  open_issues_count: number;
  is_template: boolean;
  topics: string[];
  has_issues: boolean;
  has_projects: boolean;
  has_wiki: boolean;
  has_pages: boolean;
  has_downloads: boolean;
  archived: boolean;
  disabled: boolean;
  visibility: 'public' | 'private';
  pushed_at: string;
  created_at: string;
  updated_at: string;
  permissions: {
    admin: boolean;
    maintain: boolean;
    push: boolean;
    triage: boolean;
    pull: boolean;
  };
  allow_rebase_merge: boolean;
  template_repository: GitHubRepository | null;
  temp_clone_token: string;
  allow_squash_merge: boolean;
  allow_auto_merge: boolean;
  delete_branch_on_merge: boolean;
  allow_update_branch: boolean;
  use_squash_pr_title_as_default: boolean;
  squash_merge_commit_message: 'PR_BODY' | 'COMMIT_MESSAGES' | 'BLANK';
  squash_merge_commit_title: 'PR_TITLE' | 'MERGE_MESSAGE';
  merge_commit_message: 'PR_BODY' | 'PR_TITLE' | 'BLANK';
  merge_commit_title: 'PR_TITLE' | 'MERGE_MESSAGE';
  license: {
    key: string;
    name: string;
    spdx_id: string;
    url: string;
    node_id: string;
  } | null;
  forks: number;
  open_issues: number;
  watchers: number;
  network_count: number;
  subscribers_count: number;
}

export interface GitHubUser {
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  gravatar_id: string;
  url: string;
  html_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  starred_url: string;
  subscriptions_url: string;
  organizations_url: string;
  repos_url: string;
  events_url: string;
  received_events_url: string;
  type: 'User' | 'Organization';
  site_admin: boolean;
  name: string | null;
  company: string | null;
  blog: string | null;
  location: string | null;
  email: string | null;
  hireable: boolean | null;
  bio: string | null;
  twitter_username: string | null;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
}

// ================================
// EMAIL & COMMUNICATION TYPES
// ================================

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
  variables: string[];
  category: 'welcome' | 'notification' | 'marketing' | 'transactional';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EmailSendRequest {
  to: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  templateId?: string;
  subject?: string;
  htmlContent?: string;
  textContent?: string;
  variables?: Record<string, any>;
  attachments?: {
    filename: string;
    content: string | Buffer;
    contentType: string;
  }[];
  replyTo?: string;
  headers?: Record<string, string>;
}

export interface EmailSendResponse {
  messageId: string;
  accepted: string[];
  rejected: string[];
  pending: string[];
  response: string;
}

// ================================
// ANALYTICS & TRACKING TYPES
// ================================

export interface AnalyticsPageView {
  page: string;
  title: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  userId?: string;
  sessionId: string;
  timestamp: string;
  userAgent: string;
  ipAddress: string;
  country?: string;
  city?: string;
  device: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  os: string;
}

export interface AnalyticsEvent {
  event: string;
  category: string;
  action: string;
  label?: string;
  value?: number;
  properties?: Record<string, any>;
  userId?: string;
  sessionId: string;
  timestamp: string;
  page: string;
}

// ================================
// PAGE TYPES
// ================================

export interface PageProps {
  slug: any;
  isDev?: boolean;
  seoMeta: GetSEOMetaResponseType;
  resolvedUrl?: string;
}

export interface ProjectPageProps extends PageProps {
  project: any; // Will be typed properly with database types
  meta: string;
  currentChapterId: string;
}

export interface PlaylistPageProps extends PageProps {
  playlist: any; // Will be typed properly with database types
  PlaylistId: string;
}

export interface CoursePageProps extends PageProps {
  course: any; // Will be typed properly with database types
  meta: string;
  currentChapterId: string;
}

export interface SheetPageProps extends PageProps {
  sheet: any; // Will be typed properly with database types
  meta: string;
  currentQuestionId: string;
}

// Define WebinarModel locally to avoid dependency on @tbe/interface
interface WebinarModel {
  _id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  duration: number;
  speaker: {
    name: string;
    bio: string;
    image: string;
    socialLinks: {
      linkedin?: string;
      twitter?: string;
      github?: string;
    };
  };
  topics: string[];
  prerequisites: string[];
  isLive: boolean;
  maxAttendees: number;
  currentAttendees: number;
  registrationUrl: string;
  meetingUrl?: string;
  recordingUrl?: string;
  resources: Array<{
    title: string;
    url: string;
    type: 'document' | 'video' | 'link';
  }>;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface WebinarCardProps extends WebinarModel {
  isCompleted: boolean
}

export interface WebinarsLandingPageProps extends PageProps {
  webinars: WebinarCardProps[];
}

export interface CertificatePageProps extends PageProps {
  certificate: any; // Will be typed properly with database types
}

export interface UnskilledLandingPageProps extends PageProps {
  jobData: {
    jobDomains: UnskilledLandingGraphDataProps[];
    trendingSkills: UnskilledLandingGraphDataProps[];
    companyTypes: UnskilledLandingGraphDataProps[];
    topLocations: UnskilledLandingGraphDataProps[];
    updatedAt: string;
  };
}

export interface UnskilledLandingGraphDataProps {
  name: string;
  count: number;
}

// ================================
// HOOK & UTILITY TYPES
// ================================

export interface PlatformUser {
  _id: string;
  name: string;
  email: string;
  image: string;
  isOnboarded: boolean;
}

export interface UseUserReturnType {
  user: PlatformUser | null;
  isAuth: boolean;
  loading: boolean;
  isOnboarded: boolean;
  updateSession: () => Promise<any>;
}

type ActionTypes =
  | 'USER_LOGIN'
  | 'USER_LOGOUT'
  | 'COURSE_ENROLL'
  | 'COURSE_COMPLETE'
  | 'COURSE_PROGRESS'
  | 'COURSE_CHAPTER_START'
  | 'COURSE_CHAPTER_COMPLETE'
  | 'INTERVIEW_SHEET_ENROLL'
  | 'INTERVIEW_SHEET_COMPLETE'
  | 'INTERVIEW_SHEET_PROGRESS'
  | 'QUESTION_START'
  | 'QUESTION_COMPLETE'
  | 'QUESTION_HINT_USED'
  | 'PROJECT_ENROLL'
  | 'PROJECT_COMPLETE'
  | 'PROJECT_PROGRESS'
  | 'PROJECT_CHAPTER_START'
  | 'PROJECT_CHAPTER_COMPLETE'
  | 'WEBINAR_ENROLL'
  | 'WEBINAR_JOIN'
  | 'WEBINAR_COMPLETE'
  | 'CERTIFICATE_GENERATED'
  | 'CERTIFICATE_DOWNLOAD'
  | 'LEVEL_UP'
  | 'POINTS_EARNED'
  | 'STREAK_ACHIEVEMENT'
  | 'PROFILE_COMPLETE'
  | 'SOCIAL_SHARE'
  | 'FEEDBACK_SUBMITTED'
  | 'SEARCH_PERFORMED'
  | 'FILTER_APPLIED'
  | 'PAGE_VIEW_TIME'
  | 'VIDEO_WATCH_START'
  | 'VIDEO_WATCH_COMPLETE'
  | 'DOWNLOAD_RESOURCE'
  | 'EXTERNAL_LINK_CLICK';

type CategoryTypes =
  | 'User'
  | 'Course'
  | 'InterviewSheet'
  | 'Project'
  | 'Webinar'
  | 'Question'
  | 'Gamification'
  | 'Engagement'
  | 'Learning'
  | 'Achievement'
  | 'Social';

type EventLabelTypes =
  | 'User Logged In'
  | 'User Logged Out'
  | 'Course Enrolled'
  | 'Course Completed'
  | 'Course Progress'
  | 'Chapter Started'
  | 'Chapter Completed'
  | 'Interview Sheet Enrolled'
  | 'Interview Sheet Completed'
  | 'Interview Sheet Progress'
  | 'Question Started'
  | 'Question Completed'
  | 'Question Hint Used'
  | 'Project Enrolled'
  | 'Project Completed'
  | 'Project Progress'
  | 'Project Chapter Started'
  | 'Project Chapter Completed'
  | 'Webinar Enrolled'
  | 'Webinar Joined'
  | 'Webinar Completed'
  | 'Certificate Generated'
  | 'Certificate Download'
  | 'Level Up Achievement'
  | 'Points Earned'
  | 'Streak Achievement'
  | 'Profile Completed'
  | 'Content Shared'
  | 'Feedback Submitted'
  | 'Search Query'
  | 'Filter Applied'
  | 'Time Spent'
  | 'Video Started'
  | 'Video Completed'
  | 'Resource Downloaded'
  | 'External Link Clicked';

export type TrackEventProps = {
  action: ActionTypes;
  category: CategoryTypes;
  label?: EventLabelTypes;
  value?: any;
};

export interface useFeedbackProps {
  type: string;
  refId?: string;
}

export interface usePaymentStatusProps {
  userId?: string;
  productId: string;
  isPremium?: boolean;
}

export interface useQuestionStarredProps {
  userId: string;
  sheetId: string;
  questionId: string;
  initialIsStarred: boolean;
}

export interface UseScrollDirectionResult {
  scrollDirection: 'up' | 'down';
  scrollY: number;
  isAtTop: boolean;
  isAtBottom: boolean;
}

export interface UseGamifiedActionResult {
  triggerAction: (actionType: string, points?: number) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  lastAction: {
    actionType: string;
    points: number;
    timestamp: string;
  } | null;
}

// ================================
// CONSTANTS & ENUMS
// ================================

export const PLATFORM_CONSTANTS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  SUPPORTED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  SUPPORTED_VIDEO_TYPES: ['video/mp4', 'video/webm', 'video/ogg'],
  SUPPORTED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  API_RATE_LIMITS: {
    GUEST: 100, // requests per hour
    USER: 1000, // requests per hour
    PREMIUM: 5000, // requests per hour
    ADMIN: 10000, // requests per hour
  },
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100,
  },
  CACHE_DURATIONS: {
    SHORT: 5 * 60, // 5 minutes
    MEDIUM: 30 * 60, // 30 minutes
    LONG: 60 * 60, // 1 hour
    VERY_LONG: 24 * 60 * 60, // 24 hours
  },
} as const;

export type PlatformConstants = typeof PLATFORM_CONSTANTS;

// ================================
// ERROR HANDLING TYPES
// ================================

export interface PlatformError {
  code: string;
  message: string;
  details?: any;
  stack?: string;
  timestamp: string;
  userId?: string;
  requestId?: string;
  context?: Record<string, any>;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: any;
}

export interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; errorInfo: any; resetError: () => void }>;
  onError?: (error: Error, errorInfo: any) => void;
}
