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
}

type ActionTypes =
  | 'USER_LOGIN'
  | 'USER_LOGOUT'
  | 'COURSE_ENROLL'
  | 'COURSE_COMPLETE'
  | 'COURSE_PROGRESS'
  | 'INTERVIEW_SHEET_ENROLL'
  | 'INTERVIEW_SHEET_COMPLETE'
  | 'INTERVIEW_SHEET_PROGRESS'
  | 'PROJECT_ENROLL'
  | 'PROJECT_COMPLETE'
  | 'PROJECT_PROGRESS'
  | 'WEBINAR_ENROLL'
  | 'CERTIFICATE_GENERATED'
  | 'CERTIFICATE_DOWNLOAD';

type CategoryTypes =
  | 'User'
  | 'Course'
  | 'InterviewSheet'
  | 'Project'
  | 'Webinar';

type EventLabelTypes =
  | 'User Logged In'
  | 'User Logged Out'
  | 'Course Enrolled'
  | 'Course Completed'
  | 'Course Progress'
  | 'Interview Sheet Enrolled'
  | 'Interview Sheet Completed'
  | 'Interview Sheet Progress'
  | 'Project Enrolled'
  | 'Project Completed'
  | 'Project Progress'
  | 'Webinar Enrolled'
  | 'Certificate Generated'
  | 'Certificate Download';

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

export type NotificationItemProps = Partial<NotificationModel>;
