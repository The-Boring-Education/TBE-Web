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

/** Maps a DSA topic slug to the visualizer keys (see @tbe/components VISUALIZER_MAP) available for it. */
export const DSA_TOPIC_VISUALIZERS = {
  ARRAY: ["array-basics"],
  STRING: ["string-basics"],
  HASHMAP: ["hashmap-operations"],
  TWO_POINTERS: ["two-pointers"],
  SLIDING_WINDOW: ["sliding-window"],
  BINARY_SEARCH: ["binary-search"],
  RECURSION: ["recursion-tree"],
  LINKED_LIST: ["linked-list-basics"],
  STACK: ["stack-operations"],
  SORTING: ["bubble-sort"],
} as const satisfies Partial<Record<DSATopicSlug, readonly string[]>>;

export type DSAVisualizerSlug =
  (typeof DSA_TOPIC_VISUALIZERS)[keyof typeof DSA_TOPIC_VISUALIZERS][number];

/** Human titles for visualizer slugs used in listings + SEO. */
export const DSA_VISUALIZER_META: Record<
  string,
  { title: string; description: string; topic: DSATopicSlug }
> = {
  "bubble-sort": {
    title: "Bubble Sort",
    description:
      "Watch bubble sort compare and swap adjacent elements step by step.",
    topic: "SORTING",
  },
  "array-basics": {
    title: "Array Operations",
    description:
      "Insert, delete, and access elements to see how arrays shift in memory.",
    topic: "ARRAY",
  },
  "string-basics": {
    title: "String Palindrome",
    description:
      "Two-pointer walk to check if a string reads the same forwards and backwards.",
    topic: "STRING",
  },
  "hashmap-operations": {
    title: "HashMap Buckets",
    description:
      "See how keys are hashed to buckets and how collisions chain together.",
    topic: "HASHMAP",
  },
  "two-pointers": {
    title: "Two Pointers — Pair Sum",
    description:
      "Move two pointers inward on a sorted array to find a target sum.",
    topic: "TWO_POINTERS",
  },
  "sliding-window": {
    title: "Sliding Window — Longest Substring",
    description:
      "Expand and contract a window to find the longest substring without repeats.",
    topic: "SLIDING_WINDOW",
  },
  "binary-search": {
    title: "Binary Search",
    description:
      "Narrow a sorted range by half at each step to find a target in O(log n).",
    topic: "BINARY_SEARCH",
  },
  "recursion-tree": {
    title: "Recursion — Fibonacci Tree",
    description:
      "Expand the recursive call tree for fib(n) and watch values bubble up.",
    topic: "RECURSION",
  },
  "linked-list-basics": {
    title: "Linked List Operations",
    description:
      "Insert, delete, and reverse a singly linked list one pointer at a time.",
    topic: "LINKED_LIST",
  },
  "stack-operations": {
    title: "Stack — Push, Pop & Balanced Parentheses",
    description:
      "Push and pop on a LIFO stack, or watch it validate balanced brackets.",
    topic: "STACK",
  },
};
