import {
  DsaPrepWorkspace,
  LearningEnvironmentLayout,
  LoadingSpinner,
  SEO,
} from "@tbe/components";
import { DSA_STUDY_GUIDE_CONFIGS, TOPIC_LABELS } from "@tbe/constants";
import { useGamification, useGamifiedAction } from "@tbe/gamification";
import {
  useDsaCompletedQuestions,
  useDsaPrepUrlSync,
  useDsaQuestionsForTopic,
  useDsaTopics,
  useDsaTopicSummaries,
  useUser,
} from "@tbe/hooks";
import type { DsaQuestion, PageProps, UserProfile } from "@tbe/interface";
import { userService } from "@tbe/services";
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

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);

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
    useDsaQuestionsForTopic(selectedTopic, {
      // Prefer user from auth context (set during onboarding), fall back to profile fetch
      duration:
        (user as any)?.dsaYatra?.timeline || profile?.dsaYatra?.timeline,
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
    if (user?.id) {
      setIsProfileLoading(true);
      userService
        .getProfile(user.id)
        .then((p) => {
          setProfile(p);
          setIsProfileLoading(false);
        })
        .catch(() => setIsProfileLoading(false));
    } else if (!userLoading) {
      setIsProfileLoading(false);
    }
  }, [user?.id, userLoading]);

  const { handleTopicClick, handleQuestionClick, handleBackToTopics } =
    useDsaPrepUrlSync({
      router,
      selectedTopic,
      setSelectedTopic,
      setSelectedQuestion,
      topicQuestions,
      topicQuestionsLoading,
    });

  useEffect(() => {
    if (!userLoading && !isAuth) {
      router.push("/login");
    }
  }, [userLoading, isAuth, router]);

  if (sheetsLoading || userLoading || isProfileLoading || isProgressLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#0A0A0A] font-sans items-center justify-center relative overflow-hidden">
        {/* Subtle Glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#ff5757]/5 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative flex flex-col items-center gap-6">
          <div className="relative">
            <div className="absolute inset-0 bg-[#ff5757]/20 rounded-full blur-xl animate-pulse" />
            <div className="relative p-4 bg-[#111] border border-[#222] rounded-2xl shadow-2xl">
              <LoadingSpinner height={6} width={6} borderColour="#ff5757" />
            </div>
          </div>
          <div className="text-center space-y-1">
            <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] animate-pulse">
              Syncing Workspace
            </h3>
            <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">
              Preparing your personalized curriculum
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <LearningEnvironmentLayout backHref="/dashboard" layoutMode="workspace">
      <DsaPrepWorkspace
        questions={questions}
        topicsWithCounts={topicsWithCounts}
        selectedTopic={selectedTopic}
        selectedQuestion={selectedQuestion}
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
