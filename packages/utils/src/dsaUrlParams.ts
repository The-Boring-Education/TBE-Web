import { TOPIC_LABELS } from "@tbe/constants";
import type { DsaQuestion } from "@tbe/interface";

/** URL segment for a DSA topic key (e.g. ARRAY → "array", TWO_POINTERS → "two-pointers"). */
export const encodeDsaTopicForUrl = (topicKey: string): string =>
  topicKey.toLowerCase().replace(/_/g, "-");

const TOPIC_KEYS = Object.keys(TOPIC_LABELS) as string[];

/**
 * Maps a `topic` query value to an internal topic key.
 * Accepts canonical slugs ("array") and legacy forms ("ARRAY", "two_pointers").
 */
export const decodeDsaTopicFromUrl = (
  param: string | undefined,
): string | null => {
  if (param == null || String(param).trim() === "") return null;
  const normalized = String(param).trim().toLowerCase().replace(/_/g, "-");

  for (const key of TOPIC_KEYS) {
    if (encodeDsaTopicForUrl(key) === normalized) return key;
  }
  return null;
};

/** Slug for question titles in URLs (e.g. "Two Sum" → "two-sum"). */
export const encodeDsaQuestionTitleForUrl = (name: string): string =>
  name
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

export const findDsaQuestionByUrlSlug = (
  questions: DsaQuestion[],
  slug: string,
): DsaQuestion | undefined => {
  if (!slug) return undefined;
  const want = slug.trim().toLowerCase();
  return questions.find((q) => encodeDsaQuestionTitleForUrl(q.name) === want);
};
