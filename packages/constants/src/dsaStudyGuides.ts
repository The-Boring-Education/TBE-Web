import type { StudyGuideConfig } from "@tbe/types";

export const DSA_STUDY_GUIDE_CONFIGS: Record<string, StudyGuideConfig> = {
  ARRAY: {
    topic: "Arrays",
    hasStudyGuide: true,
    sections: [
      { id: "before-you-start", label: "Before you start" },
      { id: "how-arrays-work", label: "How Arrays work" },
      { divider: "Patterns" },
      { id: "sliding-window", label: "Sliding window" },
      { id: "hash-map", label: "Hash map" },
      { id: "prefix-sum", label: "Prefix sum" },
      { id: "kadanes", label: "Kadane's algorithm" },
      { divider: null },
      { id: "cheat-sheet", label: "Cheat sheet" },
    ],
  },
  STRING: {
    topic: "Strings",
    hasStudyGuide: true,
    sections: [
      { id: "before-you-start", label: "Before you start" },
      { id: "how-strings-work", label: "How Strings work" },
      { divider: "Patterns" },
      { id: "frequency-counting", label: "Frequency Counting" },
      { divider: null },
      { id: "cheat-sheet", label: "Cheat sheet" },
    ],
  },
  HASHMAP: {
    topic: "Hash Map",
    hasStudyGuide: true,
    sections: [
      { id: "before-you-start", label: "Introduction" },
      { id: "hashing-basics", label: "Hashing basics" },
      { divider: "Patterns" },
      { id: "counting-elements", label: "Counting elements" },
      { id: "checking-existence", label: "Checking existence" },
      { divider: null },
      { id: "cheat-sheet", label: "Cheat sheet" },
    ],
  },
  BINARY_SEARCH: {
    topic: "Binary Search",
    hasStudyGuide: true,
    sections: [
      { id: "before-you-start", label: "Before you start" },
      { id: "how-binary-search-works", label: "How Binary Search works" },
      { divider: "Patterns" },
      { id: "classic-exact-search", label: "Classic exact search" },
      { id: "lower-bound", label: "Lower bound" },
      { id: "parametric-binary-search", label: "Binary search on answer" },
      { id: "rotated-array-search", label: "Rotated array search" },
      { id: "2d-matrix-search", label: "Binary search on 2D matrix" },
      { divider: null },
      { id: "cheat-sheet", label: "Cheat sheet" },
    ],
  },
  LINKED_LIST: {
    topic: "Linked List",
    hasStudyGuide: true,
    sections: [
      { id: "basics", label: "LL Basics" },
      { divider: "Patterns" },
      { id: "reversing", label: "Reversing" },
      { id: "detecting-cycles", label: "Cycle detection" },
      { divider: null },
      { id: "cheat-sheet", label: "Cheat sheet" },
    ],
  },
  SORTING: {
    topic: "Sorting",
    hasStudyGuide: true,
    sections: [
      { id: "before-you-start", label: "Before you start" },
      { id: "sorting-algorithms", label: "Core Algorithms" },
      { divider: "Patterns" },
      { id: "sorting-patterns", label: "Interview Patterns" },
      { divider: null },
      { id: "cheat-sheet", label: "Cheat sheet" },
    ],
  },
  QUEUE: {
    topic: "Queue",
    hasStudyGuide: true,
    sections: [
      { id: "before-you-start", label: "Introduction" },
      { id: "queue-mechanics", label: "Operations & Complexity" },
      { divider: null },
      { id: "cheat-sheet", label: "Cheat sheet" },
    ],
  },
  GRAPH: {
    topic: "Graph",
    hasStudyGuide: true,
    sections: [
      { id: "before-you-start", label: "Introduction" },
      { id: "graph-roadmap", label: "Study Roadmap" },
      { divider: null },
      { id: "cheat-sheet", label: "Cheat sheet" },
    ],
  },
};
