import { DsaPrepWorkspace, LoadingSpinner, Text } from "@tbe/components";
import { DSA_STUDY_GUIDE_CONFIGS, routes, TOPIC_LABELS } from "@tbe/constants";
import {
  useDsaCompletedQuestions,
  useDsaQuestionsForTopic,
  useDsaTopicSummaries,
  useUser,
} from "@tbe/hooks";
import type { DsaQuestion } from "@tbe/interface";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";

import { getOncampusPreferences } from "@/components/Onboarding/oncampusPreferences";
import OnCampusLearningLayout from "@/components/OnCampusLearningLayout";

const DSAPrepPage = () => {
  const router = useRouter();
  const { loading: userLoading, isAuth, user } = useUser();
  const [selectedQuestion, setSelectedQuestion] = useState<DsaQuestion | null>(
    null,
  );
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  // Preferences loaded from external onboarding app via /user/oncampus/preferences
  const [selectedDuration, setSelectedDuration] = useState<string>("6Months");
  const [offCampus, setOffCampus] = useState(false);
  const [prefsLoaded, setPrefsLoaded] = useState(false);

  // Load saved oncampus preferences (set by external onboarding app)
  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      try {
        const prefs = await getOncampusPreferences(user.id);
        if (prefs) {
          setSelectedDuration(prefs.duration || "6Months");
          setOffCampus(prefs.offCampus ?? false);
        }
      } catch {
        // Preferences not set yet
      } finally {
        setPrefsLoaded(true);
      }
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

  const { questions, loading: topicQuestionsLoading } = useDsaQuestionsForTopic(
    selectedTopic,
    { duration: selectedDuration, offCampus },
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

  if (pageLoading || !prefsLoaded) {
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

  return (
    <OnCampusLearningLayout
      backHref={routes.oncampus.dashboard}
      layoutMode="workspace"
    >
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
    </OnCampusLearningLayout>
  );
};

export default DSAPrepPage;
