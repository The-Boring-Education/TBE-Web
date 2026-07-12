/**
 * Centralized GA4 event registry for all TBE apps.
 * Single source of truth — import ANALYTICS_EVENTS instead of string literals.
 */

/** Modern snake_case GA4 event names */
export const ANALYTICS_EVENTS = {
  // UI (automatic via delegated listeners)
  UI_CLICK: "ui_click",
  UI_FORM_SUBMIT: "ui_form_submit",

  // Auth & lifecycle
  LOGIN_CLICK: "login_click",
  LOGIN_REDIRECT_CLICK: "login_redirect_click",
  LOGIN_SUCCESS: "login_success",
  SIGNUP_SUCCESS: "signup_success",
  LOGOUT: "logout",
  USER_ACTIVATED: "user_activated",
  SIGNUP_CLICK: "signup_click",

  // Onboarding
  ONBOARDING_NEXT: "onboarding_next",
  ONBOARDING_PREVIOUS: "onboarding_previous",
  ONBOARDING_SUBMIT: "onboarding_submit",
  ONBOARDING_COMPLETE: "onboarding_complete",
  ONBOARDING_ERROR: "onboarding_error",

  // Quiz
  QUIZ_START: "quiz_start",
  QUIZ_QUESTION_ANSWERED: "quiz_question_answered",
  QUIZ_COMPLETE: "quiz_complete",
  QUIZ_SCORE: "quiz_score",
  QUIZ_SESSION_START: "quiz_session_start",
  QUIZ_ANSWER_SUBMIT: "quiz_answer_submit",
  QUIZ_SESSION_COMPLETE: "quiz_session_complete",
  QUIZ_RESULTS_VIEW: "quiz_results_view",

  // Course & learning
  COURSE_VIEW: "course_view",
  ENROLL_CLICK: "enroll_click",

  // Prep Yatra
  PREP_LOG_CREATE: "prep_log_create",
  PREP_LOG_UPDATE: "prep_log_update",
  PREP_LOG_DELETE: "prep_log_delete",
  CHALLENGE_CREATE: "challenge_create",
  CHALLENGE_UPDATE: "challenge_update",
  CHALLENGE_DELETE: "challenge_delete",
  CHALLENGE_LOG_CREATE: "challenge_log_create",
  SKILL_ADD: "skill_add",
  SKILL_REMOVE: "skill_remove",
  RECRUITER_CONTACT_CREATE: "recruiter_contact_create",
  RECRUITER_CONTACT_UPDATE: "recruiter_contact_update",
  RECRUITER_CONTACT_DELETE: "recruiter_contact_delete",

  // Resources
  SHARE_RESOURCE: "share_resource",

  // DSA Yatra (Phase 3)
  DSA_QUESTION_VIEW: "dsa_question_view",

  // Resume Yatra (Phase 3)
  RESUME_BUILDER_COMPLETE: "resume_builder_complete",
  RESUME_SHARE: "resume_share",

  // Legacy SCREAMING_SNAKE events (retained for GA4 historical continuity)
  USER_LOGIN: "USER_LOGIN",
  USER_LOGOUT: "USER_LOGOUT",
  COURSE_ENROLL: "COURSE_ENROLL",
  COURSE_COMPLETE: "COURSE_COMPLETE",
  COURSE_PROGRESS: "COURSE_PROGRESS",
  COURSE_CHAPTER_START: "COURSE_CHAPTER_START",
  COURSE_CHAPTER_COMPLETE: "COURSE_CHAPTER_COMPLETE",
  INTERVIEW_SHEET_ENROLL: "INTERVIEW_SHEET_ENROLL",
  INTERVIEW_SHEET_COMPLETE: "INTERVIEW_SHEET_COMPLETE",
  INTERVIEW_SHEET_PROGRESS: "INTERVIEW_SHEET_PROGRESS",
  QUESTION_START: "QUESTION_START",
  QUESTION_COMPLETE: "QUESTION_COMPLETE",
  QUESTION_HINT_USED: "QUESTION_HINT_USED",
  PROJECT_ENROLL: "PROJECT_ENROLL",
  PROJECT_COMPLETE: "PROJECT_COMPLETE",
  PROJECT_PROGRESS: "PROJECT_PROGRESS",
  PROJECT_CHAPTER_START: "PROJECT_CHAPTER_START",
  PROJECT_CHAPTER_COMPLETE: "PROJECT_CHAPTER_COMPLETE",
  WEBINAR_ENROLL: "WEBINAR_ENROLL",
  WEBINAR_JOIN: "WEBINAR_JOIN",
  WEBINAR_COMPLETE: "WEBINAR_COMPLETE",
  CERTIFICATE_GENERATED: "CERTIFICATE_GENERATED",
  CERTIFICATE_DOWNLOAD: "CERTIFICATE_DOWNLOAD",
  LEVEL_UP: "LEVEL_UP",
  POINTS_EARNED: "POINTS_EARNED",
  STREAK_ACHIEVEMENT: "STREAK_ACHIEVEMENT",
  PROFILE_COMPLETE: "PROFILE_COMPLETE",
  SOCIAL_SHARE: "SOCIAL_SHARE",
  FEEDBACK_SUBMITTED: "FEEDBACK_SUBMITTED",
  SEARCH_PERFORMED: "SEARCH_PERFORMED",
  FILTER_APPLIED: "FILTER_APPLIED",
  PAGE_VIEW_TIME: "PAGE_VIEW_TIME",
  VIDEO_WATCH_START: "VIDEO_WATCH_START",
  VIDEO_WATCH_COMPLETE: "VIDEO_WATCH_COMPLETE",
  DOWNLOAD_RESOURCE: "DOWNLOAD_RESOURCE",
  EXTERNAL_LINK_CLICK: "EXTERNAL_LINK_CLICK",
} as const;

export type AnalyticsEventName =
  (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS];

/** Legacy action names used with trackEvent({ action, category, label }) */
export const LEGACY_ANALYTICS_ACTIONS = [
  ANALYTICS_EVENTS.USER_LOGIN,
  ANALYTICS_EVENTS.USER_LOGOUT,
  ANALYTICS_EVENTS.COURSE_ENROLL,
  ANALYTICS_EVENTS.COURSE_COMPLETE,
  ANALYTICS_EVENTS.COURSE_PROGRESS,
  ANALYTICS_EVENTS.COURSE_CHAPTER_START,
  ANALYTICS_EVENTS.COURSE_CHAPTER_COMPLETE,
  ANALYTICS_EVENTS.INTERVIEW_SHEET_ENROLL,
  ANALYTICS_EVENTS.INTERVIEW_SHEET_COMPLETE,
  ANALYTICS_EVENTS.INTERVIEW_SHEET_PROGRESS,
  ANALYTICS_EVENTS.QUESTION_START,
  ANALYTICS_EVENTS.QUESTION_COMPLETE,
  ANALYTICS_EVENTS.QUESTION_HINT_USED,
  ANALYTICS_EVENTS.PROJECT_ENROLL,
  ANALYTICS_EVENTS.PROJECT_COMPLETE,
  ANALYTICS_EVENTS.PROJECT_PROGRESS,
  ANALYTICS_EVENTS.PROJECT_CHAPTER_START,
  ANALYTICS_EVENTS.PROJECT_CHAPTER_COMPLETE,
  ANALYTICS_EVENTS.WEBINAR_ENROLL,
  ANALYTICS_EVENTS.WEBINAR_JOIN,
  ANALYTICS_EVENTS.WEBINAR_COMPLETE,
  ANALYTICS_EVENTS.CERTIFICATE_GENERATED,
  ANALYTICS_EVENTS.CERTIFICATE_DOWNLOAD,
  ANALYTICS_EVENTS.LEVEL_UP,
  ANALYTICS_EVENTS.POINTS_EARNED,
  ANALYTICS_EVENTS.STREAK_ACHIEVEMENT,
  ANALYTICS_EVENTS.PROFILE_COMPLETE,
  ANALYTICS_EVENTS.SOCIAL_SHARE,
  ANALYTICS_EVENTS.FEEDBACK_SUBMITTED,
  ANALYTICS_EVENTS.SEARCH_PERFORMED,
  ANALYTICS_EVENTS.FILTER_APPLIED,
  ANALYTICS_EVENTS.PAGE_VIEW_TIME,
  ANALYTICS_EVENTS.VIDEO_WATCH_START,
  ANALYTICS_EVENTS.VIDEO_WATCH_COMPLETE,
  ANALYTICS_EVENTS.DOWNLOAD_RESOURCE,
  ANALYTICS_EVENTS.EXTERNAL_LINK_CLICK,
] as const;

export type LegacyAnalyticsAction = (typeof LEGACY_ANALYTICS_ACTIONS)[number];

export type AnalyticsCategory =
  | "User"
  | "Course"
  | "InterviewSheet"
  | "Project"
  | "Webinar"
  | "Question"
  | "Gamification"
  | "Engagement"
  | "Learning"
  | "Achievement"
  | "Social";

export type AnalyticsLabel =
  | "User Logged In"
  | "User Logged Out"
  | "Course Enrolled"
  | "Course Completed"
  | "Course Progress"
  | "Chapter Started"
  | "Chapter Completed"
  | "Interview Sheet Enrolled"
  | "Interview Sheet Completed"
  | "Interview Sheet Progress"
  | "Question Started"
  | "Question Completed"
  | "Question Hint Used"
  | "Project Enrolled"
  | "Project Completed"
  | "Project Progress"
  | "Project Chapter Started"
  | "Project Chapter Completed"
  | "Webinar Enrolled"
  | "Webinar Joined"
  | "Webinar Completed"
  | "Certificate Generated"
  | "Certificate Download"
  | "Level Up Achievement"
  | "Points Earned"
  | "Streak Achievement"
  | "Profile Completed"
  | "Content Shared"
  | "Feedback Submitted"
  | "Search Query"
  | "Filter Applied"
  | "Time Spent"
  | "Video Started"
  | "Video Completed"
  | "Resource Downloaded"
  | "External Link Clicked";

/** Events queried by GA4 Data API for activation reporting */
export const GROWTH_ANALYTICS_ACTIVATION_EVENTS = [
  ANALYTICS_EVENTS.SIGNUP_SUCCESS,
  ANALYTICS_EVENTS.USER_ACTIVATED,
] as const;

export type GrowthAnalyticsActivationEvent =
  (typeof GROWTH_ANALYTICS_ACTIVATION_EVENTS)[number];

/** Per-event param shapes for typed trackEvent (extend as needed) */
export interface AnalyticsEventParamsMap {
  [ANALYTICS_EVENTS.UI_CLICK]: {
    interaction_type?: string;
    element_tag?: string;
    element_id?: string;
    click_label?: string;
    surface?: string;
    link_href?: string;
    is_outbound?: boolean;
  };
  [ANALYTICS_EVENTS.UI_FORM_SUBMIT]: {
    interaction_type?: string;
    form_name?: string;
    surface?: string;
  };
  [ANALYTICS_EVENTS.LOGIN_SUCCESS]: { user_id: string };
  [ANALYTICS_EVENTS.SIGNUP_SUCCESS]: { user_id: string };
  [ANALYTICS_EVENTS.LOGOUT]: { user_id: string };
  [ANALYTICS_EVENTS.USER_ACTIVATED]: {
    user_id: string;
    product_id?: string;
  };
  [ANALYTICS_EVENTS.QUIZ_START]: { quiz_id: string };
  [ANALYTICS_EVENTS.QUIZ_QUESTION_ANSWERED]: {
    quiz_id: string;
    question_id: string;
    correct: boolean;
  };
  [ANALYTICS_EVENTS.QUIZ_COMPLETE]: { quiz_id: string };
  [ANALYTICS_EVENTS.QUIZ_SCORE]: { quiz_id: string; score: number };
  [ANALYTICS_EVENTS.COURSE_VIEW]: { course_id: string };
  [ANALYTICS_EVENTS.ENROLL_CLICK]: { course_id: string };
  [ANALYTICS_EVENTS.DSA_QUESTION_VIEW]: {
    question_id: string;
    topic?: string;
  };
  [ANALYTICS_EVENTS.RESUME_BUILDER_COMPLETE]: { score: number };
  [ANALYTICS_EVENTS.RESUME_SHARE]: { score?: number };
}

export type AnalyticsEventParams<E extends AnalyticsEventName> =
  E extends keyof AnalyticsEventParamsMap
    ? AnalyticsEventParamsMap[E]
    : Record<string, unknown>;
