import {
  DsaUpsellModal,
  LoadingSpinner,
  QuestionDetailPanel,
  SEO,
  StudyGuideReader,
} from "@tbe/components";
import { DSA_STUDY_GUIDE_CONFIGS, routes, TOPIC_LABELS } from "@tbe/constants";
import { useGamification, useGamificationFeedback } from "@tbe/gamification";
import {
  useAnalytics,
  useDsaCompletedQuestions,
  useDsaQuestionsForTopic,
  useDsaTopicSummaries,
  useStudyGuideTopic,
  useUser,
} from "@tbe/hooks";
import type { DsaQuestion, PageProps } from "@tbe/interface";
import type { StudyGuideModel } from "@tbe/types";
import {
  cn,
  decodeDsaTopicFromUrl,
  encodeDsaQuestionTitleForUrl,
  encodeDsaTopicForUrl,
  findDsaQuestionByUrlSlug,
  getPreFetchProps,
} from "@tbe/utils";
import { LayoutGroup, motion } from "framer-motion";
import {
  ArrowDownUp,
  Bookmark,
  BookOpen,
  Calculator,
  ChartNoAxesCombined,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  GitBranch,
  Grid2X2,
  Hash,
  Layers,
  Layers2,
  Lightbulb,
  List,
  ListOrdered,
  Lock,
  MoveHorizontal,
  Network,
  PanelTop,
  Repeat,
  Route,
  Search,
  Share2,
  Text,
  Undo2,
  Workflow,
  X,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

/* -------------------------------------------------------------------------- */
/* Topic UI Config matching Exact Lucide Icon Spec & Pastel Badges            */
/* -------------------------------------------------------------------------- */
interface TopicMetadata {
  name: string;
  icon: any;
  iconBg: string;
  iconColor: string;
  borderColor: string;
  description: string;
}

const TOPIC_CONFIG: Record<string, TopicMetadata> = {
  ARRAY: {
    name: "Arrays",
    icon: List,
    iconBg: "bg-orange-50 dark:bg-orange-950/40",
    iconColor: "text-orange-500",
    borderColor: "border-orange-100 dark:border-orange-900/40",
    description: "Most important topic for interviews",
  },
  STRING: {
    name: "Strings",
    icon: Text,
    iconBg: "bg-purple-50 dark:bg-purple-950/40",
    iconColor: "text-purple-500",
    borderColor: "border-purple-100 dark:border-purple-900/40",
    description: "Sequence of characters & pattern matching algorithms",
  },
  HASHMAP: {
    name: "HashMap",
    icon: Hash,
    iconBg: "bg-emerald-50 dark:bg-emerald-950/40",
    iconColor: "text-emerald-500",
    borderColor: "border-emerald-100 dark:border-emerald-900/40",
    description: "Key-value hashing for O(1) average lookup",
  },
  MATH: {
    name: "Math",
    icon: Calculator,
    iconBg: "bg-blue-50 dark:bg-blue-950/40",
    iconColor: "text-blue-500",
    borderColor: "border-blue-100 dark:border-blue-900/40",
    description: "Number theory, bitwise math, and combinatorics",
  },
  RECURSION: {
    name: "Recursion",
    icon: Repeat,
    iconBg: "bg-rose-50 dark:bg-rose-950/40",
    iconColor: "text-rose-500",
    borderColor: "border-rose-100 dark:border-rose-900/40",
    description: "Recursive divide and conquer subproblem breakdowns",
  },
  SORTING: {
    name: "Sorting",
    icon: ArrowDownUp,
    iconBg: "bg-amber-50 dark:bg-amber-950/40",
    iconColor: "text-amber-500",
    borderColor: "border-amber-100 dark:border-amber-900/40",
    description: "QuickSort, MergeSort, heapsort, and partitioning",
  },
  BINARY_SEARCH: {
    name: "Binary Search",
    icon: Search,
    iconBg: "bg-violet-50 dark:bg-violet-950/40",
    iconColor: "text-violet-500",
    borderColor: "border-violet-100 dark:border-violet-900/40",
    description: "O(log n) search space reduction & binary search on answer",
  },
  TWO_POINTERS: {
    name: "Two Pointers",
    icon: MoveHorizontal,
    iconBg: "bg-teal-50 dark:bg-teal-950/40",
    iconColor: "text-teal-500",
    borderColor: "border-teal-100 dark:border-teal-900/40",
    description: "Opposite and same-direction pointer traversal",
  },
  SLIDING_WINDOW: {
    name: "Sliding Window",
    icon: PanelTop,
    iconBg: "bg-red-50 dark:bg-red-950/40",
    iconColor: "text-red-500",
    borderColor: "border-red-100 dark:border-red-900/40",
    description: "Fixed and variable contiguous subarray tracking",
  },
  STACK: {
    name: "Stack",
    icon: Layers,
    iconBg: "bg-sky-50 dark:bg-sky-950/40",
    iconColor: "text-sky-500",
    borderColor: "border-sky-100 dark:border-sky-900/40",
    description: "LIFO evaluation, parentheses, monotonic stacks",
  },
  MONOTONIC_STACK: {
    name: "Monotonic Stack",
    icon: Layers2,
    iconBg: "bg-indigo-50 dark:bg-indigo-950/40",
    iconColor: "text-indigo-500",
    borderColor: "border-indigo-100 dark:border-indigo-900/40",
    description: "Ordered stacks for next greater/smaller element",
  },
  QUEUE: {
    name: "Queue",
    icon: ListOrdered,
    iconBg: "bg-yellow-50 dark:bg-yellow-950/40",
    iconColor: "text-yellow-600",
    borderColor: "border-yellow-100 dark:border-yellow-900/40",
    description: "FIFO buffer processing and double-ended queues",
  },
  LINKED_LIST: {
    name: "Linked List",
    icon: Network,
    iconBg: "bg-purple-50 dark:bg-purple-950/40",
    iconColor: "text-purple-600",
    borderColor: "border-purple-100 dark:border-purple-900/40",
    description: "Pointer re-linking, reversal, fast/slow cycle detection",
  },
  HEAP: {
    name: "Heap",
    icon: ChartNoAxesCombined,
    iconBg: "bg-cyan-50 dark:bg-cyan-950/40",
    iconColor: "text-cyan-600",
    borderColor: "border-cyan-100 dark:border-cyan-900/40",
    description: "Min/Max heaps, top-K elements, priority scheduling",
  },
  TREE: {
    name: "Trees",
    icon: GitBranch,
    iconBg: "bg-rose-50 dark:bg-rose-950/40",
    iconColor: "text-rose-500",
    borderColor: "border-rose-100 dark:border-rose-900/40",
    description: "Hierarchical traversal, BSTs, lowest common ancestor",
  },
  TRIE: {
    name: "Trie",
    icon: Workflow,
    iconBg: "bg-pink-50 dark:bg-pink-950/40",
    iconColor: "text-pink-600",
    borderColor: "border-pink-100 dark:border-pink-900/40",
    description: "Prefix trees for efficient string search and autocomplete",
  },
  BFS: {
    name: "BFS",
    icon: Route,
    iconBg: "bg-lime-50 dark:bg-lime-950/40",
    iconColor: "text-lime-600",
    borderColor: "border-lime-100 dark:border-lime-900/40",
    description: "Breadth-first search for shortest path and level order",
  },
  GRAPH: {
    name: "Graphs",
    icon: Share2,
    iconBg: "bg-emerald-50 dark:bg-emerald-950/40",
    iconColor: "text-emerald-600",
    borderColor: "border-emerald-100 dark:border-emerald-900/40",
    description: "BFS/DFS, Dijkstra, topological sort, union-find",
  },
  BACKTRACKING: {
    name: "Backtracking",
    icon: Undo2,
    iconBg: "bg-orange-50 dark:bg-orange-950/40",
    iconColor: "text-orange-600",
    borderColor: "border-orange-100 dark:border-orange-900/40",
    description: "Combinatorial exploration with state rollback",
  },
  GREEDY: {
    name: "Greedy",
    icon: Zap,
    iconBg: "bg-amber-50 dark:bg-amber-950/40",
    iconColor: "text-amber-500",
    borderColor: "border-amber-100 dark:border-amber-900/40",
    description: "Locally optimal decision making algorithms",
  },
  DYNAMIC_PROGRAMMING: {
    name: "Dynamic Programming",
    icon: Grid2X2,
    iconBg: "bg-blue-50 dark:bg-blue-950/40",
    iconColor: "text-blue-600",
    borderColor: "border-blue-100 dark:border-blue-900/40",
    description: "Memoization, tabulation, optimal substructure",
  },
};

const CANONICAL_TOPIC_COUNTS: Record<string, number> = {
  ARRAY: 78,
  STRING: 46,
  DYNAMIC_PROGRAMMING: 41,
  GRAPH: 39,
  GREEDY: 38,
  SORTING: 35,
  RECURSION: 31,
  LINKED_LIST: 26,
  BINARY_SEARCH: 24,
  HASHMAP: 21,
  TREE: 19,
  STACK: 19,
  TWO_POINTERS: 18,
  SLIDING_WINDOW: 18,
  MONOTONIC_STACK: 17,
  QUEUE: 16,
  MATH: 14,
  HEAP: 13,
  BACKTRACKING: 13,
  BFS: 10,
  TRIE: 9,
};

function getTopicMeta(topicKey: string): TopicMetadata {
  const normKey = topicKey.toUpperCase().replace(/\s+/g, "_");
  if (TOPIC_CONFIG[normKey]) return TOPIC_CONFIG[normKey];

  return {
    name: TOPIC_LABELS[topicKey] || topicKey,
    icon: Grid2X2,
    iconBg: "bg-slate-50 dark:bg-[#1A1A20]",
    iconColor: "text-slate-600 dark:text-slate-400",
    borderColor: "border-slate-100 dark:border-[#26262E]",
    description: `Core patterns & interview problems on ${TOPIC_LABELS[topicKey] || topicKey}`,
  };
}

/* -------------------------------------------------------------------------- */
/* Difficulty Badges (Slim, Compact)                                          */
/* -------------------------------------------------------------------------- */
function DifficultyPill({ difficulty }: { difficulty?: string }) {
  const norm = (difficulty || "MEDIUM").toUpperCase();
  if (norm === "EASY") {
    return (
      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 shrink-0">
        Easy
      </span>
    );
  }
  if (norm === "HARD") {
    return (
      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 shrink-0">
        Hard
      </span>
    );
  }
  return (
    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 shrink-0">
      Medium
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* Question Row Skeleton Loader (Exact Slim Fit to Question Component)        */
/* -------------------------------------------------------------------------- */
function QuestionListSkeleton() {
  const skeletonRows = [
    { titleWidth: "w-44 sm:w-60" },
    { titleWidth: "w-36 sm:w-48" },
    { titleWidth: "w-48 sm:w-68" },
    { titleWidth: "w-32 sm:w-44" },
    { titleWidth: "w-40 sm:w-56" },
    { titleWidth: "w-44 sm:w-52" },
  ];

  return (
    <div className="divide-y divide-slate-100 dark:divide-[#1C1C22] animate-pulse">
      {skeletonRows.map((row, idx) => (
        <div
          key={idx}
          className="flex items-center justify-between gap-3 px-2 sm:px-3 py-1.5"
        >
          {/* 1. LEFT: Number placeholder + Square Checkbox placeholder + Title bar */}
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
            <span className="w-4 text-right text-[11px] font-medium text-slate-300 dark:text-slate-700 select-none shrink-0">
              {idx + 1}.
            </span>
            <div className="w-3.5 h-3.5 rounded-[3px] bg-slate-200/90 dark:bg-[#202026] shrink-0" />
            <div
              className={cn(
                "h-3 rounded-sm bg-slate-200/90 dark:bg-[#202026] shrink-0",
                row.titleWidth,
              )}
            />
          </div>

          {/* 2. CENTER: Difficulty pill placeholder + Topic tag placeholder */}
          <div className="flex items-center justify-center gap-1.5 shrink-0 px-2">
            <div className="w-10 h-3.5 rounded bg-slate-200/90 dark:bg-[#202026] shrink-0" />
            <div className="w-12 h-3.5 rounded bg-slate-200/90 dark:bg-[#202026] shrink-0 hidden sm:inline-block" />
          </div>

          {/* 3. RIGHT: Bookmark placeholder + Solve text placeholder */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-3.5 h-3.5 rounded bg-slate-200/90 dark:bg-[#202026] shrink-0 mx-1" />
            <div className="w-8 h-3.5 rounded bg-slate-200/90 dark:bg-[#202026] shrink-0" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Expanded Topic View (Slim Spaced-Between Row: Left Title, Center Easy/Topic, Right Save/Solve) */
/* -------------------------------------------------------------------------- */
interface ExpandedTopicCardProps {
  topicKey: string;
  topicMeta: TopicMetadata;
  totalCount: number;
  solvedCount: number;
  onCollapse: () => void;
  completedIds: (string | number)[];
  onToggleComplete: (questionId: string | number) => void;
  onSelectQuestion: (question: DsaQuestion) => void;
  onLockedClick: () => void;
  onCountsDiscovered?: (
    topicKey: string,
    total: number,
    solved: number,
  ) => void;
}

function ExpandedTopicCard({
  topicKey,
  topicMeta,
  totalCount,
  solvedCount,
  onCollapse,
  completedIds,
  onToggleComplete,
  onSelectQuestion,
  onLockedClick,
  onCountsDiscovered,
}: ExpandedTopicCardProps) {
  const normKey = topicKey ? topicKey.toUpperCase().replace(/\s+/g, "_") : "";
  const guideConfig = normKey ? DSA_STUDY_GUIDE_CONFIGS[normKey] : null;

  const [viewMode, setViewMode] = useState<"questions" | "guide">("questions");
  const [activeSectionId, setActiveSectionId] = useState<string>("");

  const { questions, loading } = useDsaQuestionsForTopic(topicKey, {
    productType: "DSA_YATRA",
  });

  const { data: studyGuideData, isLoading: guideLoading } = useStudyGuideTopic(
    viewMode === "guide" ? topicKey : "",
  );

  useEffect(() => {
    if (guideConfig?.sections) {
      const firstSection = guideConfig.sections.find(
        (s) => "id" in s && Boolean(s.id),
      );
      if (firstSection && "id" in firstSection) {
        setActiveSectionId(firstSection.id);
      }
    }
  }, [topicKey, guideConfig]);

  const [showAll, setShowAll] = useState(false);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());

  const completedSet = useMemo(
    () => new Set(completedIds.map(String)),
    [completedIds],
  );

  const toggleBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const displayedQuestions = useMemo(() => {
    if (showAll || questions.length <= 6) return questions;
    return questions.slice(0, 6);
  }, [questions, showAll]);

  const currentSolvedCount = useMemo(() => {
    if (!questions.length) return solvedCount;
    return questions.filter((q) =>
      completedSet.has(String(q.id ?? q._id ?? q.name)),
    ).length;
  }, [questions, completedSet, solvedCount]);

  const currentTotalCount =
    questions.length > 0 ? questions.length : totalCount;

  useEffect(() => {
    if (questions.length > 0 && onCountsDiscovered) {
      onCountsDiscovered(topicKey, questions.length, currentSolvedCount);
    }
  }, [questions.length, currentSolvedCount, topicKey, onCountsDiscovered]);

  const IconComponent = topicMeta.icon;

  return (
    <div className="rounded-xl border border-slate-200/90 dark:border-[#24242A] bg-white dark:bg-[#131316] overflow-hidden shadow-2xs">
      {/* Top Header of Expanded Card - Reduced spacing between icon & border bg */}
      <div className="flex items-center justify-between px-3 py-2 sm:px-3.5 sm:py-2.5 border-b border-slate-100 dark:border-[#1E1E24]">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className={`w-8 h-8 rounded-lg ${topicMeta.iconBg} border ${topicMeta.borderColor} flex items-center justify-center shrink-0`}
          >
            <IconComponent size={21} className={topicMeta.iconColor} />
          </div>

          <div className="min-w-0">
            <h2 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white leading-tight">
              {topicMeta.name}
            </h2>
            <p className="text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-500 font-medium truncate mt-0.5">
              {currentTotalCount} problems • {currentSolvedCount} solved •{" "}
              {topicMeta.description}
            </p>
          </div>
        </div>

        {/* Right side: Study Guide (with Bulb icon, no bg) / Questions toggle + Collapse button */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {viewMode === "questions" ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setViewMode("guide");
              }}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#FF4D4D] dark:text-slate-400 dark:hover:text-[#FF4D4D] transition-colors cursor-pointer py-0.5 px-1 bg-transparent border-0"
              title={`View ${topicMeta.name} Study Guide`}
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 shrink-0" />
              <span>Study Guide</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setViewMode("questions");
              }}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#FF4D4D] dark:text-slate-300 dark:hover:text-[#FF4D4D] transition-colors cursor-pointer py-0.5 px-1 bg-transparent border-0"
              title="Show Questions List"
            >
              <List className="w-3.5 h-3.5 text-[#FF4D4D] shrink-0" />
              <span>Questions ({currentTotalCount})</span>
            </button>
          )}

          <button
            type="button"
            onClick={onCollapse}
            className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#1E1E24] transition-colors"
            title="Collapse topic"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
        </div>
      </div>

      {viewMode === "questions" ? (
        /* Questions List - Slim spaced row: Left Title, Center Easy/Topics, Right Save/Solve */
        <div className="p-1 sm:p-1.5 divide-y divide-slate-100 dark:divide-[#1C1C22]">
          {loading ? (
            <QuestionListSkeleton />
          ) : questions.length === 0 ? (
            <div className="text-center py-5 text-xs text-slate-400">
              No questions available for this topic yet.
            </div>
          ) : (
            displayedQuestions.map((q, idx) => {
              const qKey = String(q.id ?? q._id ?? q.name);
              const isCompleted = completedSet.has(qKey);
              const isBookmarked = bookmarkedIds.has(qKey);
              const isLocked = Boolean(q.isLocked);

              return (
                <motion.div
                  key={qKey}
                  initial={{ opacity: 0, y: 3 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.16,
                    delay: Math.min(idx * 0.02, 0.15),
                  }}
                  className={cn(
                    "flex items-center justify-between gap-3 px-2 sm:px-3 py-1.5 transition-colors group hover:bg-slate-50 dark:hover:bg-[#16161A]",
                    isCompleted && "bg-slate-50/40 dark:bg-[#141418]/40",
                  )}
                >
                  {/* 1. LEFT: Number + Small Green Checkbox Square + Title */}
                  <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
                    <span className="w-4 text-right text-[11px] font-medium text-slate-400 dark:text-slate-500 select-none shrink-0">
                      {idx + 1}.
                    </span>

                    {/* Small Square Checkbox with Green Fill when completed */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isLocked) onLockedClick();
                        else onToggleComplete(q.id ?? q._id ?? q.name);
                      }}
                      className={cn(
                        "w-3.5 h-3.5 rounded-[3px] border flex items-center justify-center shrink-0 transition-colors cursor-pointer",
                        isCompleted
                          ? "bg-emerald-500 border-emerald-500 text-white"
                          : "border-slate-300 dark:border-[#33333D] hover:border-emerald-500 dark:hover:border-emerald-500 bg-white dark:bg-[#16161A]",
                      )}
                      title={
                        isCompleted
                          ? "Completed (click to uncheck)"
                          : "Click to mark completed"
                      }
                    >
                      {isCompleted && (
                        <Check className="w-2.5 h-2.5 stroke-[3] text-white" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (isLocked) onLockedClick();
                        else onSelectQuestion(q);
                      }}
                      className="font-medium text-xs sm:text-sm text-slate-800 dark:text-slate-200 hover:text-emerald-500 dark:hover:emerald-400 transition-colors truncate text-left focus:outline-none"
                    >
                      <span
                        className={
                          isCompleted
                            ? "line-through text-slate-400 dark:text-slate-500 font-normal"
                            : ""
                        }
                      >
                        {q.name}
                      </span>
                    </button>
                  </div>

                  {/* 2. CENTER: Difficulty (Easy/Med/Hard) + Topic Tags */}
                  <div className="flex items-center justify-center gap-1.5 shrink-0 px-2">
                    <DifficultyPill difficulty={q.difficultyLevel} />

                    {topicMeta.name && (
                      <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-[#1E1E24] text-slate-500 dark:text-slate-400">
                        {topicMeta.name}
                      </span>
                    )}
                    {q.topics &&
                      q.topics
                        .filter(
                          (t) =>
                            t.toLowerCase() !== topicKey.toLowerCase() &&
                            t.toLowerCase() !== topicMeta.name.toLowerCase(),
                        )
                        .slice(0, 1)
                        .map((subT) => (
                          <span
                            key={subT}
                            className="hidden md:inline-block px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-[#1E1E24] text-slate-500 dark:text-slate-400"
                          >
                            {TOPIC_LABELS[subT] || subT}
                          </span>
                        ))}
                  </div>

                  {/* 3. RIGHT: Save (Bookmark) & Solve button */}
                  <div className="flex items-center justify-end gap-2.5 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => toggleBookmark(qKey, e)}
                      className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                      title={
                        isBookmarked
                          ? "Saved (click to unsave)"
                          : "Save question"
                      }
                    >
                      <Bookmark
                        className={cn(
                          "w-3.5 h-3.5",
                          isBookmarked
                            ? "fill-amber-500 text-amber-500"
                            : "text-slate-400",
                        )}
                      />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (isLocked) onLockedClick();
                        else onSelectQuestion(q);
                      }}
                      className={cn(
                        "text-xs font-semibold px-1 py-0.5 flex items-center gap-1 transition-colors cursor-pointer",
                        isLocked
                          ? "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
                          : "text-[#FF4D4D] hover:underline",
                      )}
                      title={isLocked ? "Locked question" : "Solve question"}
                    >
                      {isLocked ? (
                        <Lock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                      ) : (
                        <span>Solve</span>
                      )}
                    </button>
                  </div>
                </motion.div>
              );
            })
          )}

          {currentTotalCount > 6 && (
            <div className="py-1 text-center">
              <button
                type="button"
                onClick={() => setShowAll(!showAll)}
                className="w-full py-1 rounded border border-slate-200/80 dark:border-[#24242A] text-[11px] font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#18181D] transition-colors flex items-center justify-center gap-1"
              >
                <span>
                  {showAll
                    ? "Show Fewer Questions"
                    : `View All ${currentTotalCount} Problems`}
                </span>
                <ChevronDown
                  className={cn(
                    "w-3 h-3 transition-transform",
                    showAll ? "rotate-180" : "",
                  )}
                />
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Study Guide View inside Card */
        <div className="flex flex-col">
          {/* Section Tabs Bar */}
          {guideConfig?.sections && guideConfig.sections.length > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-2 border-b border-slate-100 dark:border-[#1E1E24] overflow-x-auto no-scrollbar bg-slate-50/50 dark:bg-[#101014]/50 shrink-0">
              {guideConfig.sections.map((sec, idx) => {
                if ("divider" in sec) {
                  if (sec.divider === null) {
                    return (
                      <div
                        key={`div-${idx}`}
                        className="h-3.5 w-[1px] bg-slate-200 dark:bg-[#2A2A34] mx-1 shrink-0"
                      />
                    );
                  }
                  return (
                    <span
                      key={`div-${idx}`}
                      className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider px-1 shrink-0"
                    >
                      {sec.divider}
                    </span>
                  );
                }

                const isActive = activeSectionId === sec.id;
                return (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => setActiveSectionId(sec.id)}
                    className={cn(
                      "px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition-colors shrink-0 cursor-pointer",
                      isActive
                        ? "bg-[#FF4D4D] text-white shadow-xs font-bold"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-[#1E1E24]",
                    )}
                  >
                    {sec.label}
                  </button>
                );
              })}
            </div>
          )}

          {/* Guide Reader Content */}
          <div className="min-h-[300px] max-h-[650px] flex flex-col">
            {guideLoading ? (
              <div className="p-4 sm:p-6 space-y-3 animate-pulse">
                <div className="h-5 w-1/4 bg-slate-200 dark:bg-[#202026] rounded-md" />
                <div className="h-3.5 w-3/4 bg-slate-200 dark:bg-[#202026] rounded" />
                <div className="h-3.5 w-1/2 bg-slate-200 dark:bg-[#202026] rounded" />
                <div className="h-28 w-full bg-slate-200 dark:bg-[#202026] rounded-xl mt-3" />
              </div>
            ) : studyGuideData ? (
              <StudyGuideReader
                topic={topicKey}
                sectionId={activeSectionId}
                data={studyGuideData as StudyGuideModel}
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center space-y-2">
                <BookOpen className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                <p className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">
                  Study Guide Coming Soon
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 max-w-sm">
                  Curated patterns, visual walkthrough, and cheatsheet for{" "}
                  {topicMeta.name} are being prepared.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Unexpanded Topic Card with Reduced Spacing between Icon & Border           */
/* -------------------------------------------------------------------------- */
interface TopicGridCardProps {
  topicKey: string;
  topicMeta: TopicMetadata;
  totalCount: number;
  solvedCount: number;
  onSelect: () => void;
}

function TopicGridCard({
  topicMeta,
  totalCount,
  solvedCount,
  onSelect,
}: TopicGridCardProps) {
  const IconComponent = topicMeta.icon;

  return (
    <button
      type="button"
      onClick={onSelect}
      className="w-full text-left rounded-lg border border-slate-200/90 dark:border-[#24242A] bg-white dark:bg-[#131316] px-2.5 py-2 flex items-center justify-between gap-2 shadow-2xs hover:shadow-xs hover:border-slate-300 dark:hover:border-[#33333C] transition-all duration-150 group cursor-pointer"
    >
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        {/* Topic Icon - Reduced spacing between icon and border bg */}
        <div
          className={`w-8 h-8 rounded-lg ${topicMeta.iconBg} border ${topicMeta.borderColor} flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform`}
        >
          <IconComponent size={21} className={topicMeta.iconColor} />
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate group-hover:text-[#FF4D4D] transition-colors">
            {topicMeta.name}
          </h3>
          <p className="text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-500 font-medium truncate mt-0.5">
            {solvedCount} / {totalCount} solved
          </p>
        </div>
      </div>

      <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 group-hover:text-slate-600 dark:group-hover:text-slate-300 group-hover:translate-x-0.5 transition-all shrink-0" />
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/* Main Sheets Client Component                                               */
/* -------------------------------------------------------------------------- */
function SheetsClient() {
  const router = useRouter();
  const { user, loading: userLoading } = useUser();
  const { celebrate } = useGamificationFeedback();
  const { refetch: refetchGamification } = useGamification();
  const { trackEvent } = useAnalytics();

  const [expandedTopic, setExpandedTopic] = useState<string | null>("ARRAY");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedQuestion, setSelectedQuestion] = useState<DsaQuestion | null>(
    null,
  );
  const [showPayment, setShowPayment] = useState(false);
  const closedQuestionSlugRef = useRef<string | null>(null);

  const { questions: activeTopicQuestions } = useDsaQuestionsForTopic(
    expandedTopic,
    { productType: "DSA_YATRA" },
  );

  const [topicOverrides, setTopicOverrides] = useState<
    Record<string, { total: number; solved: number }>
  >({});

  const handleUpdateTopicCounts = useCallback(
    (topicKey: string, total: number, solved: number) => {
      setTopicOverrides((prev) => {
        if (
          prev[topicKey]?.total === total &&
          prev[topicKey]?.solved === solved
        ) {
          return prev;
        }
        return {
          ...prev,
          [topicKey]: { total, solved },
        };
      });
    },
    [],
  );

  // Fetch topics summary from backend
  const {
    data: topicRows,
    isLoading: topicsLoading,
    isError: topicsError,
    error: topicsErrorVal,
  } = useDsaTopicSummaries("DSA_YATRA");

  // Fetch completed questions
  const { completedIds, toggleComplete } = useDsaCompletedQuestions({
    userId: user?.id,
  });

  const handleToggleComplete = useCallback(
    async (questionId: string | number) => {
      const idStr = String(questionId);
      const willComplete = !completedIds.includes(questionId);
      const gamification = await toggleComplete(questionId);

      if (willComplete) {
        celebrate(gamification, {
          message: "DSA question solved! Great work!",
        });
        trackEvent({
          action: "DSA_QUESTION_COMPLETED",
          category: "DSA Yatra",
          label: idStr,
        });
      }

      await refetchGamification();
    },
    [completedIds, toggleComplete, refetchGamification, celebrate, trackEvent],
  );

  // Read topic from URL on initial load / navigation
  useEffect(() => {
    if (!router.isReady) return;
    const rawTopic = router.query.topic;
    if (rawTopic && typeof rawTopic === "string") {
      const decoded = decodeDsaTopicFromUrl(rawTopic);
      if (decoded) {
        setExpandedTopic(decoded);
      }
    }
  }, [router.isReady, router.query.topic]);

  // Synchronize question from URL (e.g., initial page load, direct link, or browser back/forward)
  useEffect(() => {
    if (!router.isReady) return;
    const qSlug = router.query.question;
    if (typeof qSlug === "string" && qSlug && activeTopicQuestions.length > 0) {
      if (closedQuestionSlugRef.current === qSlug) return;
      const found = findDsaQuestionByUrlSlug(activeTopicQuestions, qSlug);
      if (found) {
        setSelectedQuestion(found);
      } else {
        closedQuestionSlugRef.current = qSlug;
      }
    } else if (!qSlug) {
      closedQuestionSlugRef.current = null;
      setSelectedQuestion(null);
    }
  }, [router.isReady, router.query.question, activeTopicQuestions]);

  const handleSelectTopic = useCallback(
    (topicKey: string) => {
      const nextTopic = expandedTopic === topicKey ? null : topicKey;
      setExpandedTopic(nextTopic);
      if (nextTopic) {
        void router.replace(
          {
            pathname: "/sheets",
            query: {
              topic: encodeDsaTopicForUrl(nextTopic),
            },
          },
          undefined,
          { shallow: true },
        );
      } else {
        void router.replace({ pathname: "/sheets" }, undefined, {
          shallow: true,
        });
      }
    },
    [expandedTopic, router],
  );

  const handleSelectQuestion = useCallback(
    (question: DsaQuestion, topicKey?: string) => {
      closedQuestionSlugRef.current = null;
      setSelectedQuestion(question);
      const activeTopic = topicKey || expandedTopic || "ARRAY";
      void router.replace(
        {
          pathname: "/sheets",
          query: {
            topic: encodeDsaTopicForUrl(activeTopic),
            question: encodeDsaQuestionTitleForUrl(question.name),
          },
        },
        undefined,
        { shallow: true },
      );
    },
    [expandedTopic, router],
  );

  const handleCloseQuestion = useCallback(() => {
    const currentSlug =
      typeof router.query.question === "string" ? router.query.question : "";
    closedQuestionSlugRef.current = currentSlug || "__closed__";
    setSelectedQuestion(null);
    if (expandedTopic) {
      void router.replace(
        {
          pathname: "/sheets",
          query: {
            topic: encodeDsaTopicForUrl(expandedTopic),
          },
        },
        undefined,
        { shallow: true },
      );
    } else {
      void router.replace({ pathname: "/sheets" }, undefined, {
        shallow: true,
      });
    }
  }, [expandedTopic, router]);

  const topics = useMemo(() => {
    return (topicRows ?? []).map((t) => {
      const normKey = t.topic.toUpperCase().replace(/\s+/g, "_");
      const accurateCount =
        topicOverrides[normKey]?.total ??
        CANONICAL_TOPIC_COUNTS[normKey] ??
        t.count;

      return {
        topic: t.topic,
        count: accurateCount,
        solved: topicOverrides[normKey]?.solved ?? t.solved,
        meta: getTopicMeta(t.topic),
      };
    });
  }, [topicRows, topicOverrides]);

  const filteredTopics = useMemo(() => {
    if (!searchQuery.trim()) return topics;
    const q = searchQuery.toLowerCase();
    return topics.filter(
      (t) =>
        t.meta.name.toLowerCase().includes(q) ||
        t.topic.toLowerCase().includes(q),
    );
  }, [topics, searchQuery]);

  const validCompletedIds = useMemo(() => {
    return (completedIds || []).filter((id) =>
      /^[0-9a-fA-F]{24}$/.test(String(id)),
    );
  }, [completedIds]);

  const totalQuestions = 399;
  const totalSolved = validCompletedIds.length;
  const overallPercentage = Math.min(
    100,
    Math.round((totalSolved / totalQuestions) * 100),
  );

  if (
    topicsLoading ||
    userLoading ||
    (router.isReady &&
      typeof router.query.question === "string" &&
      Boolean(router.query.question) &&
      !selectedQuestion &&
      closedQuestionSlugRef.current !== router.query.question)
  ) {
    return (
      <div className="flex items-center justify-center h-full min-h-[500px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (topicsError) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center p-6">
        <p className="text-base font-semibold text-[#FF4D4D] mb-2">
          Unable to load DSA problem sheets
        </p>
        <p className="text-xs text-slate-500 max-w-sm mb-4">
          {topicsErrorVal instanceof Error
            ? topicsErrorVal.message
            : "Failed to connect to server"}
        </p>
        <button
          type="button"
          onClick={() => router.reload()}
          className="px-4 py-2 text-xs font-bold rounded-lg bg-[#FF4D4D] text-white hover:bg-[#FF3B30] transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Full Page View for Selected Question (Single clean card)
  if (selectedQuestion) {
    const isCompleted = completedIds.includes(
      selectedQuestion.id ?? selectedQuestion._id ?? selectedQuestion.name,
    );

    return (
      <div className="w-full h-full overflow-y-auto px-3 sm:px-6 py-2 sm:py-3 space-y-3 scrollbar-thin-grey font-sans">
        {/* Top Breadcrumbs & Back CTA: DSA Yatra > Problem Sheet > Question Name */}
        <div className="flex items-center justify-between gap-3 pb-2 border-b border-slate-100 dark:border-[#202026]">
          <nav className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 dark:text-slate-500 min-w-0">
            <Link
              href="/dashboard"
              className="hover:text-slate-800 dark:hover:text-white transition-colors shrink-0"
            >
              DSA Yatra
            </Link>
            <span className="text-slate-300 dark:text-slate-600">›</span>
            <button
              type="button"
              onClick={handleCloseQuestion}
              className="hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer shrink-0"
            >
              Problem Sheet
            </button>
            <span className="text-slate-300 dark:text-slate-600">›</span>
            <span className="font-bold text-[#FF4D4D] truncate">
              {selectedQuestion.name}
            </span>
          </nav>

          <button
            type="button"
            onClick={handleCloseQuestion}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-200/90 dark:border-[#26262E] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#1A1A20] transition-colors shrink-0 cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Back to Sheet</span>
          </button>
        </div>

        {/* Single Question Detail Card - Solved button is inside this single container */}
        <div className="rounded-xl border border-slate-200/90 dark:border-[#24242A] bg-white dark:bg-[#131316] shadow-2xs p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-end pb-3 border-b border-slate-100 dark:border-[#1E1E24]">
            <button
              type="button"
              onClick={() =>
                handleToggleComplete(
                  selectedQuestion.id ??
                    selectedQuestion._id ??
                    selectedQuestion.name,
                )
              }
              className={cn(
                "px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-2xs",
                isCompleted
                  ? "bg-emerald-500 text-white hover:bg-emerald-600"
                  : "border border-slate-200 dark:border-[#2C2C36] text-slate-700 dark:text-slate-300 hover:border-emerald-500 hover:text-emerald-500 bg-white dark:bg-[#16161A]",
              )}
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isCompleted ? "Solved" : "Mark Solved"}</span>
            </button>
          </div>

          <QuestionDetailPanel question={selectedQuestion} />
        </div>

        {/* Freemium Upsell Modal */}
        <DsaUpsellModal
          open={showPayment}
          onViewPlans={() => router.push(routes.dsayatra.pricing)}
          onDismiss={() => setShowPayment(false)}
        />
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-y-auto px-3 sm:px-6 py-2 sm:py-3 space-y-2.5 sm:space-y-3 scrollbar-thin-grey font-sans">
      {/* 1. Hero & Progress Section (Left: Breadcrumbs, Title, Subtitle, Progress; Right: Hero Image) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 lg:gap-6">
        {/* Left Column: Title + Subtitle + Progress Bar (not full width, left of hero) */}
        <div className="space-y-2.5 flex-1 max-w-xl lg:max-w-2xl">
          <div className="space-y-1">
            <nav className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 dark:text-slate-500 mb-0.5">
              <Link
                href="/dashboard"
                className="hover:text-slate-800 dark:hover:text-white transition-colors"
              >
                DSA Yatra
              </Link>
              <span className="text-slate-300 dark:text-slate-600">›</span>
              <span className="font-bold text-[#FF4D4D]">Problem Sheet</span>
            </nav>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              DSA <span className="text-[#FF4D4D]">Problem Sheets</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium leading-normal">
              Curated topic-wise interview problems with step-by-step breakdowns
              and visualizers.
            </p>
          </div>

          {/* Overall Preparation Progress Bar placed below title, left of hero */}
          <div className="p-2 sm:p-2.5 rounded-lg border border-red-100/70 dark:border-[#262024] bg-white dark:bg-[#131316] shadow-2xs space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md flex items-center justify-center shrink-0">
                  <img
                    src="https://ik.imagekit.io/riufvimprm/TBE/target-progress-icon.png?updatedAt=1793349024464"
                    alt="Target"
                    className="w-full h-full object-contain select-none"
                  />
                </div>
                <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                  Overall Preparation Progress
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  {totalSolved} / {totalQuestions} Problems
                </span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-50 dark:bg-red-950/40 text-[#FF4D4D]">
                  {overallPercentage}%
                </span>
              </div>
            </div>

            <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-[#1E1E24] overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#FF4D4D] to-[#FF3B30] rounded-full transition-all duration-700"
                style={{ width: `${overallPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Right Column: Remote Hero Illustration */}
        <div className="shrink-0 max-w-[220px] sm:max-w-[260px] md:max-w-[300px] lg:max-w-[340px] w-full self-center md:self-auto">
          <img
            src="https://ik.imagekit.io/riufvimprm/TBE/dsa-hero-illustration.png"
            alt="DSA Problem Sheets"
            className="w-full h-auto object-contain select-none drop-shadow-sm"
          />
        </div>
      </div>

      {/* 2. Search Bar - Half Width, Slim & Compact */}
      <div className="relative w-full sm:w-1/2 max-w-lg z-20">
        <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search DSA topics (e.g., Array, Two Pointers, Graphs)..."
          className="w-full pl-8 pr-7 py-1.5 rounded-lg border border-slate-200/90 dark:border-[#24242A] bg-white dark:bg-[#131316] text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-[#FF4D4D] transition-colors shadow-2xs"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* 3. Topics Section: Inline Row Expansion in 3-Column Grid */}
      <LayoutGroup id="dsa-topics-layout">
        <motion.div
          layout
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-2.5"
        >
          {filteredTopics.map((item) => {
            const isExpanded = expandedTopic === item.topic;
            if (isExpanded) {
              return (
                <motion.div
                  layout
                  key={item.topic}
                  className="col-span-1 sm:col-span-2 lg:col-span-3 overflow-hidden"
                  initial={{ opacity: 0, scale: 0.99 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.99 }}
                  transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                >
                  <ExpandedTopicCard
                    topicKey={item.topic}
                    topicMeta={item.meta}
                    totalCount={topicOverrides[item.topic]?.total ?? item.count}
                    solvedCount={
                      topicOverrides[item.topic]?.solved ?? item.solved
                    }
                    onCollapse={() => handleSelectTopic(item.topic)}
                    completedIds={completedIds}
                    onToggleComplete={handleToggleComplete}
                    onSelectQuestion={(q) =>
                      handleSelectQuestion(q, item.topic)
                    }
                    onLockedClick={() => setShowPayment(true)}
                    onCountsDiscovered={handleUpdateTopicCounts}
                  />
                </motion.div>
              );
            }

            return (
              <motion.div
                layout="position"
                key={item.topic}
                className="col-span-1"
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              >
                <TopicGridCard
                  topicKey={item.topic}
                  topicMeta={item.meta}
                  totalCount={topicOverrides[item.topic]?.total ?? item.count}
                  solvedCount={
                    topicOverrides[item.topic]?.solved ?? item.solved
                  }
                  onSelect={() => handleSelectTopic(item.topic)}
                />
              </motion.div>
            );
          })}
        </motion.div>

        {filteredTopics.length === 0 && (
          <div className="text-center py-10 rounded-lg border border-dashed border-slate-200 dark:border-[#24242A] text-slate-400 text-xs">
            No topics matched your search or filter.
          </div>
        )}
      </LayoutGroup>

      {/* Freemium Upsell Modal */}
      <DsaUpsellModal
        open={showPayment}
        onViewPlans={() => router.push(routes.dsayatra.pricing)}
        onDismiss={() => setShowPayment(false)}
      />
    </div>
  );
}

export default function SheetsPage({ seoMeta }: PageProps) {
  return (
    <Fragment>
      <SEO seoMeta={seoMeta} appId="dsayatra" />
      <SheetsClient />
    </Fragment>
  );
}

export const getServerSideProps = async () =>
  getPreFetchProps({ slug: "/sheets", appId: "dsayatra" });
