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

import OnCampusLearningLayout from "@/components/OnCampusLearningLayout";

const DSAPrepPage = () => {
  const router = useRouter();
  const { loading: userLoading, isAuth, user } = useUser();
  const [selectedQuestion, setSelectedQuestion] = useState<DsaQuestion | null>(
    null,
  );
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

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

  const { questions, loading: topicQuestionsLoading } =
    useDsaQuestionsForTopic(selectedTopic);

  const { completedIds, toggleComplete, localNotes, saveNote } =
    useDsaCompletedQuestions({ userId: user?.id });

  const topicsCompletionMap = useMemo(() => {
    return (topicRows ?? []).reduce(
      (acc, row) => {
        // Since we don't have individual question completion status here without fetching each topic,
        // we'll leave this as false for now or implement a more complex check if needed.
        // For now, let's just provide the object to fix the ReferenceError.
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
      />
    </OnCampusLearningLayout>
  );
};

export default DSAPrepPage;
