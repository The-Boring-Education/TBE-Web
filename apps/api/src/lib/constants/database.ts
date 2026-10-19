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
  CONTENT_FEEDBACK: "ContentFeedback",
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
  POINT_EVENT: "PointEvent",
  LEARNING_CREDIT: "LearningCredit",
  PERIOD_SCORE: "PeriodScore",
  PERIOD_CLOSE: "PeriodClose",
  CONTRIBUTOR: "Contributor",
  CONTRIBUTION: "Contribution",
};

export const CONTRIBUTION_CATEGORIES = [
  "PR_BUG_FIX",
  "CREATE_ISSUE",
  "REVIEW_PR",
  "BLOG",
  "POST",
  "EVENT_SESSION",
] as const;

export type ContributionCategoryType = (typeof CONTRIBUTION_CATEGORIES)[number];

export const CONTRIBUTION_STATUS = ["pending", "approved", "rejected"] as const;

export type ContributionStatusType = (typeof CONTRIBUTION_STATUS)[number];

export const CONTRIBUTOR_ROLES = ["Contributor", "TBE Captain"] as const;

export type ContributorRoleType = (typeof CONTRIBUTOR_ROLES)[number];

export const CONTRIBUTION_TYPE_GROUPS = [
  "code",
  "blogs",
  "content",
  "community",
] as const;

export type ContributionTypeGroup = (typeof CONTRIBUTION_TYPE_GROUPS)[number];

export const CATEGORY_TO_TYPE_GROUP: Record<
  ContributionCategoryType,
  ContributionTypeGroup
> = {
  PR_BUG_FIX: "code",
  CREATE_ISSUE: "code",
  REVIEW_PR: "code",
  BLOG: "blogs",
  POST: "content",
  EVENT_SESSION: "community",
};

export const BASELINE_CATEGORY_XP: Record<ContributionCategoryType, number> = {
  PR_BUG_FIX: 5,
  CREATE_ISSUE: 3,
  REVIEW_PR: 2,
  BLOG: 5,
  POST: 5,
  EVENT_SESSION: 15,
};

export const CAPTAIN_XP_THRESHOLD = 100;

export const FEEDBACK_TYPES = [
  "GENERAL",
  "DSA_QUESTION",
  "INTERVIEW_SHEET",
  "SHIKSHA_COURSE",
  "SHIKSHA_CHAPTER",
  "CORE_SUBJECT",
  "APTITUDE_TOPIC",
  "RESOURCE_GUIDE",
  "QUIZ",
  "PREP_CHALLENGE",
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
    "_id name slug coverImageURL description liveOn isPremium roadmap price discountPercentage status difficultyLevel chapters._id chapters.name chapters.key chapters.isOptional",
  projectPreview: "_id name slug coverImageURL description isActive",
};

export { DATABASE_MODELS, modelSelectParams };
