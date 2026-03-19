export const STUDY_GUIDE_CONFIGS: Record<string, any> = {
  ARRAY: {
    topic: "Arrays",
    hasStudyGuide: true,
    sections: [
      { id: "before-you-start", label: "Before you start" },
      { id: "how-arrays-work", label: "How Arrays work" },
      { divider: "Patterns" },
      { id: "two-pointers", label: "Two pointers" },
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
      { id: "two-pointers", label: "Two pointers" },
      { id: "frequency-counting", label: "Frequency Counting" },
      { divider: null },
      { id: "cheat-sheet", label: "Cheat sheet" },
    ],
  },
};
