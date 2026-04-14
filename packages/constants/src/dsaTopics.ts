/**
 * Single source of truth for DSA sheet topic slugs, ordering, and API enums.
 * Used by `@tbe/api` (mongoose, validation), web apps (roadmaps, filters), and onboarding.
 */

/** Stored on `DSAQuestion` / user targets — canonical enum order (sorting, indexes). */
export const DSA_CANONICAL_TOPICS = [
  "ARRAY",
  "STRING",
  "HASHMAP",
  "SLIDING_WINDOW",
  "PREFIX_SUM",
  "SORTING",
  "BINARY_SEARCH",
  "MATH",
  "BIT_MANIPULATION",
  "RECURSION",
  "LINKED_LIST",
  "STACK",
  "QUEUE",
  "BINARY_TREE",
  "TREE",
  "BST",
  "HEAP",
  "TRIE",
  "GRAPH",
  "BACKTRACKING",
  "DYNAMIC_PROGRAMMING",
  "GREEDY",
  "UNION_FIND",
  "SIMULATION",
  "DESIGN",
  "MONOTONIC_STACK",
] as const;

/**
 * Extra slugs allowed on questions / filters but not in the mongoose `enum` array
 * (merged at validation time — see api `dsaSheet` schema).
 */
export const DSA_EXTRA_QUESTION_TOPICS = [
  "TWO_POINTERS",
  "DFS",
  "BFS",
] as const;

export type DSATopicCanonicalSlug = (typeof DSA_CANONICAL_TOPICS)[number];
export type DSATopicExtraSlug = (typeof DSA_EXTRA_QUESTION_TOPICS)[number];
export type DSATopicSlug = DSATopicCanonicalSlug | DSATopicExtraSlug;

/** All topic slugs accepted for question payloads (canonical ∪ extra). */
export const DSA_ALL_QUESTION_TOPIC_SLUGS: readonly DSATopicSlug[] = [
  ...DSA_CANONICAL_TOPICS,
  ...DSA_EXTRA_QUESTION_TOPICS,
];

/** Multiselect / onboarding: human-friendly order, includes every {@link DSATopicSlug} once. */
export const DSA_ONBOARDING_TOPIC_ORDER = [
  "ARRAY",
  "PREFIX_SUM",
  "HASHMAP",
  "TWO_POINTERS",
  "SLIDING_WINDOW",
  "BINARY_SEARCH",
  "SORTING",
  "STRING",
  "MATH",
  "BIT_MANIPULATION",
  "RECURSION",
  "LINKED_LIST",
  "STACK",
  "QUEUE",
  "BINARY_TREE",
  "TREE",
  "BST",
  "HEAP",
  "TRIE",
  "GRAPH",
  "DFS",
  "BFS",
  "BACKTRACKING",
  "DYNAMIC_PROGRAMMING",
  "GREEDY",
  "UNION_FIND",
  "SIMULATION",
  "DESIGN",
  "MONOTONIC_STACK",
] as const satisfies readonly DSATopicSlug[];

/** DSA Yatra roadmap: these topics appear first before full-catalog ordering. */
export const DSA_TOPIC_ROADMAP_PREFERRED_ORDER = [
  "ARRAY",
  "HASHMAP",
  "TWO_POINTERS",
  "SLIDING_WINDOW",
  "RECURSION",
  "BINARY_SEARCH",
  "LINKED_LIST",
  "STACK",
  "STRING",
] as const;

const ONBOARDING_ORDER_INDEX = new Map<string, number>(
  DSA_ONBOARDING_TOPIC_ORDER.map((slug, i) => [slug, i]),
);

const ROADMAP_PREF_INDEX = new Map<string, number>(
  DSA_TOPIC_ROADMAP_PREFERRED_ORDER.map((slug, i) => [slug, i]),
);

/** Sort key for topic lists (roadmap, sheets). Unknown slugs sort last, then by string. */
export function compareDsaTopicKeys(a: string, b: string): number {
  const prefA = ROADMAP_PREF_INDEX.get(a);
  const prefB = ROADMAP_PREF_INDEX.get(b);
  if (prefA !== undefined && prefB !== undefined) {
    return prefA - prefB;
  }
  if (prefA !== undefined) {
    return -1;
  }
  if (prefB !== undefined) {
    return 1;
  }
  const i = ONBOARDING_ORDER_INDEX.get(a) ?? 10_000;
  const j = ONBOARDING_ORDER_INDEX.get(b) ?? 10_000;
  if (i !== j) {
    return i - j;
  }
  return a.localeCompare(b);
}

/** API / DB topic summary sorting (aggregations). */
export function compareDsaTopicKeysForApi(a: string, b: string): number {
  const i = DSA_CANONICAL_TOPICS.indexOf(a as DSATopicCanonicalSlug);
  const j = DSA_CANONICAL_TOPICS.indexOf(b as DSATopicCanonicalSlug);
  if (i !== -1 && j !== -1) {
    return i - j;
  }
  if (i !== -1) {
    return -1;
  }
  if (j !== -1) {
    return 1;
  }
  const oi = ONBOARDING_ORDER_INDEX.get(a) ?? 10_000;
  const oj = ONBOARDING_ORDER_INDEX.get(b) ?? 10_000;
  if (oi !== oj) {
    return oi - oj;
  }
  return a.localeCompare(b);
}
