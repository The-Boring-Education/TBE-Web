import type { FooterLinksContainerProps, WebinarModel } from '.';

export interface FooterNavigationDataProps extends FooterLinksContainerProps {
  id: string;
  isShow: boolean;
}

export type GetSEOMetaResponseType = {
  title: string;
  siteName: string;
  description: string;
  url: string;
  type: string;
  robots: string;
  image: string;
};

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

export interface TopNavbarLinkProps {
  id: string;
  name: string;
  href: string;
  description?: string;
  target?: '_blank';
  isDevelopment?: boolean;
}

export interface TopNavbarContainerProps {
  user: TopNavbarLinkProps[];
  products: TopNavbarLinkProps[];
  cohorts: TopNavbarLinkProps[];
  tools: TopNavbarLinkProps[];
  links: TopNavbarLinkProps[];
}

export interface ServerSessionProp {
  user: {
    name: string;
    email: string;
    image: string;
  };
  expires: Date;
}

export interface WebinarPageProps extends WebinarModel {
  bannerImageUrl: string;
  seoMeta: GetSEOMetaResponseType;
  date: string;
  time: string;
  isWebinarStarted: boolean;
  webinarId: string;
}

export type CertificateType = 'WEBINAR' | 'SHIKSHA';

const UserPointsActionType = [
  'ENROLL_COURSE',
  'ENROLL_SHEET',
  'ENROLL_PROJECT',
  'COMPLETE_COURSE_CHAPTER',
  'COMPLETE_PROJECT_CHAPTER',
  'COMPLETE_QUESTION',
  'COMPLETE_COURSE_CERTIFICATE',
  'STREAK',
  'REFER',
] as const;

export type UserPointsActionType = (typeof UserPointsActionType)[number];

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

export type UserRoleType =
  | 'TECH_STUDENT'
  | 'WORKING_PROFESSIONAL'
  | 'NON_TECH_STUDENT';

export type PlatformUsageType =
  | 'LEARNING_TECH'
  | 'BUILDING_PROJECTS'
  | 'INTERVIEW_PREP'
  | 'JOB_SEARCH';

export type WorkDomainType =
  | 'WEB_DEVELOPMENT'
  | 'DATA_SCIENCE'
  | 'DEVOPS'
  | 'MOBILE_DEVELOPMENT'
  | 'AI_ML'
  | 'UI_UX'
  | 'CYBER_SECURITY';

export type FormatDateType = {
  dateAndTime?: string;
  dateFormat?: Intl.DateTimeFormatOptions;
  timeFormat?: Intl.DateTimeFormatOptions;
};

export interface UpdateGamificationRecordBody {
  gamificationRecordId: UserPointsActionType;
}

export interface UnskilledLandingGraphDataProps {
  name: string;
  count: number;
}
