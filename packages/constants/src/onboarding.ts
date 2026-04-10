import type {
  CompanyType,
  ExperienceLevel,
  GoalType,
  InterviewCategory,
} from "@tbe/types";

export const EXPERIENCE_LEVELS: {
  value: ExperienceLevel;
  label: string;
  icon: string;
}[] = [
  { value: "fresher", label: "0-1 years (Fresher)", icon: "🌱" },
  { value: "junior", label: "1-3 years (Junior)", icon: "💼" },
  { value: "mid", label: "3-5 years (Mid-level)", icon: "🚀" },
  { value: "senior", label: "5+ years (Senior)", icon: "👔" },
];

export const GOALS: {
  value: GoalType;
  label: string;
  description: string;
  icon: string;
  popular?: boolean;
}[] = [
  {
    value: "GET_JOB",
    label: "3 Months",
    description: "Quick interview preparation",
    icon: "⚡",
  },
  {
    value: "SWITCH_CAREER",
    label: "6 Months",
    description: "Comprehensive preparation",
    icon: "🎯",
    popular: true,
  },
  {
    value: "LEARN_NEW_SKILL",
    label: "1 Year",
    description: "Long-term career planning",
    icon: "🌟",
  },
];

export const COMPANY_TYPES: {
  value: CompanyType;
  label: string;
  icon: string;
  description: string;
}[] = [
  {
    value: "STARTUP",
    label: "Startups",
    icon: "🚀",
    description: "Fast-paced, innovative companies",
  },
  {
    value: "MID_SIZE",
    label: "Mid-size Companies",
    icon: "🏢",
    description: "Established growing companies",
  },
  {
    value: "MNC",
    label: "MNCs",
    icon: "🌍",
    description: "Large multinational corporations",
  },
  {
    value: "FAANG",
    label: "FAANG",
    icon: "⭐",
    description: "Top tech giants (Meta, Apple, Amazon, Netflix, Google)",
  },
];

export const INTERVIEW_CATEGORIES: {
  value: InterviewCategory;
  label: string;
  icon: string;
  description: string;
}[] = [
  {
    value: "MNC",
    label: "MNC Interview Prep",
    icon: "🏢",
    description: "DSA + System Design + Tech",
  },
  {
    value: "MERN",
    label: "MERN Stack Prep",
    icon: "⚛️",
    description: "JS + React + Node + DSA",
  },
  {
    value: "CollegePlacement",
    label: "College Placement",
    icon: "🎓",
    description: "DSA + Aptitude + Basics",
  },
  {
    value: "DSA",
    label: "DSA Focus",
    icon: "🧠",
    description: "Data Structures & Algorithms",
  },
  {
    value: "SystemDesign",
    label: "System Design",
    icon: "🏗️",
    description: "Architecture & Design",
  },
  {
    value: "GeneralTech",
    label: "General Tech",
    icon: "💻",
    description: "General technical questions",
  },
];

export const DSA_GOALS = [
  {
    value: "Product-based",
    label: "Product-based Companies",
    icon: "🚀",
    description: "Targeting top-tier product companies",
  },
  {
    value: "Startups",
    label: "Startups",
    icon: "🏢",
    description: "Focused on high-growth startup roles",
  },
];

export const DSA_TIMELINES = [
  {
    value: "1Month",
    label: "1 Month",
    description: "Last-minute prep",
    icon: "🚀",
  },
  {
    value: "3Months",
    label: "3 Months",
    description: "Quick interview prep",
    icon: "⚡",
  },
  {
    value: "6Months",
    label: "6 Months",
    description: "Comprehensive preparation",
    icon: "🎯",
    popular: true,
  },
  {
    value: "1Year",
    label: "1 Year",
    description: "Deep dive / Foundational",
    icon: "🌟",
  },
];

export const DSA_EXPERIENCE_LEVELS = [
  { value: "Fresher (0-1 yr)", label: "Fresher (0-1 yr)", icon: "🌱" },
  { value: "Junior (1-3 yr)", label: "Junior (1-3 yr)", icon: "💼" },
  { value: "Mid (3-5 yr)", label: "Mid (3-5 yr)", icon: "🚀" },
  { value: "Senior (5+ yrs)", label: "Senior (5+ yrs)", icon: "👔" },
];

export const DSA_TOPICS_LIST = [
  "ARRAY",
  "PREFIX_SUM",
  "HASHMAP",
  "TWO_POINTERS",
  "SLIDING_WINDOW",
  "BINARY_SEARCH",
  "SORTING",
  "LINKED_LIST",
  "STACK",
  "QUEUE",
  "TREE",
  "BINARY_TREE",
  "BST",
  "GRAPH",
  "DFS",
  "BFS",
  "BACKTRACKING",
  "DYNAMIC_PROGRAMMING",
  "GREEDY",
  "STRING",
  "MATH",
  "BIT_MANIPULATION",
  "TRIE",
  "HEAP",
  "UNION_FIND",
];
