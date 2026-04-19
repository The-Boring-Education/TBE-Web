import {
  DsaPrepWorkspace,
  DsaUpsellModal,
  FreemiumLockBanner,
  LearningEnvironmentLayout,
  SEO,
} from "@tbe/components";
import { DSA_STUDY_GUIDE_CONFIGS, routes, TOPIC_LABELS } from "@tbe/constants";
import { useGamification, useGamifiedAction } from "@tbe/gamification";
import {
  useDsaCompletedQuestions,
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

  const { data: topicRows, isLoading: topicsLoading } = useDsaTopicSummaries();
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

  // DSA Yatra is off-campus prep: pass offCampus=true (×1.5 bucket caps)
  // and the user-selected timeline so paid users get a study-plan-sized sheet.
  const dsaTimeline = (user as any)?.dsaYatra?.timeline as string | undefined;
  const { questions: topicQuestions, loading: topicQuestionsLoading } =
    useDsaQuestionsForTopic(selectedTopic, {
      duration: dsaTimeline,
      offCampus: true,
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

  useEffect(() => {
    if (router.isReady && router.query.topic) {
      setSelectedTopic(router.query.topic as string);
    }
  }, [router.isReady, router.query.topic]);

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
    setSelectedQuestion(question);
    setShowPayment(false);
  };

  const handleTopicClick = (topic: string) => {
    setSelectedTopic(topic);
    setSelectedQuestion(null);
    setShowPayment(false);
  };

  const handleBackToTopics = () => {
    setSelectedTopic(null);
    setSelectedQuestion(null);
    setShowPayment(false);
  };

  if (sheetsLoading || userLoading || isProgressLoading) {
    return (
      <div className="flex min-h-screen bg-[#0A0A0A] font-sans items-center justify-center px-6 text-center">
        <div className="space-y-1">
          <p className="text-[12px] font-semibold text-gray-200 leading-tight">
            Loading workspace
            <span className="inline-flex w-4 justify-start" aria-hidden>
              <span className="animate-pulse">.</span>
              <span className="animate-pulse [animation-delay:150ms]">.</span>
              <span className="animate-pulse [animation-delay:300ms]">.</span>
            </span>
          </p>
          <p className="text-[10px] font-medium text-gray-500 leading-tight">
            Just a moment
          </p>
        </div>
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
