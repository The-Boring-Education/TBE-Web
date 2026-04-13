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

export { DSA_YATRA_FAQS } from "@tbe/constants";

// DYNAMIC TIMELINE CONFIGURATION — keys must match DSA_TIMELINES values: "1Month", "3Months", "6Months", "1Year"
// These are used for UI display in generateTimelineData()
export const TIMELINE_CONFIGS: Record<
  string,
  Record<string, { count: number; title: string; emoji: string }>
> = {
  "1Month": {
    ARRAY: { count: 8, title: "Array Quick Review", emoji: "📝" },
    STRING: { count: 6, title: "String Basics", emoji: "🔤" },
    HASHMAP: { count: 5, title: "Hashing Essentials", emoji: "🔑" },
    LINKED_LIST: { count: 5, title: "Linked Lists", emoji: "🔗" },
    STACK: { count: 3, title: "Stack Foundations", emoji: "🥞" },
    QUEUE: { count: 3, title: "Queue Fundamentals", emoji: "🚶" },
    BINARY_SEARCH: { count: 4, title: "Search Basics", emoji: "🔍" },
    BINARY_TREE: { count: 8, title: "Basic Trees", emoji: "🌳" },
    HEAP: { count: 4, title: "Sets & Heaps", emoji: "⛰️" },
    DYNAMIC_PROGRAMMING: { count: 6, title: "Basic DP", emoji: "🧮" },
    GRAPH: { count: 4, title: "Basic Graphs", emoji: "🕸️" },
    SORTING: { count: 4, title: "Sorting Basics", emoji: "📊" },
    TWO_POINTERS: { count: 4, title: "Two Pointers", emoji: "✌️" },
    SLIDING_WINDOW: { count: 4, title: "Sliding Window", emoji: "🪟" },
    PREFIX_SUM: { count: 4, title: "Prefix Sum", emoji: "🔢" },
    MATH: { count: 3, title: "Math Basics", emoji: "🔢" },
    BIT_MANIPULATION: { count: 3, title: "Bit Manipulation", emoji: "0️⃣" },
    RECURSION: { count: 5, title: "Recursion Basics", emoji: "🔄" },
    BST: { count: 4, title: "Binary Search Trees", emoji: "🌲" },
    TRIE: { count: 2, title: "Trie Basics", emoji: "🌲" },
    BACKTRACKING: { count: 3, title: "Backtracking Intro", emoji: "🔙" },
    GREEDY: { count: 3, title: "Greedy Intro", emoji: "💰" },
    UNION_FIND: { count: 2, title: "Disjoint Sets", emoji: "🔗" },
    DESIGN: { count: 2, title: "Design Problems", emoji: "🏗️" },
    SIMULATION: { count: 2, title: "Simulation", emoji: "🎮" },
    MONOTONIC_STACK: { count: 2, title: "Monotonic Stack", emoji: "📚" },
  },
  "3Months": {
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
    TWO_POINTERS: { count: 8, title: "Two Pointers", emoji: "✌️" },
    SLIDING_WINDOW: { count: 8, title: "Sliding Window", emoji: "🪟" },
    PREFIX_SUM: { count: 8, title: "Prefix Sum", emoji: "🔢" },
    MATH: { count: 6, title: "Math Basics", emoji: "🔢" },
    BIT_MANIPULATION: { count: 6, title: "Bit Manipulation", emoji: "0️⃣" },
    RECURSION: { count: 10, title: "Recursion Basics", emoji: "🔄" },
    BST: { count: 8, title: "Binary Search Trees", emoji: "🌲" },
    TRIE: { count: 4, title: "Trie Basics", emoji: "🌲" },
    BACKTRACKING: { count: 6, title: "Backtracking Intro", emoji: "🔙" },
    GREEDY: { count: 6, title: "Greedy Intro", emoji: "💰" },
    UNION_FIND: { count: 4, title: "Disjoint Sets", emoji: "🔗" },
    DESIGN: { count: 4, title: "Design Problems", emoji: "🏗️" },
    SIMULATION: { count: 4, title: "Simulation", emoji: "🎮" },
    MONOTONIC_STACK: { count: 4, title: "Monotonic Stack", emoji: "📚" },
  },
  "6Months": {
    ARRAY: { count: 30, title: "Arrays Deep Dive", emoji: "📝" },
    STRING: { count: 22, title: "String Processing", emoji: "🔤" },
    HASHMAP: { count: 18, title: "Advanced Hashing", emoji: "🔑" },
    TWO_POINTERS: { count: 14, title: "Two Pointers", emoji: "✌️" },
    SLIDING_WINDOW: { count: 14, title: "Sliding Window", emoji: "🪟" },
    PREFIX_SUM: { count: 12, title: "Prefix Sum Advanced", emoji: "🔢" },
    SORTING: { count: 12, title: "Sorting Mastery", emoji: "📊" },
    BINARY_SEARCH: { count: 16, title: "Binary Search Deep Dive", emoji: "🔍" },
    LINKED_LIST: { count: 16, title: "Linked Lists Pro", emoji: "🔗" },
    STACK: { count: 12, title: "Advanced Stacks", emoji: "🥞" },
    QUEUE: { count: 10, title: "Advanced Queues", emoji: "🚶" },
    BINARY_TREE: { count: 24, title: "Trees Deep Dive", emoji: "🌳" },
    BST: { count: 14, title: "Binary Search Trees", emoji: "🌲" },
    HEAP: { count: 18, title: "Advanced Heaps", emoji: "⛰️" },
    TRIE: { count: 8, title: "Trie Data Structure", emoji: "🌲" },
    GRAPH: { count: 22, title: "Intermediate Graphs", emoji: "🕸️" },
    DYNAMIC_PROGRAMMING: { count: 30, title: "Intermediate DP", emoji: "🧮" },
    BACKTRACKING: { count: 16, title: "Backtracking", emoji: "🔙" },
    GREEDY: { count: 14, title: "Greedy Algorithms", emoji: "💰" },
    RECURSION: { count: 16, title: "Recursion Mastery", emoji: "🔄" },
    MATH: { count: 10, title: "Math Fundamentals", emoji: "🔢" },
    BIT_MANIPULATION: { count: 10, title: "Bit Manipulation", emoji: "0️⃣" },
    UNION_FIND: { count: 8, title: "Disjoint Sets", emoji: "🔗" },
    DESIGN: { count: 6, title: "Design Problems", emoji: "🏗️" },
    SIMULATION: { count: 6, title: "Simulation", emoji: "🎮" },
    MONOTONIC_STACK: { count: 6, title: "Monotonic Stack", emoji: "📚" },
  },
  "1Year": {
    ARRAY: { count: 40, title: "Array Mastery", emoji: "📝" },
    STRING: { count: 28, title: "String Mastery", emoji: "🔤" },
    HASHMAP: { count: 24, title: "HashMap Mastery", emoji: "🔑" },
    TWO_POINTERS: { count: 18, title: "Advanced Pointers", emoji: "✌️" },
    SLIDING_WINDOW: {
      count: 18,
      title: "Advanced Sliding Window",
      emoji: "🪟",
    },
    PREFIX_SUM: { count: 16, title: "Prefix Sum Mastery", emoji: "🔢" },
    SORTING: { count: 16, title: "Sorting Mastery", emoji: "📊" },
    BINARY_SEARCH: { count: 22, title: "Binary Search Mastery", emoji: "🔍" },
    LINKED_LIST: { count: 22, title: "Linked List Mastery", emoji: "🔗" },
    STACK: { count: 18, title: "Stack Mastery", emoji: "🥞" },
    QUEUE: { count: 14, title: "Queue Mastery", emoji: "🚶" },
    BINARY_TREE: { count: 35, title: "Tree Mastery", emoji: "🌳" },
    BST: { count: 20, title: "BST Mastery", emoji: "🌲" },
    HEAP: { count: 24, title: "Heap Mastery", emoji: "⛰️" },
    TRIE: { count: 12, title: "Trie Mastery", emoji: "🌲" },
    GRAPH: { count: 32, title: "Advanced Graphs", emoji: "🕸️" },
    DYNAMIC_PROGRAMMING: { count: 45, title: "Advanced DP", emoji: "🧮" },
    BACKTRACKING: { count: 24, title: "Advanced Backtracking", emoji: "🔙" },
    GREEDY: { count: 22, title: "Advanced Greedy", emoji: "💰" },
    RECURSION: { count: 22, title: "Recursion Mastery", emoji: "🔄" },
    MATH: { count: 14, title: "Math Fundamentals", emoji: "🔢" },
    BIT_MANIPULATION: { count: 14, title: "Bit Manipulation", emoji: "0️⃣" },
    UNION_FIND: { count: 12, title: "Disjoint Sets", emoji: "🔗" },
    DESIGN: { count: 10, title: "Design Problems", emoji: "🏗️" },
    SIMULATION: { count: 10, title: "Simulation", emoji: "🎮" },
    MONOTONIC_STACK: { count: 10, title: "Monotonic Stack", emoji: "📚" },
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
