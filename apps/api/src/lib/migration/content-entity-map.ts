/**
 * Single source of truth for content collections synced by `contentId`.
 *
 * Used by:
 * - `scripts/backfill-content-ids.ts`
 * - `scripts/migrate-content.ts` (via `content-migrate-entity.ts`)
 *
 * When adding `applyContentIdOnCreate()` to a new Mongoose model, add an entry
 * here (key = CLI `--entity` name, value = MongoDB collection name).
 * `apps/testing/src/unit/migration/content-entity-map.test.ts` asserts parity
 * with all contentId models.
 */
export const CONTENT_ENTITY_MAP = {
  interviewSheets: "interviewsheets",
  dsaQuestions: "dsaquestions",
  /** DSA topic study guides (`StudyGuide` model, collection `studyguides`) */
  studyGuides: "studyguides",
  aptitudeTopics: "aptitudetopics",
  coreSubjects: "coresubjects",
  courses: "courses",
  projects: "projects",
  quizzes: "quizzes",
} as const;

/** @deprecated Prefer `CONTENT_ENTITY_MAP`; kept for existing imports. */
export const ENTITY_MAP = CONTENT_ENTITY_MAP;

export type ContentEntityMapKey = keyof typeof CONTENT_ENTITY_MAP;
export type EntityMapKey = ContentEntityMapKey;
