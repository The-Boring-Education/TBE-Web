import {
  DsaPrepWorkspace,
  LearningEnvironmentLayout,
  LoadingSpinner,
  SEO,
  Text,
} from "@tbe/components";
import { DSA_STUDY_GUIDE_CONFIGS, routes, TOPIC_LABELS } from "@tbe/constants";
import { useGamification, useGamifiedAction } from "@tbe/gamification";
import { usePaymentStatus } from "@tbe/hooks";
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
import { FaLock } from "react-icons/fa";

import {
  persistAwardedQuestionId,
  readAwardedQuestionIds,
} from "@/utils/dsaGamificationAward";

/** Freemium per-difficulty caps — must match the DB query in interview-prep.ts */
const FREEMIUM_LIMITS: Record<string, number> = {
  EASY: 5,
  MEDIUM: 3,
  HARD: 1,
  RW: 1,
};

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

  const { questions: topicQuestions, loading: topicQuestionsLoading } =
    useDsaQuestionsForTopic(selectedTopic);

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

  // Freemium detection: DSA_YATRA is a premium product
  const { isPurchased, isLoading: isPaymentLoading } = usePaymentStatus({
    userId: user?.id,
    productId: "lifetime",
    productType: "DSA_YATRA",
    isPremium: true,
  });

  const isFreemiumUser = isPurchased === false;

  /** Compute which question IDs are locked for freemium users and count of unlocked ones */
  const { freemiumLockedQuestionIds, freemiumUnlockedCount } = useMemo(() => {
    if (!isFreemiumUser || topicQuestions.length === 0) {
      return { freemiumLockedQuestionIds: undefined, freemiumUnlockedCount: 0 };
    }

    const getBucket = (q: DsaQuestion): string => {
      if (q.isRealWorldProblem) return "RW";
      return (q.difficultyLevel ?? "").toUpperCase();
    };

    const bucketCounts: Record<string, number> = {};
    const locked = new Set<string>();
    let unlocked = 0;

    for (const q of topicQuestions) {
      const qId = String(q.id || q.name);
      const bucket = getBucket(q);
      const limit = FREEMIUM_LIMITS[bucket] ?? 999;
      const count = bucketCounts[bucket] ?? 0;
      if (count >= limit) {
        locked.add(qId);
      } else {
        unlocked += 1;
      }
      bucketCounts[bucket] = count + 1;
    }

    return {
      freemiumLockedQuestionIds: locked,
      freemiumUnlockedCount: unlocked,
    };
  }, [isFreemiumUser, topicQuestions]);

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
    const qId = String(question.id || question.name);
    if (freemiumLockedQuestionIds?.has(qId)) {
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

  if (sheetsLoading || userLoading || isPaymentLoading || isProgressLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#0A0A0A] font-sans items-center justify-center">
        <div className="flex items-center">
          <LoadingSpinner height={4} width={4} borderColour="white" />
          <Text level="p" className="text-gray-400 ml-3">
            Loading Sheet...
          </Text>
        </div>
      </div>
    );
  }

  return (
    <LearningEnvironmentLayout backHref="/dashboard" layoutMode="workspace">
      {isFreemiumUser && (
        <div className="w-full bg-orange-950/40 border-b border-orange-900/50 px-4 py-2.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <FaLock className="text-orange-400 text-xs" />
            <Text level="p" className="text-orange-300 text-[11px] font-medium">
              Freemium preview — {freemiumUnlockedCount} questions unlocked.
              Subscribe to access all.
            </Text>
          </div>
          <button
            onClick={() => router.push(routes.dsayatra.pricing)}
            className="text-[11px] font-bold text-orange-300 hover:text-orange-200 underline underline-offset-2 transition-colors"
          >
            View Plans
          </button>
        </div>
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
        freemiumLockedQuestionIds={freemiumLockedQuestionIds}
        onFreemiumLockedClick={(qId) => {
          void qId;
          setShowPayment(true);
        }}
      />
      {showPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md relative">
            <div className="bg-[#111] border border-gray-800 rounded-2xl p-6 shadow-2xl">
              <div className="flex flex-col items-center text-center gap-4">
                <div className="w-14 h-14 rounded-full bg-red-500/15 flex items-center justify-center">
                  <FaLock className="text-red-400 text-xl" />
                </div>
                <div>
                  <Text
                    level="h3"
                    className="text-white font-bold mb-1.5 tracking-tight"
                  >
                    Unlock DSA Yatra
                  </Text>
                  <Text
                    level="p"
                    className="text-gray-400 text-sm leading-relaxed"
                  >
                    Subscribe to access all questions, solutions, and study
                    guides. One plan, lifetime access.
                  </Text>
                </div>
                <button
                  onClick={() => router.push(routes.dsayatra.pricing)}
                  className="w-full py-2.5 rounded-full bg-red-600 hover:bg-red-500 text-white font-bold text-sm transition-all duration-300 shadow-[0_4px_15px_rgba(220,38,38,0.25)] hover:shadow-[0_4px_20px_rgba(220,38,38,0.35)]"
                >
                  View Plans — Subscribe Now
                </button>
                <button
                  onClick={() => {
                    setShowPayment(false);
                    setSelectedQuestion(null);
                  }}
                  className="text-gray-500 hover:text-gray-300 text-xs font-medium transition-colors"
                >
                  Continue with free questions
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
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
