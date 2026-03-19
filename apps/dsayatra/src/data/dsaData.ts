export interface Question {
  title: string;
  leetcode_url: string;
  difficulty: "Easy" | "Medium" | "Hard";
}

export interface Topic {
  topic: string;
  emoji: string;
  questions: Question[];
}

export const DIFFICULTY_WEIGHTS = {
  Easy: 1,
  Medium: 2,
  Hard: 3,
} as const;

export const sortQuestionsByDifficulty = (
  questions: Question[],
): Question[] => {
  return [...questions].sort((a, b) => {
    return DIFFICULTY_WEIGHTS[a.difficulty] - DIFFICULTY_WEIGHTS[b.difficulty];
  });
};

export const DSA_YATRA_FAQS = [
  {
    question: "Is DSA Yatra free?",
    answer:
      "Yes. You get free access to structured content and practice. We also have premium paths with tailored roadmaps, company-focused question sets, and deeper tracking. Start free and upgrade when you want more focus.",
  },
  {
    question: "How is this different from solving random LeetCode problems?",
    answer:
      "DSA Yatra gives you a structured path instead of a random list. You follow a curated sequence by target (e.g. Startups, MNCs, MAANG), build concept mastery with patterns and revisions, and avoid wasting time on problems that don’t match your goal.",
  },
  {
    question: "Do I need prior DSA or coding experience?",
    answer:
      "No. We have paths for absolute beginners as well as for developers who already know basics and want to level up for interviews. Pick your current level and we’ll suggest the right starting point.",
  },
  {
    question: "What kind of roles or companies are the paths for?",
    answer:
      "Paths are tailored for Startups, MNCs, and MAANG-style interviews. You choose your target and get question sets and a timeline designed for that type of role, so your practice is aligned with real interviews.",
  },
  {
    question: "How much time do I need to commit?",
    answer:
      "It depends on your path and deadline. Each path has a suggested timeline; you can follow it as-is or adjust to your pace. The structure helps you stay consistent instead of burning out on random problems.",
  },
];

// DYNAMIC TIMELINE CONFIGURATION
export const TIMELINE_CONFIGS: Record<
  string,
  Record<string, { count: number; title: string; emoji: string }>
> = {
  "2months": {
    ARRAY: { count: 18, title: "Array Essentials", emoji: "📝" },
    STRING: { count: 14, title: "String Basics", emoji: "🔤" },
    HASHMAP: { count: 12, title: "Hashing Primer", emoji: "🔑" },
    LINKED_LIST: { count: 12, title: "Linked Lists", emoji: "🔗" },
    STACK: { count: 6, title: "Stack Foundations", emoji: "🥞" },
    QUEUE: { count: 6, title: "Queue Fundamentals", emoji: "🚶" },
    BINARY_SEARCH: { count: 8, title: "Search Algorithms", emoji: "🔍" },
    BINARY_TREE: { count: 18, title: "Basic Trees", emoji: "🌳" },
    HEAP: { count: 10, title: "Sets & Heaps", emoji: "⛰️" },
    DYNAMIC_PROGRAMMING: { count: 15, title: "Basic DP", emoji: "🧮" },
    GRAPH: { count: 10, title: "Basic Graphs", emoji: "🕸️" },
    SORTING: { count: 10, title: "Sorting Mastery", emoji: "📊" },
  },
  "3-4months": {
    ARRAY: { count: 25, title: "Arrays Deep Dive", emoji: "📝" },
    STRING: { count: 20, title: "String Processing", emoji: "🔤" },
    TWO_POINTERS: { count: 12, title: "Two Pointers", emoji: "✌️" },
    SLIDING_WINDOW: { count: 12, title: "Sliding Window", emoji: "🪟" },
    HASHMAP: { count: 15, title: "Advanced Hashing", emoji: "🔑" },
    LINKED_LIST: { count: 15, title: "Linked Lists Pro", emoji: "🔗" },
    STACK: { count: 10, title: "Advanced Stacks", emoji: "🥞" },
    QUEUE: { count: 8, title: "Advanced Queues", emoji: "🚶" },
    BINARY_SEARCH: { count: 15, title: "Binary Search Deep Dive", emoji: "🔍" },
    BINARY_TREE: { count: 20, title: "Trees Deep Dive", emoji: "🌳" },
    BST: { count: 10, title: "Binary Search Trees", emoji: "🌲" },
    HEAP: { count: 15, title: "Advanced Heaps", emoji: "⛰️" },
    DYNAMIC_PROGRAMMING: { count: 25, title: "Intermediate DP", emoji: "🧮" },
    GRAPH: { count: 20, title: "Intermediate Graphs", emoji: "🕸️" },
    GREEDY: { count: 15, title: "Greedy Algorithms", emoji: "💰" },
    BACKTRACKING: { count: 15, title: "Backtracking", emoji: "🔙" },
  },
  "5+months": {
    ARRAY: { count: 35, title: "Array Mastery", emoji: "📝" },
    STRING: { count: 25, title: "String Mastery", emoji: "🔤" },
    TWO_POINTERS: { count: 15, title: "Advanced Pointers", emoji: "✌️" },
    SLIDING_WINDOW: { count: 15, title: "Advanced Windows", emoji: "🪟" },
    HASHMAP: { count: 20, title: "HashMap Mastery", emoji: "🔑" },
    LINKED_LIST: { count: 18, title: "Linked List Mastery", emoji: "🔗" },
    STACK: { count: 15, title: "Stack Mastery", emoji: "🥞" },
    QUEUE: { count: 12, title: "Queue Mastery", emoji: "🚶" },
    BINARY_SEARCH: { count: 20, title: "Binary Search Mastery", emoji: "🔍" },
    BINARY_TREE: { count: 30, title: "Tree Mastery", emoji: "🌳" },
    BST: { count: 15, title: "BST Mastery", emoji: "🌲" },
    HEAP: { count: 20, title: "Heap Mastery", emoji: "⛰️" },
    TRIE: { count: 10, title: "Trie Data Structure", emoji: "🌲" },
    DYNAMIC_PROGRAMMING: { count: 40, title: "Advanced DP", emoji: "🧮" },
    GRAPH: { count: 30, title: "Advanced Graphs", emoji: "🕸️" },
    GREEDY: { count: 20, title: "Advanced Greedy", emoji: "💰" },
    BACKTRACKING: { count: 20, title: "Advanced Backtracking", emoji: "🔙" },
    MATH: { count: 10, title: "Math Fundamentals", emoji: "🔢" },
    BIT_MANIPULATION: { count: 10, title: "Bit Manipulation", emoji: "0️⃣" },
    UNION_FIND: { count: 10, title: "Disjoint Sets", emoji: "🔗" },
  },
};

import type { DSATopicGroup } from "@tbe/services";

/**
 * Dynamically generates the UI timeline object from the raw MongoDB API payload
 * utilizing the TIMELINE_CONFIGS map and the sorting standardizer.
 */
export const generateTimelineData = (
  timelineId: string,
  apiPayloadTopics: DSATopicGroup[],
) => {
  const config = TIMELINE_CONFIGS[timelineId];
  if (!config) return [];

  const generatedRoadmap = [];

  for (const [topicKey, topicConfig] of Object.entries(config)) {
    const dbTopicGroup = apiPayloadTopics.find((t) => t.topic === topicKey);
    let questionsToInject: Question[] = [];

    if (dbTopicGroup && dbTopicGroup.questions) {
      // Map API fields strictly to the frontend Question interface requirements
      const formattedQuestions: Question[] = dbTopicGroup.questions.map(
        (q) => ({
          title: q.title,
          leetcode_url: q.resources?.leetcodeURL || "",
          difficulty: (["Easy", "Medium", "Hard"].includes(q.difficulty)
            ? q.difficulty
            : "Medium") as "Easy" | "Medium" | "Hard",
        }),
      );

      // Sort questions: Easy -> Medium -> Hard
      const sortedDbQuestions = sortQuestionsByDifficulty(formattedQuestions);

      // Slice based on the config requirements for this specific timeline
      questionsToInject = sortedDbQuestions.slice(0, topicConfig.count);
    }

    generatedRoadmap.push({
      topic: topicConfig.title,
      emoji: topicConfig.emoji,
      questions: questionsToInject,
    });
  }

  return generatedRoadmap;
};

// Deprecated: Remove the static array in favor of the dynamic config generator.
// Kept temporarily for fallback during transition if required by other components.
export const timeBasedData: any = {};
