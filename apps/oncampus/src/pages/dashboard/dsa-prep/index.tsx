import {
  DsaPrepWorkspace,
  DsaUpsellModal,
  FreemiumLockBanner,
  LoadingSpinner,
  Text,
} from "@tbe/components";
import { DSA_STUDY_GUIDE_CONFIGS, routes, TOPIC_LABELS } from "@tbe/constants";
import {
  useDsaCompletedQuestions,
  useDsaPrepUrlSync,
  useDsaQuestionsForTopic,
  useDsaTopicSummaries,
  useUser,
} from "@tbe/hooks";
import type { DsaQuestion } from "@tbe/interface";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";

import OnCampusLearningLayout from "@/components/OnCampusLearningLayout";

const DSAPrepPage = () => {
  const router = useRouter();
  const { loading: userLoading, isAuth, user } = useUser();
  const [selectedQuestion, setSelectedQuestion] = useState<DsaQuestion | null>(
    null,
  );
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  const {
    data: topicRows,
    isLoading: topicsLoading,
    isError: topicsError,
    error: topicsErrorValue,
  } = useDsaTopicSummaries("ONCAMPUS");
  const topicsWithCounts = useMemo(
    () =>
      (topicRows ?? []).map((t) => ({
        topic: t.topic,
        count: t.count,
        label: TOPIC_LABELS[t.topic] || t.topic,
      })),
    [topicRows],
  );

  // Map user target companies from their profile for company-type filtering display
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

  const {
    questions,
    loading: topicQuestionsLoading,
    isError: topicQuestionsError,
    errorMessage: topicQuestionsErrorMessage,
  } = useDsaQuestionsForTopic(selectedTopic, {
    productType: "ONCAMPUS",
  });

  const { completedIds, toggleComplete, localNotes, saveNote } =
    useDsaCompletedQuestions({ userId: user?.id });

  // Freemium state mirrors DSA Yatra sheets: rely on API `isLocked` flags.
  const [showPayment, setShowPayment] = useState(false);
  const hasLockedQuestions = questions.some((q) => q.isLocked);
  const lockedQuestionIds = useMemo(() => {
    if (!hasLockedQuestions) return undefined;
    const ids = new Set<string>();
    for (const q of questions) {
      if (q.isLocked) ids.add(String(q.id || q.name));
    }
    return ids;
  }, [hasLockedQuestions, questions]);
  const unlockedCount = questions.filter((q) => !q.isLocked).length;

  const handleUpgrade = () => router.push(routes.oncampus.pricing);
  const handleDismissUpsell = () => {
    setShowPayment(false);
    setSelectedQuestion(null);
  };

  const topicsCompletionMap = useMemo(() => {
    return (topicRows ?? []).reduce(
      (acc, row) => {
        acc[row.topic] = false;
        return acc;
      },
      {} as Record<string, boolean>,
    );
  }, [topicRows]);

  const pageLoading =
    userLoading || topicsLoading || (!!selectedTopic && topicQuestionsLoading);
  const dsaErrorMessage = topicsError
    ? topicsErrorValue instanceof Error
      ? topicsErrorValue.message
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

  // Intercept clicks on locked questions to show the upsell modal instead of
  // navigating into a locked question.
  const handleQuestionClick = (question: DsaQuestion) => {
    if (question.isLocked) {
      setShowPayment(true);
      return;
    }
    setShowPayment(false);
    handleUrlSyncQuestionClick(question);
  };

  useEffect(() => {
    if (!userLoading && !isAuth) {
      router.push("/login");
    }
  }, [userLoading, isAuth, router]);

  if (pageLoading) {
    return (
      <OnCampusLearningLayout backHref={routes.oncampus.dashboard} isLoading>
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner height={8} width={8} />
          <Text level="p" className="text-gray-400 ml-3">
            Loading...
          </Text>
        </div>
      </OnCampusLearningLayout>
    );
  }

  if (dsaErrorMessage) {
    return (
      <OnCampusLearningLayout backHref={routes.oncampus.dashboard}>
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <Text level="h2" className="text-xl font-bold text-red-500 mb-2">
            Failed to load DSA prep
          </Text>
          <Text level="p" className="text-gray-400 mb-6 max-w-xl">
            {dsaErrorMessage}
          </Text>
          <button
            type="button"
            onClick={() => router.reload()}
            className="rounded-md border border-red-500/40 px-4 py-2 text-sm font-semibold text-red-500 transition-colors hover:bg-red-500/10"
          >
            Try again
          </button>
        </div>
      </OnCampusLearningLayout>
    );
  }

  return (
    <OnCampusLearningLayout
      backHref={routes.oncampus.dashboard}
      layoutMode="workspace"
    >
      {hasLockedQuestions && (
        <FreemiumLockBanner
          unlockedCount={unlockedCount}
          onUpgradeClick={handleUpgrade}
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
        onToggleComplete={toggleComplete}
        localNotes={localNotes}
        onSaveNote={saveNote}
        studyGuideConfigs={DSA_STUDY_GUIDE_CONFIGS}
        userTargetCompanies={userTargetCompanies}
        freemiumLockedQuestionIds={lockedQuestionIds}
        onFreemiumLockedClick={() => setShowPayment(true)}
      />
      <DsaUpsellModal
        open={showPayment}
        onViewPlans={handleUpgrade}
        onDismiss={handleDismissUpsell}
        title="Unlock OnCampus"
        description="Subscribe to OnCampus to access all DSA questions, solutions, and study guides."
      />
    </OnCampusLearningLayout>
  );
};

export default DSAPrepPage;
