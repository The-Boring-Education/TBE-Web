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
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle2,
  ChevronDown,
  Circle,
  Eye,
  FileText,
  Folder,
  FolderOpen,
  Lock,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Fragment, useCallback, useMemo, useState } from "react";
import { SiLeetcode, SiYoutube } from "react-icons/si";

/* -------------------------------------------------------------------------- */
/* Difficulty Badges                                                          */
/* -------------------------------------------------------------------------- */
function DifficultyBadge({ difficulty }: { difficulty?: string }) {
  const norm = (difficulty || "MEDIUM").toUpperCase();
  if (norm === "EASY") {
    return (
      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
        Easy
      </span>
    );
  }
  if (norm === "HARD") {
    return (
      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 shrink-0">
        Hard
      </span>
    );
  }
  return (
    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shrink-0">
      Medium
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* Question Row Component                                                     */
/* -------------------------------------------------------------------------- */
interface QuestionRowItemProps {
  question: DsaQuestion;
  isCompleted: boolean;
  onToggle: (questionId: string | number) => void;
  onSelect: (question: DsaQuestion) => void;
  onLockedClick: () => void;
}

function QuestionRowItem({
  question,
  isCompleted,
  onToggle,
  onSelect,
  onLockedClick,
}: QuestionRowItemProps) {
  const qId = question.id ?? question._id ?? question.name;
  const isLocked = Boolean(question.isLocked);

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-3.5 sm:px-4 py-3 rounded-lg border transition-all duration-150 group",
        isCompleted
          ? "bg-emerald-500/[0.03] dark:bg-emerald-500/[0.04] border-emerald-500/20 hover:border-emerald-500/30"
          : isLocked
            ? "bg-slate-50/50 dark:bg-[#161619] border-slate-200/60 dark:border-[#222227] opacity-75"
            : "bg-slate-50 dark:bg-[#161619] border-slate-200/70 dark:border-[#24242A] hover:bg-slate-100/80 dark:hover:bg-[#1B1B20] hover:border-slate-300 dark:hover:border-[#323238]",
      )}
    >
      {/* Left: Checkbox + Name + Badges */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (isLocked) {
              onLockedClick();
            } else {
              onToggle(qId);
            }
          }}
          className="shrink-0 transition-transform active:scale-90 focus:outline-none"
          title={isCompleted ? "Mark incomplete" : "Mark completed"}
        >
          {isLocked ? (
            <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500" />
          ) : isCompleted ? (
            <CheckCircle2 className="w-4 h-4 text-[#FF4D4D] fill-[#FF4D4D]/15" />
          ) : (
            <Circle className="w-4 h-4 text-slate-300 dark:text-slate-600 hover:text-slate-500 dark:hover:text-slate-400" />
          )}
        </button>

        <button
          type="button"
          onClick={() => {
            if (isLocked) {
              onLockedClick();
            } else {
              onSelect(question);
            }
          }}
          className="text-left font-medium text-xs sm:text-sm text-slate-800 dark:text-slate-200 hover:text-[#FF4D4D] dark:hover:text-[#FF4D4D] transition-colors truncate focus:outline-none"
        >
          <span
            className={
              isCompleted
                ? "line-through text-slate-400 dark:text-slate-500"
                : ""
            }
          >
            {question.name}
          </span>
        </button>

        <DifficultyBadge difficulty={question.difficultyLevel} />

        {question.isRealWorldProblem && (
          <span className="hidden md:inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-500 border border-blue-500/20 shrink-0">
            Real World
          </span>
        )}
      </div>

      {/* Right: Actions (LeetCode, YouTube, Visualizer, View details) */}
      <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
        {question.visualizerId && (
          <Link
            href={`/visualizers/${question.visualizerId}`}
            className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold text-[#FF4D4D] bg-[#FF4D4D]/10 hover:bg-[#FF4D4D]/20 transition-colors"
            title="Algorithm visualizer available"
          >
            <Eye className="w-3 h-3" />
            <span className="hidden sm:inline">Visualizer</span>
          </Link>
        )}

        {question.resources?.leetcodeURL && (
          <a
            href={question.resources.leetcodeURL}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-md text-amber-500 hover:text-amber-400 hover:bg-amber-500/10 transition-colors"
            title="Open on LeetCode"
          >
            <SiLeetcode className="w-3.5 h-3.5" />
          </a>
        )}

        {question.resources?.youtubeURL && (
          <a
            href={question.resources.youtubeURL}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-md text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            title="Watch video explanation"
          >
            <SiYoutube className="w-3.5 h-3.5" />
          </a>
        )}

        <button
          type="button"
          onClick={() => {
            if (isLocked) {
              onLockedClick();
            } else {
              onSelect(question);
            }
          }}
          className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold border border-slate-200 dark:border-[#2A2A32] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-[#383842] transition-colors"
        >
          <FileText className="w-3 h-3" />
          <span>Details</span>
        </button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Collapsible Topic Row Component                                            */
/* -------------------------------------------------------------------------- */
interface TopicRowProps {
  topic: string;
  label: string;
  totalCount: number;
  solvedCount: number;
  isOpen: boolean;
  onToggle: () => void;
  completedIds: (string | number)[];
  onToggleComplete: (questionId: string | number) => void;
  onSelectQuestion: (question: DsaQuestion) => void;
  onLockedClick: () => void;
}

function TopicRow({
  topic,
  label,
  totalCount,
  solvedCount,
  isOpen,
  onToggle,
  completedIds,
  onToggleComplete,
  onSelectQuestion,
  onLockedClick,
}: TopicRowProps) {
  const { questions, loading } = useDsaQuestionsForTopic(
    isOpen ? topic : null,
    { productType: "DSA_YATRA" },
  );

  const completedSet = useMemo(
    () => new Set(completedIds.map(String)),
    [completedIds],
  );

  // Compute live solved count for this topic's questions
  const liveSolvedCount = useMemo(() => {
    if (!questions.length) return solvedCount;
    return questions.filter((q) => completedSet.has(String(q.id ?? q.name)))
      .length;
  }, [questions, completedSet, solvedCount]);

  const effectiveTotal = questions.length || totalCount || 1;
  const progressPercent = Math.min(
    100,
    Math.round((liveSolvedCount / effectiveTotal) * 100),
  );
  const isAllSolved = progressPercent === 100 && effectiveTotal > 0;

  return (
    <div className="rounded-xl border border-slate-200/90 dark:border-[#24242A] bg-white dark:bg-[#131316] overflow-hidden transition-all duration-200 shadow-2xs">
      {/* Header / Accordion Trigger */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between p-3.5 sm:p-4 text-left hover:bg-slate-50 dark:hover:bg-[#18181D] transition-colors focus:outline-none"
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {isOpen ? (
            <FolderOpen
              className={cn(
                "w-4 h-4 shrink-0 transition-colors",
                isAllSolved ? "text-emerald-500" : "text-[#FF4D4D]",
              )}
            />
          ) : (
            <Folder
              className={cn(
                "w-4 h-4 shrink-0 transition-colors",
                isAllSolved
                  ? "text-emerald-500"
                  : "text-slate-400 dark:text-slate-500",
              )}
            />
          )}

          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3 min-w-0">
            <span className="font-bold text-sm sm:text-base text-slate-900 dark:text-white truncate">
              {label}
            </span>
            <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
              {liveSolvedCount} / {questions.length || totalCount} Solved
            </span>
          </div>
        </div>

        {/* Progress & Chevron */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden sm:flex items-center gap-2">
            <div className="h-1.5 w-24 rounded-full bg-slate-100 dark:bg-[#1E1E24] overflow-hidden">
              <div
                className={cn(
                  "h-full transition-all duration-500 rounded-full",
                  isAllSolved ? "bg-emerald-500" : "bg-[#FF4D4D]",
                )}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span
              className={cn(
                "text-[10px] font-bold font-mono w-8 text-right",
                isAllSolved
                  ? "text-emerald-500"
                  : "text-slate-400 dark:text-slate-500",
              )}
            >
              {progressPercent}%
            </span>
          </div>

          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-4 h-4 text-slate-400 dark:text-slate-500" />
          </motion.div>
        </div>
      </button>

      {/* Accordion Body */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden border-t border-slate-100 dark:border-[#1E1E24]"
          >
            <div className="p-3 sm:p-4 space-y-2 bg-slate-50/50 dark:bg-[#0E0E11]/40">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : questions.length === 0 ? (
                <p className="text-xs text-center py-4 text-slate-400">
                  No questions available for this topic yet.
                </p>
              ) : (
                questions.map((q) => {
                  const qKey = String(q.id ?? q.name);
                  const isCompleted = completedSet.has(qKey);

                  return (
                    <QuestionRowItem
                      key={qKey}
                      question={q}
                      isCompleted={isCompleted}
                      onToggle={onToggleComplete}
                      onSelect={onSelectQuestion}
                      onLockedClick={onLockedClick}
                    />
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Main Sheets Page Component                                                 */
/* -------------------------------------------------------------------------- */
function SheetsClient() {
  const router = useRouter();
  const { user, loading: userLoading, isAuth } = useUser();
  const { celebrate } = useGamificationFeedback();
  const { refetch: refetchGamification } = useGamification();
  const { trackEvent } = useAnalytics();

  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedQuestion, setSelectedQuestion] = useState<DsaQuestion | null>(
    null,
  );
  const [showPayment, setShowPayment] = useState(false);

  // Fetch topics summary
  const {
    data: topicRows,
    isLoading: topicsLoading,
    isError: topicsError,
    error: topicsErrorVal,
  } = useDsaTopicSummaries("DSA_YATRA");

  // Fetch completed questions list & toggles
  const { completedIds, toggleComplete } = useDsaCompletedQuestions({
    userId: user?.id,
  });

  const handleToggleTopic = (topic: string) => {
    setExpandedTopics((prev) => {
      const next = new Set(prev);
      if (next.has(topic)) {
        next.delete(topic);
      } else {
        next.add(topic);
      }
      return next;
    });
  };

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
      label: TOPIC_LABELS[t.topic] || t.topic,
    }));
  }, [topicRows]);

  const filteredTopics = useMemo(() => {
    if (!searchQuery.trim()) return topics;
    const q = searchQuery.toLowerCase();
    return topics.filter((t) => t.label.toLowerCase().includes(q));
  }, [topics, searchQuery]);

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

  const handleExpandAll = () => {
    if (expandedTopics.size === topics.length) {
      setExpandedTopics(new Set());
    } else {
      setExpandedTopics(new Set(topics.map((t) => t.topic)));
    }
  };

  return (
    <div className="w-full h-full overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-5 scrollbar-thin-grey">
      {/* Breadcrumbs & Header */}
      <div className="space-y-3">
        <nav className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
          <Link
            href="/dashboard"
            className="hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            DSA Yatra
          </Link>
          <span className="text-slate-300 dark:text-slate-600">›</span>
          <span className="font-bold text-[#FF4D4D]">Problem Sheets</span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              DSA Problem Sheets
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
              Curated topic-wise interview problems with step-by-step breakdowns
              and visualizers.
            </p>
          </div>

          {/* Quick actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleExpandAll}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#24242A] text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1E1E24] transition-colors"
            >
              {expandedTopics.size === topics.length
                ? "Collapse All"
                : "Expand All"}
            </button>
          </div>
        </div>
      </div>

      {/* Overall Progress Banner */}
      <div className="p-4 sm:p-5 rounded-2xl border border-slate-200/90 dark:border-[#24242A] bg-white dark:bg-[#131316] shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#FF4D4D]" />
            <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
              Overall Preparation Progress
            </span>
          </div>
          <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
            {totalSolved} of {totalQuestions} Solved ({overallPercentage}%)
          </span>
        </div>

        <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-[#1E1E24] overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#FF4D4D] to-[#FF3B30] rounded-full transition-all duration-700"
            style={{ width: `${overallPercentage}%` }}
          />
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search DSA topics (e.g., Array, Two Pointers, Graph)..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200/90 dark:border-[#24242A] bg-white dark:bg-[#131316] text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-[#FF4D4D] transition-colors shadow-2xs"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Topic Rows List */}
      <div className="space-y-2.5">
        {filteredTopics.length === 0 ? (
          <div className="text-center py-12 rounded-xl border border-dashed border-slate-200 dark:border-[#24242A] text-slate-400">
            No topics matched your search.
          </div>
        ) : (
          filteredTopics.map((topicItem) => (
            <TopicRow
              key={topicItem.topic}
              topic={topicItem.topic}
              label={topicItem.label}
              totalCount={topicItem.count}
              solvedCount={topicItem.solved}
              isOpen={expandedTopics.has(topicItem.topic)}
              onToggle={() => handleToggleTopic(topicItem.topic)}
              completedIds={completedIds}
              onToggleComplete={handleToggleComplete}
              onSelectQuestion={(q) => setSelectedQuestion(q)}
              onLockedClick={() => setShowPayment(true)}
            />
          ))
        )}
      </div>

      {/* Question Detail Slide-over / Modal */}
      {selectedQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-[#131316] border border-slate-200 dark:border-[#24242A] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-[#24242A] bg-slate-50 dark:bg-[#161619]">
              <div className="flex items-center gap-2.5 min-w-0 pr-4">
                <span className="font-bold text-slate-900 dark:text-white text-sm sm:text-base truncate">
                  {selectedQuestion.name}
                </span>
                <DifficultyBadge
                  difficulty={selectedQuestion.difficultyLevel}
                />
              </div>

              <button
                type="button"
                onClick={() => setSelectedQuestion(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1E1E24] transition-colors shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 scrollbar-thin-grey">
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
