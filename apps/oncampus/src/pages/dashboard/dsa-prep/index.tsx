import {
  DsaPrepWorkspace,
  FlexContainer,
  LearningEnvironmentLayout,
  LoadingSpinner,
  Text,
} from "@tbe/components";
import { routes } from "@tbe/constants";
import { useDsaMetadata, useUser } from "@tbe/hooks";
import type { DsaQuestion } from "@tbe/interface";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const DSAPrepPage = () => {
  const router = useRouter();
  const { loading: userLoading, isAuth } = useUser();

  const [selectedQuestion, setSelectedQuestion] = useState<DsaQuestion | null>(
    null,
  );
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  const { topicsWithCounts, loading: metadataLoading } = useDsaMetadata();

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

  if (metadataLoading || userLoading) {
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
    <LearningEnvironmentLayout
      backHref={routes.oncampus.dashboard}
      layoutMode="workspace"
    >
      <DsaPrepWorkspace
        topicsWithCounts={topicsWithCounts}
        selectedTopic={selectedTopic}
        selectedQuestion={selectedQuestion}
        onTopicClick={handleTopicClick}
        onQuestionClick={handleQuestionClick}
        onBackToTopics={handleBackToTopics}
        emptyStateContent={
          <FlexContainer
            className="h-full"
            itemCenter
            justifyCenter
            fullWidth
            wrap={false}
          >
            <div className="text-center space-y-2">
              <Text level="p" className="text-gray-400 text-lg">
                Select a topic from the left to start practicing
              </Text>
              <Text level="p" className="text-gray-500 text-sm italic">
                Unlock your potential with structured learning
              </Text>
            </div>
          </FlexContainer>
        }
      />
    </LearningEnvironmentLayout>
  );
};

export default DSAPrepPage;
