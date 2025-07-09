import type { NotificationModel } from '.';

export interface User {
  id: string;
  name: string;
  email: string;
  image: string;
  isOnboarded: boolean;
}

export interface UseUserReturnType {
  user: User | null;
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

export type NotificationItemProps = Partial<NotificationModel>;
