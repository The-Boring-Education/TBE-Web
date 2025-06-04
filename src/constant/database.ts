const DATABASE_MODELS = {
  PROJECT: 'Project',
  USER: 'User',
  USER_PROJECT: 'UserProject',
  COURSE: 'Course',
  INTERVIEW_SHEET: 'InterviewSheet',
  COURSE_SECTION: 'CourseSection',
  COURSE_CHAPTER: 'CourseChapter',
  USER_COURSE: 'UserCourse',
  USER_SHEET: 'UserSheet',
  PLAYLIST: 'Playlist',
  USER_PLAYLIST: 'UserPlaylist',
  WEBINAR: 'Webinar',
  CERTIFICATE: 'Certificate',
  NOTIFICATION: 'Notification',
  GAMIFICATION: 'Gamification',
  JOB: 'Job',
  FEEDBACK: 'Feedback',
  JOB_AGGREGATE: 'JobAggregate',
  PAYMENT:"Payment"
};

export const FEEDBACK_TYPES = [
  'GENERAL',
  'SHIKSHA_CHAPTER',
  'SHIKSHA_COURSE',
  'INTERVIEW_SHEET',
  'CERTIFICATE',
] as const;

export type FeedbackType = (typeof FEEDBACK_TYPES)[number];

export const PAYMENT_STATUS =[
  'PENDING',
  'FAILED',
  'SUCCESS'
]

export type PaymentStatus = (typeof PAYMENT_STATUS)[number];

const modelSelectParams = {
  coursePreview: '_id name slug coverImageURL description liveOn',
  projectPreview: '_id name slug coverImageURL description isActive',
};

export { DATABASE_MODELS, modelSelectParams };
