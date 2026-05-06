import {
  DsaPrepWorkspace,
  DsaUpsellModal,
  FreemiumLockBanner,
  LearningEnvironmentLayout,
  LoadingSpinner,
  SEO,
} from "@tbe/components";
import { DSA_STUDY_GUIDE_CONFIGS, routes, TOPIC_LABELS } from "@tbe/constants";
import { useGamification, useGamifiedAction } from "@tbe/gamification";
import {
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
  persistAwardedQuestionId,
  readAwardedQuestionIds,
} from "@/utils/dsaGamificationAward";

const SheetsPageClient = () => {
  const router = useRouter();
  const { loading: userLoading, isAuth, user } = useUser();

  const [selectedQuestion, setSelectedQuestion] = useState<DsaQuestion | null>(
    null,
  );
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [showPayment, setShowPayment] = useState(false);

  // DSA Yatra is off-campus prep: pass offCampus=true (x1.5 bucket caps)
  // and the user-selected timeline so paid users get a study-plan-sized sheet.
  const dsaTimeline = (user as any)?.dsaYatra?.timeline as string | undefined;

  const {
    data: topicRows,
    isLoading: topicsLoading,
    isError: topicSummariesError,
    error: topicSummariesErrorValue,
    effectiveTargetCompanies: userTargetCompanies,
  } = useDsaTopicSummaries("DSA_YATRA", {
    duration: dsaTimeline,
    offCampus: true,
  });

  const topicsWithCounts = useMemo(
    () =>
      (topicRows ?? []).map((t) => ({
        topic: t.topic,
        count: t.count,
        label: TOPIC_LABELS[t.topic] || t.topic,
      })),
    [topicRows],
  );

  const {
    questions: topicQuestions,
    loading: topicQuestionsLoading,
    isError: topicQuestionsError,
    errorMessage: topicQuestionsErrorMessage,
  } = useDsaQuestionsForTopic(selectedTopic, {
    duration: dsaTimeline,
    offCampus: true,
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
  const { triggerGamifiedAction } = useGamifiedAction();
  const { refetch: refetchGamification } = useGamification();
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

      if (!willComplete) return;
      if (readAwardedQuestionIds().has(idStr)) return;

      void (async () => {
        await triggerGamifiedAction({
          gamificationAction: "COMPLETE_DSA_QUESTION",
          analytics: {
            action: "DSA_QUESTION_COMPLETED",
            category: "DSA Yatra",
            label: idStr,
          },
        });
        persistAwardedQuestionId(idStr);
        await refetchGamification();
      })();
    },
    [completedIds, toggleComplete, triggerGamifiedAction, refetchGamification],
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
