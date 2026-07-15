import {
  DsaPrepWorkspace,
  DsaUpsellModal,
  FreemiumLockBanner,
  LearningEnvironmentLayout,
  LoadingSpinner,
  SEO,
} from "@tbe/components";
import {
  ANALYTICS_EVENTS,
  DSA_STUDY_GUIDE_CONFIGS,
  routes,
  TOPIC_LABELS,
} from "@tbe/constants";
import {
  calculateUserPointsForAction,
  useGamification,
  useGamificationContext,
} from "@tbe/gamification";
import {
  useDsaCompletedQuestions,
  useDsaPrepUrlSync,
  useDsaQuestionsForTopic,
  useDsaTopics,
  useDsaTopicSummaries,
  useUser,
} from "@tbe/hooks";
import type { DsaQuestion, PageProps } from "@tbe/interface";
import { getPreFetchProps, trackEvent } from "@tbe/utils";
import { useRouter } from "next/router";
import { Fragment, useCallback, useEffect, useMemo, useState } from "react";

const SheetsPageClient = () => {
  const router = useRouter();
  const { loading: userLoading, isAuth, user } = useUser();

  const [selectedQuestion, setSelectedQuestion] = useState<DsaQuestion | null>(
    null,
  );
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [showPayment, setShowPayment] = useState(false);

  const {
    data: topicRows,
    isLoading: topicsLoading,
    isError: topicSummariesError,
    error: topicSummariesErrorValue,
  } = useDsaTopicSummaries("DSA_YATRA");
  const userTargetCompanies = useMemo(() => {
    const pyTargets = (user as any)?.prepYatra?.targetCompanies || [];
    const dsaTarget = (user as any)?.dsaYatra?.target;

    let dsaMapped: string[] = [];
    if (dsaTarget === "Product-based") {
      dsaMapped = ["MNC", "FAANG"];
    } else if (dsaTarget === "Startups") {
      dsaMapped = ["Startup"];
    }

    return Array.from(new Set([...pyTargets, ...dsaMapped]));
  }, [user]);

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

  const {
    completedIds,
    toggleComplete,
    localNotes,
    saveNote: onSaveNote,
    isProgressLoading,
  } = useDsaCompletedQuestions({ userId: user?.id });
  const { refetch: refetchGamification } = useGamification();
  const { triggerCelebration, showToast } = useGamificationContext();
  const { topicsCompletionMap } = useDsaTopics(
    questionsForCompletion,
    completedIds,
    topicsWithCounts,
  );

  // Derive freemium state directly from the API response — no client-side bucket logic
  const hasLockedQuestions = topicQuestions.some((q) => q.isLocked);
  const lockedQuestionIds = useMemo(() => {
    if (!hasLockedQuestions) return undefined;
    const ids = new Set<string>();
    for (const q of topicQuestions) {
      if (q.isLocked) ids.add(String(q.id || q.name));
    }
    return ids;
  }, [hasLockedQuestions, topicQuestions]);

  const unlockedCount = topicQuestions.filter((q) => !q.isLocked).length;

  const handleToggleComplete = useCallback(
    (questionId: string | number) => {
      const idStr = String(questionId);
      const willComplete = !completedIds.includes(questionId);
      toggleComplete(questionId);

      if (willComplete) {
        const pointsEarned = calculateUserPointsForAction("COMPLETE_QUESTION");
        const intensity =
          pointsEarned >= 50 ? "high" : pointsEarned >= 20 ? "medium" : "low";
        triggerCelebration({ type: "points", intensity });
        showToast({
          type: "points",
          message: "DSA question solved! Great work!",
          points: pointsEarned,
        });
        trackEvent({
          action: "DSA_QUESTION_COMPLETED",
          category: "DSA Yatra",
          label: idStr,
        });
      }

      void refetchGamification();
    },
    [completedIds, toggleComplete, refetchGamification, triggerCelebration, showToast, trackEvent],
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

  const {
    handleTopicClick,
    handleQuestionClick: handleUrlSyncQuestionClick,
    handleBackToTopics,
  } = useDsaPrepUrlSync({
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

  const handleQuestionClick = (question: DsaQuestion) => {
    if (question.isLocked) {
      setShowPayment(true);
      return;
    }
    setShowPayment(false);
    try {
      trackEvent(ANALYTICS_EVENTS.DSA_QUESTION_VIEW, {
        question_id: String(question._id ?? question.id),
        topic: selectedTopic ?? undefined,
      });
    } catch {
      /* ignore analytics errors */
    }
    handleUrlSyncQuestionClick(question);
  };

  if (sheetsLoading || userLoading || isProgressLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0A0A0A]">
        <LoadingSpinner />
      </div>
    );
  }

  if (sheetsErrorMessage) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#0A0A0A] px-6 text-center">
        <p className="mb-3 text-lg font-semibold text-[#ff6b6b]">
          Unable to load DSA sheet
        </p>
        <p className="mb-6 max-w-xl text-sm text-[#a0a0a0]">
          {sheetsErrorMessage}
        </p>
        <button
          type="button"
          onClick={() => router.reload()}
          className="rounded-md border border-[#ff5757]/40 px-4 py-2 text-sm font-semibold text-[#ff5757] transition-colors hover:bg-[#ff5757]/10"
        >
          Try again
        </button>
      </div>
    );
  }

  const handleViewPlans = () => router.push(routes.dsayatra.pricing);
  const handleDismissUpsell = () => {
    setShowPayment(false);
    setSelectedQuestion(null);
  };

  return (
    <LearningEnvironmentLayout backHref="/dashboard" layoutMode="workspace">
      {hasLockedQuestions && (
        <FreemiumLockBanner
          unlockedCount={unlockedCount}
          onUpgradeClick={handleViewPlans}
        />
      )}
      <DsaPrepWorkspace
        questions={questions}
        topicsWithCounts={topicsWithCounts}
        selectedTopic={selectedTopic}
        selectedQuestion={showPayment ? null : selectedQuestion}
        onTopicClick={handleTopicClick}
        onQuestionClick={handleQuestionClick}
        onBackToTopics={handleBackToTopics}
        completionMap={topicsCompletionMap}
        completedQuestionIds={completedIds}
        onToggleComplete={handleToggleComplete}
        localNotes={localNotes}
        onSaveNote={onSaveNote}
        studyGuideConfigs={DSA_STUDY_GUIDE_CONFIGS}
        userTargetCompanies={userTargetCompanies}
        freemiumLockedQuestionIds={lockedQuestionIds}
        onFreemiumLockedClick={() => setShowPayment(true)}
      />
      <DsaUpsellModal
        open={showPayment}
        onViewPlans={handleViewPlans}
        onDismiss={handleDismissUpsell}
      />
    </LearningEnvironmentLayout>
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
