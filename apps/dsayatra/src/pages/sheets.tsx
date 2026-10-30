import {
  DsaUpsellModal,
  LoadingSpinner,
  QuestionDetailPanel,
  SEO,
} from "@tbe/components";
import { routes, TOPIC_LABELS } from "@tbe/constants";
import { useGamification, useGamificationFeedback } from "@tbe/gamification";
import {
  useAnalytics,
  useDsaCompletedQuestions,
  useDsaQuestionsForTopic,
  useDsaTopicSummaries,
  useUser,
} from "@tbe/hooks";
import type { DsaQuestion, PageProps } from "@tbe/interface";
import { cn, getPreFetchProps } from "@tbe/utils";
import {
  ArrowDownUp,
  Bookmark,
  Calculator,
  ChartNoAxesCombined,
  Check,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Filter,
  GitBranch,
  Grid2X2,
  Hash,
  Layers,
  Layers2,
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
  Target,
  Text,
  Undo2,
  Workflow,
  X,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Fragment, useCallback, useMemo, useState } from "react";

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
/* Difficulty Badges (Tighter, Compact)                                       */
/* -------------------------------------------------------------------------- */
function DifficultyPill({ difficulty }: { difficulty?: string }) {
  const norm = (difficulty || "MEDIUM").toUpperCase();
  if (norm === "EASY") {
    return (
      <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 shrink-0">
        Easy
      </span>
    );
  }
  if (norm === "HARD") {
    return (
      <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 shrink-0">
        Hard
      </span>
    );
  }
  return (
    <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 shrink-0">
      Medium
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* Expanded Topic View (Thinner Dropdown, Closer Spacing)                     */
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
}: ExpandedTopicCardProps) {
  const { questions, loading } = useDsaQuestionsForTopic(topicKey, {
    productType: "DSA_YATRA",
  });

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

  const IconComponent = topicMeta.icon;

  return (
    <div className="rounded-xl sm:rounded-2xl border border-slate-200/90 dark:border-[#24242A] bg-white dark:bg-[#131316] overflow-hidden shadow-2xs transition-all duration-300">
      {/* Top Header of Expanded Card - Thinner, Closer */}
      <div className="flex items-center justify-between px-3.5 py-2.5 sm:px-4 sm:py-3 border-b border-slate-100 dark:border-[#1E1E24]">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`w-10 h-10 rounded-xl ${topicMeta.iconBg} border ${topicMeta.borderColor} flex items-center justify-center shrink-0 shadow-2xs`}
          >
            <IconComponent size={18} className={topicMeta.iconColor} />
          </div>

          <div className="min-w-0">
            <h2 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white leading-tight">
              {topicMeta.name}
            </h2>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium truncate mt-0.5">
              {questions.length || totalCount} problems • {solvedCount} solved •{" "}
              {topicMeta.description}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onCollapse}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#1E1E24] transition-colors"
          title="Collapse topic"
        >
          <ChevronUp className="w-4 h-4" />
        </button>
      </div>

      {/* Questions List - Thinner rows, reduced padding & tight spacing */}
      <div className="p-2 sm:p-2.5 space-y-1">
        {loading ? (
          <div className="flex items-center justify-center py-6">
            <LoadingSpinner />
          </div>
        ) : questions.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-400">
            No questions available for this topic yet.
          </div>
        ) : (
          displayedQuestions.map((q, idx) => {
            const qKey = String(q.id ?? q._id ?? q.name);
            const isCompleted = completedSet.has(qKey);
            const isBookmarked = bookmarkedIds.has(qKey);
            const isLocked = Boolean(q.isLocked);

            return (
              <div
                key={qKey}
                className={cn(
                  "flex items-center justify-between gap-2.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg transition-all duration-150 group",
                  isCompleted
                    ? "bg-slate-50/60 dark:bg-[#161619]/60 hover:bg-slate-100/70 dark:hover:bg-[#1B1B20]"
                    : "bg-slate-50/40 dark:bg-[#161619]/40 hover:bg-slate-100/80 dark:hover:bg-[#1B1B20]",
                )}
              >
                {/* Left: Number + Title */}
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isLocked) onLockedClick();
                      else onToggleComplete(q.id ?? q._id ?? q.name);
                    }}
                    className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 transition-transform active:scale-95",
                      isCompleted
                        ? "bg-red-50 dark:bg-red-950/40 text-[#FF4D4D]"
                        : "bg-slate-100 dark:bg-[#202026] text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-[#282830]",
                    )}
                    title={
                      isCompleted
                        ? "Question solved! Click to unmark"
                        : "Click to mark as solved"
                    }
                  >
                    {isCompleted ? (
                      <Check className="w-3 h-3 text-[#FF4D4D]" />
                    ) : (
                      idx + 1
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (isLocked) onLockedClick();
                      else onSelectQuestion(q);
                    }}
                    className="font-medium text-xs sm:text-sm text-slate-800 dark:text-slate-200 hover:text-[#FF4D4D] dark:hover:text-[#FF4D4D] transition-colors truncate text-left focus:outline-none"
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

                {/* Right: Difficulty + Tags + Bookmark + Solve CTA */}
                <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
                  <DifficultyPill difficulty={q.difficultyLevel} />

                  <div className="hidden lg:flex items-center gap-1">
                    {topicMeta.name && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-[#1E1E24] text-slate-600 dark:text-slate-400">
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
                            className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-[#1E1E24] text-slate-600 dark:text-slate-400"
                          >
                            {TOPIC_LABELS[subT] || subT}
                          </span>
                        ))}
                  </div>

                  <button
                    type="button"
                    onClick={(e) => toggleBookmark(qKey, e)}
                    className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                    title={
                      isBookmarked ? "Remove bookmark" : "Bookmark question"
                    }
                  >
                    <Bookmark
                      className={cn(
                        "w-3.5 h-3.5",
                        isBookmarked
                          ? "fill-[#FF4D4D] text-[#FF4D4D]"
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
                    className="flex items-center gap-1 px-2.5 py-0.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-bold text-[#FF4D4D] bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/50 transition-colors"
                  >
                    {isLocked ? (
                      <>
                        <Lock className="w-3 h-3 text-[#FF4D4D]" />
                        <span>Unlock</span>
                      </>
                    ) : (
                      <>
                        <span>Solve</span>
                        <ChevronRight className="w-3 h-3" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })
        )}

        {questions.length > 6 && (
          <div className="pt-1 text-center">
            <button
              type="button"
              onClick={() => setShowAll(!showAll)}
              className="w-full py-1.5 sm:py-2 rounded-lg border border-slate-200/80 dark:border-[#24242A] text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#18181D] transition-colors flex items-center justify-center gap-1"
            >
              <span>
                {showAll
                  ? "Show Fewer Questions"
                  : `View All ${questions.length} Problems`}
              </span>
              <ChevronDown
                className={cn(
                  "w-3.5 h-3.5 transition-transform",
                  showAll ? "rotate-180" : "",
                )}
              />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Unexpanded Topic Card with Pastel Badge & Compact Padding                  */
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
      className="w-full text-left rounded-xl border border-slate-200/90 dark:border-[#24242A] bg-white dark:bg-[#131316] p-2.5 sm:p-3 flex items-center justify-between gap-2.5 shadow-2xs hover:shadow-xs hover:border-slate-300 dark:hover:border-[#33333C] transition-all duration-200 group cursor-pointer"
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div
          className={`w-10 h-10 rounded-xl ${topicMeta.iconBg} border ${topicMeta.borderColor} flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform`}
        >
          <IconComponent size={18} className={topicMeta.iconColor} />
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white truncate group-hover:text-[#FF4D4D] transition-colors">
            {topicMeta.name}
          </h3>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium truncate mt-0.5">
            {solvedCount} / {totalCount} solved
          </p>
        </div>
      </div>

      <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-slate-600 dark:group-hover:text-slate-300 group-hover:translate-x-0.5 transition-all shrink-0" />
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
  const [filterMode, setFilterMode] = useState<
    "all" | "in_progress" | "completed"
  >("all");
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<DsaQuestion | null>(
    null,
  );
  const [showPayment, setShowPayment] = useState(false);

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

  const topics = useMemo(() => {
    return (topicRows ?? []).map((t) => ({
      topic: t.topic,
      count: t.count,
      solved: t.solved,
      meta: getTopicMeta(t.topic),
    }));
  }, [topicRows]);

  const filteredTopics = useMemo(() => {
    let result = topics;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.meta.name.toLowerCase().includes(q) ||
          t.topic.toLowerCase().includes(q),
      );
    }
    if (filterMode === "completed") {
      result = result.filter((t) => t.solved === t.count && t.count > 0);
    } else if (filterMode === "in_progress") {
      result = result.filter((t) => t.solved > 0 && t.solved < t.count);
    }
    return result;
  }, [topics, searchQuery, filterMode]);

  const totalQuestions = useMemo(
    () => topics.reduce((acc, t) => acc + t.count, 0),
    [topics],
  );
  const totalSolved = completedIds.length;
  const overallPercentage =
    totalQuestions > 0
      ? Math.min(100, Math.round((totalSolved / totalQuestions) * 100))
      : 0;

  if (topicsLoading || userLoading) {
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

  const expandedTopicItem = topics.find((t) => t.topic === expandedTopic);
  const otherTopics = filteredTopics.filter((t) => t.topic !== expandedTopic);

  return (
    <div className="w-full h-full overflow-y-auto px-3 sm:px-6 py-2.5 sm:py-3.5 space-y-3 sm:space-y-3.5 scrollbar-thin-grey font-sans">
      {/* 1. Header / Hero Section with Breadcrumb tightly above the title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
        <div className="space-y-1 max-w-xl">
          <nav className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 dark:text-slate-500 mb-0.5">
            <Link
              href="/dashboard"
              className="hover:text-slate-800 dark:hover:text-white transition-colors"
            >
              DSA Vault
            </Link>
            <span className="text-slate-300 dark:text-slate-600">›</span>
            <span className="font-bold text-[#FF4D4D]">Problem Sheets</span>
          </nav>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            DSA <span className="text-[#FF4D4D]">Problem Sheets</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium leading-normal">
            Curated topic-wise interview problems with step-by-step breakdowns
            and visualizers.
          </p>
        </div>

        {/* Remote Hero Illustration */}
        <div className="shrink-0 max-w-[150px] sm:max-w-[180px] md:max-w-[210px] w-full self-center md:self-auto">
          <img
            src="https://ik.imagekit.io/riufvimprm/TBE/dsa-hero-illustration.png"
            alt="DSA Problem Sheets"
            className="w-full h-auto object-contain select-none drop-shadow-xs"
          />
        </div>
      </div>

      {/* 2. Overall Preparation Progress Banner - Compact & closer */}
      <div className="p-3 sm:p-3.5 rounded-xl border border-red-100/70 dark:border-[#262024] bg-white dark:bg-[#131316] shadow-2xs space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-red-50 dark:bg-red-950/40 border border-red-200/80 dark:border-red-900/50 flex items-center justify-center text-[#FF4D4D] shrink-0">
              <Target className="w-3.5 h-3.5 text-[#FF4D4D]" />
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

      {/* 3. Search and Filter Bar - Tighter padding */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 relative z-20">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search DSA topics (e.g., Array, Two Pointers, Graphs)..."
            className="w-full pl-8 pr-7 py-1.5 sm:py-2 rounded-xl border border-slate-200/90 dark:border-[#24242A] bg-white dark:bg-[#131316] text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-[#FF4D4D] transition-colors shadow-2xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
            className="w-full sm:w-auto px-3 py-1.5 sm:py-2 rounded-xl border border-slate-200/90 dark:border-[#24242A] bg-white dark:bg-[#131316] text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-[#32323A] transition-colors flex items-center justify-between sm:justify-start gap-1.5 shadow-2xs"
          >
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span>
              {filterMode === "all"
                ? "All Topics"
                : filterMode === "in_progress"
                  ? "In Progress"
                  : "Completed"}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
          </button>

          {isFilterDropdownOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-44 rounded-xl border border-slate-200/90 dark:border-[#2C2C36] bg-white dark:bg-[#18181D] shadow-xl py-1 z-30">
              <button
                type="button"
                onClick={() => {
                  setFilterMode("all");
                  setIsFilterDropdownOpen(false);
                }}
                className={cn(
                  "w-full px-3 py-1.5 text-left text-xs font-semibold flex items-center justify-between hover:bg-slate-50 dark:hover:bg-[#202028]",
                  filterMode === "all"
                    ? "text-[#FF4D4D] font-bold"
                    : "text-slate-700 dark:text-slate-300",
                )}
              >
                <span>All Topics</span>
                {filterMode === "all" && <Check className="w-3.5 h-3.5" />}
              </button>
              <button
                type="button"
                onClick={() => {
                  setFilterMode("in_progress");
                  setIsFilterDropdownOpen(false);
                }}
                className={cn(
                  "w-full px-3 py-1.5 text-left text-xs font-semibold flex items-center justify-between hover:bg-slate-50 dark:hover:bg-[#202028]",
                  filterMode === "in_progress"
                    ? "text-[#FF4D4D] font-bold"
                    : "text-slate-700 dark:text-slate-300",
                )}
              >
                <span>In Progress</span>
                {filterMode === "in_progress" && (
                  <Check className="w-3.5 h-3.5" />
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setFilterMode("completed");
                  setIsFilterDropdownOpen(false);
                }}
                className={cn(
                  "w-full px-3 py-1.5 text-left text-xs font-semibold flex items-center justify-between hover:bg-slate-50 dark:hover:bg-[#202028]",
                  filterMode === "completed"
                    ? "text-[#FF4D4D] font-bold"
                    : "text-slate-700 dark:text-slate-300",
                )}
              >
                <span>Completed</span>
                {filterMode === "completed" && (
                  <Check className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 4. Topics Section: Expanded Card + 3-Column Grid */}
      <div className="space-y-3">
        {expandedTopicItem && (
          <ExpandedTopicCard
            topicKey={expandedTopicItem.topic}
            topicMeta={expandedTopicItem.meta}
            totalCount={expandedTopicItem.count}
            solvedCount={expandedTopicItem.solved}
            onCollapse={() => setExpandedTopic(null)}
            completedIds={completedIds}
            onToggleComplete={handleToggleComplete}
            onSelectQuestion={(q) => setSelectedQuestion(q)}
            onLockedClick={() => setShowPayment(true)}
          />
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
          {otherTopics.map((item) => (
            <TopicGridCard
              key={item.topic}
              topicKey={item.topic}
              topicMeta={item.meta}
              totalCount={item.count}
              solvedCount={item.solved}
              onSelect={() => setExpandedTopic(item.topic)}
            />
          ))}
        </div>

        {filteredTopics.length === 0 && (
          <div className="text-center py-10 rounded-xl border border-dashed border-slate-200 dark:border-[#24242A] text-slate-400 text-xs">
            No topics matched your search or filter.
          </div>
        )}
      </div>

      {/* Question Detail Slide-over / Modal */}
      {selectedQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-[#131316] border border-slate-200 dark:border-[#24242A] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-[#24242A] bg-slate-50 dark:bg-[#161619]">
              <div className="flex items-center gap-2 min-w-0 pr-4">
                <span className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm truncate">
                  {selectedQuestion.name}
                </span>
                <DifficultyPill difficulty={selectedQuestion.difficultyLevel} />
              </div>

              <button
                type="button"
                onClick={() => setSelectedQuestion(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1E1E24] transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 sm:p-5 scrollbar-thin-grey">
              <QuestionDetailPanel question={selectedQuestion} />
            </div>
          </div>
        </div>
      )}

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
