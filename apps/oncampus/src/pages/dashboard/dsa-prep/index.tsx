import {
  DsaPrepWorkspace,
  LearningEnvironmentLayout,
  LoadingSpinner,
  Text,
} from "@tbe/components";
import {
  DSA_STUDY_GUIDE_CONFIGS,
  DSA_TIMELINES,
  routes,
  TOPIC_LABELS,
} from "@tbe/constants";
import {
  useDsaCompletedQuestions,
  useDsaQuestionsForTopic,
  useDsaTopicSummaries,
  useUser,
} from "@tbe/hooks";
import type { DsaQuestion } from "@tbe/interface";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useState } from "react";

import OncampusOnboarding from "@/components/Onboarding/OncampusOnboarding";
import {
  getOncampusPreferences,
  saveOncampusPreferences,
} from "@/components/Onboarding/oncampusPreferences";

const DSAPrepPage = () => {
  const router = useRouter();
  const { loading: userLoading, isAuth, user } = useUser();
  const [selectedQuestion, setSelectedQuestion] = useState<DsaQuestion | null>(
    null,
  );
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<string>("6Months");
  const [offCampus, setOffCampus] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingDone, setOnboardingDone] = useState(false);
  const [prefsLoaded, setPrefsLoaded] = useState(false);

  // Load saved oncampus preferences on mount
  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      const prefs = await getOncampusPreferences(user.id);
      if (prefs) {
        setSelectedDuration(prefs.duration || "6Months");
        setOffCampus(prefs.offCampus ?? false);
        setOnboardingDone(true);
      } else {
        setShowOnboarding(true);
      }
      setPrefsLoaded(true);
    })();
  }, [user?.id]);

  const { data: topicRows, isLoading: topicsLoading } = useDsaTopicSummaries();
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

  // Pass both duration AND offCampus to the query
  const { questions, loading: topicQuestionsLoading } = useDsaQuestionsForTopic(
    selectedTopic,
    {
      duration: selectedDuration,
      offCampus,
    },
  );

  const { completedIds, toggleComplete, localNotes, saveNote } =
    useDsaCompletedQuestions({ userId: user?.id });

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

  useEffect(() => {
    if (!userLoading && !isAuth) {
      router.push("/login");
    }
  }, [userLoading, isAuth, router]);

  const handleQuestionClick = (question: DsaQuestion) => {
    setSelectedQuestion(question);
  };

  const handleTopicClick = (topic: string) => {
    setSelectedTopic(topic);
    setSelectedQuestion(null);
  };

  const handleBackToTopics = () => {
    setSelectedTopic(null);
    setSelectedQuestion(null);
  };

  const handleOnboardingComplete = useCallback(
    async (prefs: { duration: string; offCampus: boolean }) => {
      setSelectedDuration(prefs.duration);
      setOffCampus(prefs.offCampus);
      setShowOnboarding(false);
      setOnboardingDone(true);
      if (user?.id) {
        await saveOncampusPreferences(user.id, prefs);
      }
    },
    [user?.id],
  );

  if (pageLoading || !prefsLoaded) {
    return (
      <LearningEnvironmentLayout backHref={routes.oncampus.dashboard} isLoading>
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner height={8} width={8} />
          <Text level="p" className="text-gray-400 ml-3">
            Loading...
          </Text>
        </div>
      </LearningEnvironmentLayout>
    );
  }

  return (
    <>
      <OncampusOnboarding
        userId={user?.id || ""}
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onComplete={handleOnboardingComplete}
      />

      <LearningEnvironmentLayout
        backHref={routes.oncampus.dashboard}
        layoutMode="workspace"
      >
        {/* Duration + Off Campus Selector Banner */}
        <div className="w-full bg-[#0A0A0A] border-b border-gray-800 px-4 py-2 flex items-center gap-4 shrink-0 flex-wrap">
          <Text
            level="p"
            className="text-xs font-bold text-gray-400 uppercase tracking-wider shrink-0"
          >
            Timeline:
          </Text>
          <div className="flex items-center gap-2">
            {DSA_TIMELINES.map((tl) => (
              <button
                key={tl.value}
                onClick={() => setSelectedDuration(tl.value)}
                className={`px-3 py-1.5 text-[11px] font-bold rounded-md border transition-all duration-200 ${
                  selectedDuration === tl.value
                    ? "bg-red-600/20 border-red-500/50 text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.15)]"
                    : "bg-transparent border-gray-700/50 text-gray-400 hover:border-gray-500 hover:text-gray-200"
                }`}
              >
                {tl.label}
              </button>
            ))}
          </div>

          <div className="h-4 w-px bg-gray-700" />

          <Text
            level="p"
            className="text-xs font-bold text-gray-400 uppercase tracking-wider shrink-0"
          >
            Off Campus:
          </Text>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setOffCampus(true)}
              className={`px-3 py-1.5 text-[11px] font-bold rounded-md border transition-all duration-200 ${
                offCampus
                  ? "bg-green-600/20 border-green-500/50 text-green-400"
                  : "bg-transparent border-gray-700/50 text-gray-400 hover:border-gray-500 hover:text-gray-200"
              }`}
            >
              ✅ Yes
            </button>
            <button
              onClick={() => setOffCampus(false)}
              className={`px-3 py-1.5 text-[11px] font-bold rounded-md border transition-all duration-200 ${
                !offCampus
                  ? "bg-red-600/20 border-red-500/50 text-red-400"
                  : "bg-transparent border-gray-700/50 text-gray-400 hover:border-gray-500 hover:text-gray-200"
              }`}
            >
              ❌ No
            </button>
          </div>

          <Text level="p" className="text-[10px] text-gray-600 hidden md:block">
            {offCampus
              ? "Showing campus + off-campus questions"
              : "Showing campus placement questions only"}
          </Text>
        </div>

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
          onToggleComplete={toggleComplete}
          localNotes={localNotes}
          onSaveNote={saveNote}
          studyGuideConfigs={DSA_STUDY_GUIDE_CONFIGS}
          userTargetCompanies={userTargetCompanies}
        />
      </LearningEnvironmentLayout>
    </>
  );
};

export default DSAPrepPage;
