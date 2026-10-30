import {
  DsaUpsellModal,
  FreemiumLockBanner,
  LoadingSpinner,
  SEO,
  SheetLearningSpace,
} from "@tbe/components";
import { routes, TOPIC_LABELS } from "@tbe/constants";
import { useGamification, useGamificationFeedback } from "@tbe/gamification";
import {
  useAnalytics,
  useDsaCompletedQuestions,
  useDsaPrepUrlSync,
  useDsaQuestionsForTopic,
  useDsaTopics,
  useDsaTopicSummaries,
  useUser,
} from "@tbe/hooks";
import type { DsaQuestion, PageProps } from "@tbe/interface";
import { getPreFetchProps } from "@tbe/utils";
import { useRouter } from "next/router";
import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import {
  FiArrowRight,
  FiCheckCircle,
  FiCode,
  FiCompass,
  FiSearch,
} from "react-icons/fi";

const SheetsPageClient = () => {
  const router = useRouter();
  const { loading: userLoading, isAuth, user } = useUser();
  const { trackEvent } = useAnalytics();

  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [, setSelectedQuestion] = useState<DsaQuestion | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [topicSearchQuery, setTopicSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState<
    "all" | "in-progress" | "completed"
  >("all");

  const {
    data: topicRows,
    isLoading: topicsLoading,
    isError: topicSummariesError,
    error: topicSummariesErrorValue,
  } = useDsaTopicSummaries("DSA_YATRA");

  const topicsWithCounts = useMemo(
    () =>
      (topicRows ?? []).map((t) => ({
        topic: t.topic,
        count: t.count,
        label: TOPIC_LABELS[t.topic] || t.topic,
      })),
    [topicRows],
  );

  // Fetch questions for the selected topic
  const {
    questions: topicQuestions,
    loading: topicQuestionsLoading,
    isError: topicQuestionsError,
    errorMessage: topicQuestionsErrorMessage,
  } = useDsaQuestionsForTopic(selectedTopic, {
    productType: "DSA_YATRA",
  });

  const [topicQuestionsCache, setTopicQuestionsCache] = useState<
    Record<string, DsaQuestion[]>
  >({});

  useEffect(() => {
    if (selectedTopic && topicQuestions.length > 0) {
      setTopicQuestionsCache((prev) => ({
        ...prev,
        [selectedTopic]: topicQuestions,
      }));
    }
  }, [selectedTopic, topicQuestions]);

  const questionsForCompletion = useMemo(
    () => Object.values(topicQuestionsCache).flat(),
    [topicQuestionsCache],
  );

  const { completedIds, toggleComplete, isProgressLoading } =
    useDsaCompletedQuestions({ userId: user?.id });
  const { refetch: refetchGamification } = useGamification();
  const { celebrate } = useGamificationFeedback();
  const { topicsCompletionMap } = useDsaTopics(
    questionsForCompletion,
    completedIds,
    topicsWithCounts,
  );

  const hasLockedQuestions = topicQuestions.some((q) => q.isLocked);
  const unlockedCount = topicQuestions.filter((q) => !q.isLocked).length;

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

  const questions = topicQuestions;
  const sheetsLoading =
    topicsLoading || (!!selectedTopic && topicQuestionsLoading);
  const sheetsErrorMessage = topicSummariesError
    ? topicSummariesErrorValue instanceof Error
      ? topicSummariesErrorValue.message
      : "Failed to load DSA topics"
    : selectedTopic && topicQuestionsError
      ? topicQuestionsErrorMessage ||
        "Failed to load questions for the selected topic"
      : null;

  const { handleTopicClick, handleBackToTopics } = useDsaPrepUrlSync({
    router,
    selectedTopic,
    setSelectedTopic,
    setSelectedQuestion,
    topicQuestions: questions,
    topicQuestionsLoading: !!selectedTopic && topicQuestionsLoading,
  });

  useEffect(() => {
    if (!userLoading && !isAuth) {
      router.push("/login");
    }
  }, [userLoading, isAuth, router]);

  const handleViewPlans = () => router.push(routes.dsayatra.pricing);
  const handleDismissUpsell = () => {
    setShowPayment(false);
    setSelectedQuestion(null);
  };

  // Map DSA questions to the unified SheetQuestion interface
  const mappedQuestions = useMemo(() => {
    return (questions || []).map((q) => {
      const qId = String(q.id || q._id || q.name);
      return {
        _id: qId,
        id: q.id,
        name: q.name,
        title: q.name,
        question: q.name,
        answer: q.answer || "",
        difficultyLevel: q.difficultyLevel,
        resources: q.resources,
        isLocked: q.isLocked,
        isCompleted: completedIds.some((cid) => String(cid) === qId),
        examples: q.examples,
        constraints: q.constraints,
      };
    });
  }, [questions, completedIds]);

  const totalQuestions = useMemo(
    () => topicsWithCounts.reduce((acc, t) => acc + (t.count || 0), 0),
    [topicsWithCounts],
  );
  const totalSolved = useMemo(() => completedIds.length, [completedIds]);
  const overallProgress =
    totalQuestions > 0 ? Math.round((totalSolved / totalQuestions) * 100) : 0;

  const filteredTopics = useMemo(() => {
    return topicsWithCounts.filter((t) => {
      const label = (t.label || t.topic || "").toLowerCase();
      const q = topicSearchQuery.toLowerCase().trim();
      const matchSearch = !q || label.includes(q);

      const isCompleted = topicsCompletionMap[t.topic] === true;
      if (filterMode === "completed") return matchSearch && isCompleted;
      if (filterMode === "in-progress") return matchSearch && !isCompleted;
      return matchSearch;
    });
  }, [topicsWithCounts, topicSearchQuery, filterMode, topicsCompletionMap]);

  if (userLoading || isProgressLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (sheetsErrorMessage) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center space-y-3">
        <p className="text-base font-bold text-[#FF4D4D]">
          Unable to load DSA sheets
        </p>
        <p className="max-w-md text-xs text-slate-500 dark:text-slate-400">
          {sheetsErrorMessage}
        </p>
        <button
          type="button"
          onClick={() => router.reload()}
          className="rounded-xl border border-[#FF4D4D]/40 px-4 py-1.5 text-xs font-bold text-[#FF4D4D] transition-colors hover:bg-[#FF4D4D]/10 cursor-pointer"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3 w-full">
      {hasLockedQuestions && selectedTopic && (
        <FreemiumLockBanner
          unlockedCount={unlockedCount}
          onUpgradeClick={handleViewPlans}
        />
      )}

      {selectedTopic ? (
        /* Reused SheetLearningSpace with platform curved styling */
        <SheetLearningSpace
          initialSheet={{
            name: TOPIC_LABELS[selectedTopic] || selectedTopic,
            description: `Curated problems, optimal solutions, visualizers and patterns for ${
              TOPIC_LABELS[selectedTopic] || selectedTopic
            }.`,
            questions: mappedQuestions,
          }}
          user={user}
          onBack={handleBackToTopics}
          onNavigateToDashboard={() => router.push("/dashboard")}
          dashboardLabel="DSA Yatra"
          parentLabel="Problem Sheets"
          onToggleComplete={handleToggleComplete}
          onFreemiumLockedClick={() => setShowPayment(true)}
        />
      ) : (
        /* Topic Problem Sheets Catalog in Platform Curved Rectangle Style */
        <div className="space-y-3">
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 flex-wrap px-0.5">
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              DSA Yatra
            </button>
            <span className="text-slate-300 dark:text-slate-600">›</span>
            <span className="font-bold text-[#FF4D4D]">DSA Problem Sheets</span>
          </nav>

          {/* Header Card */}
          <div className="relative overflow-hidden rounded-2xl border border-[#FED7D7]/80 dark:border-red-950/80 p-3.5 sm:p-5 bg-[#FFF5F4] dark:bg-[#1A1113] flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-2xs">
            <div className="space-y-1 z-10 max-w-xl">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-red-50 dark:bg-red-950/40 text-[#FF4D4D] border border-red-200/80 dark:border-red-900/60">
                  Curated DSA Sheets
                </span>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  {topicsWithCounts.length} Topic Sheets
                </span>
              </div>
              <h1 className="text-lg sm:text-xl md:text-2xl font-black text-[#101828] dark:text-white tracking-tight leading-snug">
                Master Data Structures & Algorithms
              </h1>
              <p className="text-xs text-[#64748B] dark:text-slate-400 font-medium leading-relaxed">
                Solve high-yield interview problems grouped by core data
                structures & algorithmic patterns with structured hints and
                explanations.
              </p>
            </div>

            {/* Overall Solved Progress */}
            <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end gap-3 z-10 shrink-0">
              <div className="space-y-1.5 w-full sm:w-48 lg:w-56">
                <div className="flex items-center justify-between text-xs font-black text-[#101828] dark:text-white">
                  <span>{overallProgress}% Solved</span>
                  <span className="text-[#64748B] dark:text-slate-400 font-semibold text-[11px]">
                    {totalSolved}/{totalQuestions} Problems
                  </span>
                </div>
                <div className="w-full bg-slate-200/80 dark:bg-[#282830] rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-[#FF4D4D] h-full rounded-full transition-all duration-300"
                    style={{ width: `${overallProgress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Filter Pills & Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-white dark:bg-[#16161A] p-2 sm:p-2.5 rounded-2xl border border-slate-200/90 dark:border-[#26262C] shadow-2xs">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none flex-nowrap">
              {[
                { id: "all", label: "All Sheets" },
                { id: "in-progress", label: "In Progress" },
                { id: "completed", label: "Completed" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFilterMode(tab.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    filterMode === tab.id
                      ? "bg-[#FF4D4D] text-white shadow-xs"
                      : "bg-slate-50 dark:bg-[#222228] text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#2A2A32] hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64 shrink-0">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-3.5 h-3.5 pointer-events-none" />
              <input
                type="text"
                placeholder="Search topic sheet..."
                value={topicSearchQuery}
                onChange={(e) => setTopicSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-[#222228] border border-slate-200 dark:border-[#2C2C34] rounded-xl text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:bg-white dark:focus:bg-[#1F1F25] focus:border-[#FF4D4D] transition-all"
              />
            </div>
          </div>

          {/* Sheets Grid */}
          {sheetsLoading ? (
            <div className="py-16 text-center text-xs font-bold text-slate-400">
              Loading DSA Sheets...
            </div>
          ) : filteredTopics.length === 0 ? (
            <div className="py-16 bg-white dark:bg-[#16161A] border border-slate-200/90 dark:border-[#26262C] rounded-2xl text-center p-6 space-y-2 shadow-2xs">
              <FiCompass className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">
                No topic sheets found
              </h3>
              <p className="text-xs text-slate-400">
                Try adjusting your search query or filter.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {filteredTopics.map((topic) => {
                const isComplete = topicsCompletionMap[topic.topic] === true;

                return (
                  <div
                    key={topic.topic}
                    onClick={() => handleTopicClick(topic.topic)}
                    className="bg-white dark:bg-[#16161A] border border-slate-200/90 dark:border-[#26262C] hover:border-slate-300 dark:hover:border-[#383842] rounded-2xl p-4 flex flex-col justify-between shadow-2xs hover:shadow-md transition-all group cursor-pointer"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="w-8 h-8 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900/60 flex items-center justify-center text-[#FF4D4D]">
                          <FiCode className="w-4 h-4" />
                        </div>
                        {isComplete ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200/80 dark:border-emerald-900/60">
                            <FiCheckCircle className="w-2.5 h-2.5" /> Solved
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-[#222228] px-2 py-0.5 rounded-full">
                            {topic.count} Problems
                          </span>
                        )}
                      </div>

                      <div>
                        <h3 className="text-sm font-extrabold text-[#101828] dark:text-white group-hover:text-[#FF4D4D] transition-colors leading-snug">
                          {topic.label}
                        </h3>
                        <p className="text-[11px] text-[#64748B] dark:text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                          Core interview questions & pattern recognition
                          problems for {topic.label}.
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 mt-3 border-t border-slate-100 dark:border-[#24242A] flex items-center justify-between">
                      <span className="text-[11px] font-bold text-[#FF4D4D] group-hover:underline flex items-center gap-1">
                        Solve Sheet <FiArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <DsaUpsellModal
        open={showPayment}
        onViewPlans={handleViewPlans}
        onDismiss={handleDismissUpsell}
      />
    </div>
  );
};

export default function SheetsPage({ seoMeta }: PageProps) {
  return (
    <Fragment>
      <SEO seoMeta={seoMeta} appId="dsayatra" />
      <SheetsPageClient />
    </Fragment>
  );
}

export const getServerSideProps = async () =>
  getPreFetchProps({ slug: "/sheets", appId: "dsayatra" });
