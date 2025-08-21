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
  PAYMENT: 'Payment',
  PREP_YATRA_SUBSCRIPTION: 'PrepYatraSubscription',
  RECRUITER: 'Recruiters',
  PREP_LOG: 'PrepLog',
  CHALLENGE: 'Challenge',
  CHALLENGE_LOG: 'ChallengeLog',
  MENTORSHIP: 'Mentorship',
  QUIZ: 'Quiz',
  QUIZ_ATTEMPT: 'QuizAttempt',
  QUIZ_SESSION: 'QuizSession',
  USER_QUESTION_PERFORMANCE: 'UserQuestionPerformance',
  USER_QUIZ_ANALYTICS: 'UserQuizAnalytics',
  LEADERBOARD: 'Leaderboard',
  USER_INTEREST: 'UserInterest',
  COUPON: 'Coupon'
};

export const FEEDBACK_TYPES = [
  'GENERAL',
  'SHIKSHA_CHAPTER',
  'SHIKSHA_COURSE',
  'INTERVIEW_SHEET',
  'CERTIFICATE',
] as const;

export type FeedbackType = (typeof FEEDBACK_TYPES)[number];

export const PRODUCT_TYPE = [
  'INTERVIEW_SHEET',
  'SHIKSHA',
  'PROJECTS',
  'PREPYATRA',
  'GENERAL',
];
export type ProductType = (typeof PRODUCT_TYPE)[number];

export const APPLICATION_STATUS = [
  'Screening',
  'Interviewing',
  'Final Round Done',
  'Offer Letter',
  'Rejected',
  'Not Interested',
];

export type ApplicationStatusType = (typeof APPLICATION_STATUS)[number];

export const INTEREST_EVENT_TYPES = [
  'PREPYATRA_SUBSCRIPTION',
  'AI_MENTOR',
  'WEBAPP_SUBSCRIPTION',
  'COHORT_PROGRAM',
  'NEWSLETTER',
  'BETA_FEATURE',
] as const;

export type InterestEventType = (typeof INTEREST_EVENT_TYPES)[number];

const modelSelectParams = {
  coursePreview: '_id name slug coverImageURL description liveOn isPremium',
  projectPreview: '_id name slug coverImageURL description isActive',
};

export { DATABASE_MODELS, modelSelectParams };
