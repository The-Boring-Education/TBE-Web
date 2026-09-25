import type { LeaderboardType, UserPointsActionType } from "@tbe/types";

/**
 * How a Point Event type relates to the leaderboard (see CONTEXT.md).
 * - BASE: direct effort on one Learning Item; counts toward Period Score, subject to the Pace Limit.
 * - BONUS: awarded only as a consequence of BASE actions; counts toward Period Score, never paced.
 * - ENGAGEMENT: earns Lifetime Points only.
 */
export type PointActionClass = "BASE" | "BONUS" | "ENGAGEMENT";

export const POINT_ACTION_CLASS: Record<UserPointsActionType, PointActionClass> =
  {
    COMPLETE_COURSE_CHAPTER: "BASE",
    COMPLETE_PROJECT_CHAPTER: "BASE",
    COMPLETE_QUESTION: "BASE",
    COMPLETE_DSA_QUESTION: "BASE",
    COMPLETE_APTITUDE_QUESTION: "BASE",
    COMPLETE_QUIZ: "BASE",
    VIDEO_WATCH_COMPLETE: "BASE",
    WEBINAR_ATTEND: "BASE",
    PREPLOG_CREATED: "BASE",

    QUIZ_PERFECT_SCORE: "BONUS",
    COMPLETE_INTERVIEW_SHEET: "BONUS",
    COMPLETE_DSA_TOPIC: "BONUS",
    COMPLETE_PROJECT: "BONUS",
    COMPLETE_COURSE_CERTIFICATE: "BONUS",

    ENROLL_COURSE: "ENGAGEMENT",
    ENROLL_SHEET: "ENGAGEMENT",
    ENROLL_PROJECT: "ENGAGEMENT",
    PROFILE_COMPLETION: "ENGAGEMENT",
    SOCIAL_SHARE: "ENGAGEMENT",
    FEEDBACK_SUBMIT: "ENGAGEMENT",
    FIRST_LOGIN: "ENGAGEMENT",
    DAILY_VISIT: "ENGAGEMENT",
    STREAK: "ENGAGEMENT",
    REFER: "ENGAGEMENT",
    DOWNLOAD_CERTIFICATE: "ENGAGEMENT",
    HELP_COMMUNITY: "ENGAGEMENT",
    RECRUITER_ADDED: "ENGAGEMENT",
    PREPLOG_STREAK_3: "ENGAGEMENT",
    PREPLOG_STREAK_7: "ENGAGEMENT",
    PREPLOG_STREAK_15: "ENGAGEMENT",
    PREPLOG_STREAK_30: "ENGAGEMENT",
    QUIZ_STREAK: "ENGAGEMENT",
  };

/** Unknown action types are treated as ENGAGEMENT so they can never reach a leaderboard. */
export const classifyPointAction = (
  actionType: UserPointsActionType | string,
): PointActionClass =>
  POINT_ACTION_CLASS[actionType as UserPointsActionType] ?? "ENGAGEMENT";

export const isLearningAction = (actionType: UserPointsActionType | string) =>
  classifyPointAction(actionType) !== "ENGAGEMENT";

/** Pace Limit: at most one BASE Learning Action per learner per window counts toward Period Score. */
export const LEADERBOARD_PACE_LIMIT_MS = 3 * 60 * 1000;

/** All Period boundaries are in IST (UTC+05:30, no DST). */
export const LEADERBOARD_TZ_OFFSET_MINUTES = 330;

export const LEADERBOARD_PERIOD_TYPES: LeaderboardType[] = [
  "DAILY",
  "WEEKLY",
  "MONTHLY",
];

export const LEADERBOARD_LIMITS = {
  DASHBOARD: 10,
  PAGE: 50,
  PUBLIC: 5,
  MAX: 50,
  CHAMPIONS: 3,
} as const;

/** How many top finishers receive an email when a Period closes. */
export const LEADERBOARD_EMAIL_RECIPIENTS: Record<LeaderboardType, number> = {
  DAILY: 3,
  WEEKLY: 10,
  MONTHLY: 10,
};

/** Champions of the previous Period are featured on the card for this long into a new Period. */
export const LEADERBOARD_CHAMPIONS_SPOTLIGHT_MS = 24 * 60 * 60 * 1000;
