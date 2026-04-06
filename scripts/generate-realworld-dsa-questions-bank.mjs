/**
 * Generates POST-ready DSA question payloads: 5 real-world framed questions per DSA topic.
 * Run: node scripts/generate-realworld-dsa-questions-bank.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

/** Must match apps/api/src/lib/constants/api.ts — DSA_TOPICS */
const DSA_TOPICS = [
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
];

const THEMES = [
  {
    label: "Education",
    blurb:
      "school boards, scholarships, attendance, and syllabus planning. Keep all entities fictional.",
  },
  {
    label: "Healthcare",
    blurb:
      "hospitals, triage, referrals, and public-health dashboards. No real patient data.",
  },
  {
    label: "Civic governance",
    blurb:
      "transparency portals, procurement audits, and service delivery metrics. Neutral framing.",
  },
  {
    label: "Climate & infrastructure",
    blurb:
      "power grids, water supply, transport, and disaster logistics. Use aggregate metrics only.",
  },
  {
    label: "Financial inclusion",
    blurb:
      "subsidies, payments, reconciliation, and fraud signals. No real account numbers.",
  },
];

const DIFF_CYCLE = ["EASY", "MEDIUM", "HARD", "MEDIUM", "EASY"];

/** Short algorithm cue per topic (interview-style) */
const TOPIC_CUE = {
  ARRAY:
    "Standard array techniques: iteration, prefix/suffix, two pointers, or divide-and-conquer as appropriate.",
  STRING:
    "String processing: two pointers, hashing, rolling hash, or building from characters.",
  HASHMAP:
    "Use a hash map (frequency, complement lookup, grouping, or deduplication).",
  SLIDING_WINDOW:
    "Maintain a valid window with two pointers; optimize updates in amortized O(1) per step.",
  PREFIX_SUM:
    "Build prefix (and sometimes suffix) sums for O(1) range queries after O(n) preprocess.",
  SORTING:
    "Sort input or sort indices by keys; combine with binary search or greedy pairing.",
  BINARY_SEARCH:
    "Binary search on sorted data or on the answer (monotonic predicate).",
  MATH:
    "Number theory / arithmetic invariants; watch overflow and integer division rules.",
  BIT_MANIPULATION:
    "Use XOR, masks, bit counts, or powers of two tricks where they apply.",
  RECURSION:
    "Define recurrence; memoize or convert to iterative DP if needed.",
  LINKED_LIST:
    "Pointer rewiring; dummy node; fast/slow pointers for cycles or middle.",
  STACK:
    "LIFO ordering for nesting, monotonic stack, or explicit DFS.",
  QUEUE:
    "FIFO ordering; BFS layers; deque when both ends matter.",
  BINARY_TREE:
    "Tree traversals, subtree properties, divide and conquer on children.",
  TREE:
    "General trees: adjacency, DFS/BFS, parent pointers, or rerooting.",
  BST:
    "BST ordering invariant; inorder successor/predecessor; balanced variants if stated.",
  HEAP:
    "Use a min/max-heap or multiway merge for k-best / streaming order.",
  TRIE:
    "Prefix tree for strings; path compression; XOR trie if bitmask strings.",
  GRAPH:
    "Adjacency list; BFS/DFS; shortest path or connectivity as stated.",
  BACKTRACKING:
    "Explore choices with pruning; track state; avoid duplicate branches.",
  DYNAMIC_PROGRAMMING:
    "Optimal substructure; define DP state; bottom-up or top-down memoization.",
  GREEDY:
    "Prove greedy choice property; sort by a key; exchange argument sketch.",
  UNION_FIND:
    "Disjoint sets for connectivity; path compression + union by rank.",
  SIMULATION:
    "Follow process rules stepwise; optimize with heaps/deques if naive is too slow.",
  DESIGN:
    "Data structure composition (hash + heap + linked list); amortized analysis.",
  MONOTONIC_STACK:
    "Maintain increasing/decreasing stack for next-greater / histogram problems.",
};

function buildAnswer(topic, theme, variantIndex) {
  const cue = TOPIC_CUE[topic] || "Apply standard patterns for this topic.";
  const label = topic.replace(/_/g, " ");
  const labelReadable = label
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
  return `## Problem (${theme.label})\n\nYou are building a feature whose core algorithm is **${labelReadable}** (topic: **${topic}**), set in a context involving: ${theme.blurb}\n\nState **precise input/output**, **constraints** (use typical interview bounds, e.g. $n \\le 2 \\cdot 10^5$ unless a smaller domain is natural), and implement an **efficient** solution.\n\nThis item is **variant ${variantIndex + 1}** for topic **${topic}** — keep the story aligned with the theme but avoid real persons, parties, or identifiable institutions.\n\n## Approach\n\n${cue}\n\n## Verification\n\nBriefly note time/space complexity and one edge case (empty input, duplicates, overflow).`;
}

function buildTitle(topic, theme, variantIndex) {
  const label = topic.replace(/_/g, " ");
  const labelReadable = label
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
  return `[${theme.label}] ${labelReadable} — scenario ${variantIndex + 1}`;
}

const questions = [];

for (const topic of DSA_TOPICS) {
  for (let i = 0; i < 5; i++) {
    const theme = THEMES[i];
    questions.push({
      title: buildTitle(topic, theme, i),
      answer: buildAnswer(topic, theme, i),
      domain: ["DSA"],
      difficulty: DIFF_CYCLE[i],
      companyTypes: ["MNC"],
      topics: [topic],
      isRealWorldProblem: true,
    });
  }
}

const out = {
  description:
    "POST each object in `questions` to POST /api/v1/interview-prep/dsa-sheet (with auth). 5 questions per DSA topic; all flagged isRealWorldProblem. Regenerate via: node scripts/generate-realworld-dsa-questions-bank.mjs",
  generatedAt: new Date().toISOString(),
  topicCount: DSA_TOPICS.length,
  questionsPerTopic: 5,
  totalQuestions: questions.length,
  questions,
};

const dest = path.join(
  root,
  "apps/dsayatra/src/data/realworld-dsa-questions-bank.json",
);
fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.writeFileSync(dest, JSON.stringify(out, null, 2), "utf8");
console.log(`Wrote ${questions.length} questions to ${dest}`);
