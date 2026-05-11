import {
  BookOpen,
  Briefcase,
  Clipboard,
  ClipboardList,
  Code,
  FileText,
  Users,
} from "lucide-react";

export interface ResourceItem {
  title: string;
  desc: string;
  href: string;
  Icon: any;
  isAvailable: boolean;
}

export const CAMPUS_PREP_RESOURCES: ResourceItem[] = [
  {
    title: "Aptitude Practice",
    desc: "Daily challenges, streak tracking & top practice links for Quant, Verbal, DI, and Reasoning.",
    href: "/aptitude",
    Icon: BookOpen,
    isAvailable: false,
  },
  {
    title: "Quizes",
    desc: "Topic-wise quizes with instant results and performance tracking.",
    href: "/dashboard/quizzes",
    Icon: ClipboardList,
    isAvailable: true,
  },
  {
    title: "Interview Prep",
    desc: "CS Fundamentals, HR tips, mock interview questions, and more.",
    href: "/interview-prep",
    Icon: Code,
    isAvailable: false,
  },
  {
    title: "DSA Preparation",
    desc: "Playlists, coding sites, and problem sets for hands-on algorithm practice.",
    href: "/dsa",
    Icon: FileText,
    isAvailable: false,
  },
  {
    title: "Resume Zone",
    desc: "Live preview builder and free templates for standout resumes.",
    href: "/resume",
    Icon: Clipboard,
    isAvailable: false,
  },
  {
    title: "Interview Experiences",
    desc: "Real candidate stories and advice from recent interviews.",
    href: "/experiences",
    Icon: Users,
    isAvailable: false,
  },
  {
    title: "Company Hub",
    desc: "Practice company-specific questions, get campus ready.",
    href: "/companies",
    Icon: Briefcase,
    isAvailable: false,
  },
];

export const TOPIC_LABELS: Record<string, string> = {
  ARRAY: "Arrays",
  STRING: "Strings",
  HASHMAP: "HashMap / Hashing",
  MATH: "Math",
  RECURSION: "Recursion",
  SORTING: "Sorting",
  BINARY_SEARCH: "Binary Search",
  TWO_POINTERS: "Two Pointers",
  SLIDING_WINDOW: "Sliding Window",
  STACK: "Stack",
  MONOTONIC_STACK: "Monotonic Stack",
  QUEUE: "Queue",
  LINKED_LIST: "Linked List",
  HEAP: "Heap / Priority Queue",
  TREE: "Tree",
  TRIE: "Trie",
  DFS: "DFS (Depth First Search)",
  BFS: "BFS (Breadth First Search)",
  GRAPH: "Graph",
  BACKTRACKING: "Backtracking",
  GREEDY: "Greedy",
  DYNAMIC_PROGRAMMING: "Dynamic Programming",
  PREFIX_SUM: "Prefix Sum",
  BINARY_TREE: "Binary Tree",
  BST: "Binary Search Tree",
  UNION_FIND: "Union Find",
  BIT_MANIPULATION: "Bit Manipulation",
  DESIGN: "Design",
  SIMULATION: "Simulation",
};
