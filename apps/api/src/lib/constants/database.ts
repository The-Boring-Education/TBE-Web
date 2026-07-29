const DATABASE_MODELS = {
  PROJECT: "Project",
  USER: "User",
  USER_PROJECT: "UserProject",
  COURSE: "Course",
  INTERVIEW_SHEET: "InterviewSheet",
  COURSE_SECTION: "CourseSection",
  COURSE_CHAPTER: "CourseChapter",
  USER_COURSE: "UserCourse",
  USER_SHEET: "UserSheet",
  USER_APTITUDE_TOPIC: "UserAptitudeTopic",
  PLAYLIST: "Playlist",
  USER_PLAYLIST: "UserPlaylist",
  WEBINAR: "Webinar",
  CERTIFICATE: "Certificate",
  NOTIFICATION: "Notification",
  GAMIFICATION: "Gamification",
  JOB: "Job",
  FEEDBACK: "Feedback",
  JOB_AGGREGATE: "JobAggregate",
  PAYMENT: "Payment",
  SUBSCRIPTIONS: "Subscriptions",
  RECRUITER: "Recruiters",
  PREP_LOG: "PrepLog",
  CHALLENGE: "Challenge",
  CHALLENGE_LOG: "ChallengeLog",
  MENTORSHIP: "Mentorship",
  QUIZ: "Quiz",
  QUIZ_ATTEMPT: "QuizAttempt",
  QUIZ_SESSION: "QuizSession",
  USER_QUESTION_PERFORMANCE: "UserQuestionPerformance",
  USER_QUIZ_ANALYTICS: "UserQuizAnalytics",
  LEADERBOARD: "Leaderboard",
  USER_INTEREST: "UserInterest",
  COUPON: "Coupon",
  DSA_QUESTION: "DSAQuestion",
  APTITUDE_TOPIC: "AptitudeTopic",
  CORE_SUBJECT: "CoreSubject",
  STUDY_GUIDE: "StudyGuide",
  /** Admin-configured INR prices for subscription SKUs (productType + planKey) */
  SUBSCRIPTION_PLAN: "SubscriptionPlan",
  USER_ACTIVITY_LOG: "UserActivityLog",
  ADMIN_USER: "AdminUser",
  CONTENT_FEEDBACK: "ContentFeedback",
};

export const CONTENT_FEEDBACK_TYPES = [
  "DSA_QUESTION",
  "DSA_TOPIC",
  "COURSE",
  "COURSE_CHAPTER",
  "INTERVIEW_SHEET",
  "APTITUDE_QUESTION",
  "APTITUDE_TOPIC",
  "STUDY_GUIDE",
  "QUIZ",
  "QUIZ_QUESTION",
  "WEBINAR",
  "PROJECT",
] as const;

export type ContentFeedbackType = (typeof CONTENT_FEEDBACK_TYPES)[number];

export const CONTENT_FEEDBACK_KINDS = [
  "EXISTING_CONTENT",
  "NEW_CONTENT_SUGGESTION",
] as const;

export type ContentFeedbackKind = (typeof CONTENT_FEEDBACK_KINDS)[number];

export const CONTENT_FEEDBACK_STATUSES = [
  "PENDING",
  "REVIEWED",
  "ACCEPTED",
  "REJECTED",
] as const;

export type ContentFeedbackStatus = (typeof CONTENT_FEEDBACK_STATUSES)[number];

export const FEEDBACK_TYPES = [
  "GENERAL",
  "SHIKSHA_CHAPTER",
  "SHIKSHA_COURSE",
  "INTERVIEW_SHEET",
  "CERTIFICATE",
] as const;

export type FeedbackType = (typeof FEEDBACK_TYPES)[number];

export const PRODUCT_TYPE = [
  "INTERVIEW_SHEET",
  "SHIKSHA",
  "PROJECTS",
  "PREPYATRA",
  "DSA_YATRA",
  "ONCAMPUS",
  "WEBINAR",
  "GENERAL",
] as const;
export type ProductType = (typeof PRODUCT_TYPE)[number];

export const PAYMENT_STATUS = [
  "PENDING",
  "SUCCESS",
  "FAILED",
  "REFUNDED",
] as const;
export type PaymentStatusType = (typeof PAYMENT_STATUS)[number];

export const APPLICATION_STATUS = [
  "Screening",
  "Interviewing",
  "Final Round Done",
  "Offer Letter",
  "Rejected",
  "Not Interested",
];

export type ApplicationStatusType = (typeof APPLICATION_STATUS)[number];

export const INTEREST_EVENT_TYPES = [
  "PREPYATRA_SUBSCRIPTION",
  "AI_MENTOR",
  "WEBAPP_SUBSCRIPTION",
  "COHORT_PROGRAM",
  "NEWSLETTER",
  "BETA_FEATURE",
] as const;

export type InterestEventType = (typeof INTEREST_EVENT_TYPES)[number];

const modelSelectParams = {
  coursePreview:
    "_id name slug coverImageURL description liveOn isPremium roadmap price discountPercentage",
  projectPreview: "_id name slug coverImageURL description isActive",
};

export { DATABASE_MODELS, modelSelectParams };
