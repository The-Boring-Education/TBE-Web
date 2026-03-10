import {
  Button,
  DsaQuestionList,
  FlexContainer,
  LearningEnvironmentLayout,
  LoadingSpinner,
  QuestionDetailPanel,
  Text,
} from "@tbe/components";
import { routes } from "@tbe/constants";
import { useApi, useUser } from "@tbe/hooks";
import type { DsaQuestion } from "@tbe/interface";
import { useRouter } from "next/router";
import React, { useEffect, useMemo, useState } from "react";

import { transformAptitudeQuestion } from "../../../utils/aptitudeHelpers";

const AptitudePrepPage = () => {
  const router = useRouter();
  const { loading: userLoading, isAuth } = useUser();
  const [selectedQuestion, setSelectedQuestion] = useState<DsaQuestion | null>(
    null,
  );
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [selectedTopicLabel, setSelectedTopicLabel] = useState<string>("");

  // Fetch Topics
  const { response: topicsResponse, loading: topicsLoading } = useApi(
    "aptitude-topics",
    {
      url: `${routes.api.base}${routes.api.interviewPrep}?roadmap=APTITUDE`,
    },
  );

  // Fetch Questions (Manual Trigger)
  const {
    response: questionsResponse,
    loading: questionsLoading,
    makeRequest: fetchQuestions,
  } = useApi("aptitude-questions", undefined, { enabled: false });

  const topicsWithCounts = useMemo(() => {
    const data = topicsResponse?.data;
    if (!Array.isArray(data)) return [];

    return data
      .map((t: any) => ({
        topic: t.slug,
        count: t.questionCount,
        label: t.name,
      }))
      .sort((a: any, b: any) => a.label.localeCompare(b.label));
  }, [topicsResponse]);

  const filteredQuestions = useMemo(() => {
    const data = questionsResponse?.data?.questions;
    if (!Array.isArray(data)) return [];
    return data.map(transformAptitudeQuestion);
  }, [questionsResponse]);

  useEffect(() => {
    if (selectedTopic) {
      fetchQuestions({
        url: `${routes.api.base}${routes.api.interviewPrep}?roadmap=APTITUDE&topic=${selectedTopic}&limit=100`,
      });
      setSelectedQuestion(null);
    }
  }, [selectedTopic, fetchQuestions]);

  useEffect(() => {
    if (!userLoading && !isAuth) {
      router.push("/login");
    }
  }, [userLoading, isAuth, router]);

  const handleQuestionClick = (question: DsaQuestion) => {
    setSelectedQuestion(question);
  };

  const handleTopicClick = (topic: string, label: string) => {
    setSelectedTopic(topic);
    setSelectedTopicLabel(label);
  };

  const handleBackToTopics = () => {
    setSelectedTopic(null);
    setSelectedQuestion(null);
    setSelectedTopicLabel("");
  };

  const overallLoading = userLoading || topicsLoading;

  if (overallLoading) {
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

  if (topicsResponse?.error) {
    return (
      <LearningEnvironmentLayout backHref={routes.oncampus.dashboard}>
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <Text level="h2" className="text-xl font-bold text-red-500 mb-2">
            Failed to load topics
          </Text>
          <Text level="p" className="text-gray-400 mb-6">
            There was an error fetching the aptitude topics. Please try again.
          </Text>
          <Button
            onClick={() => router.reload()}
            variant="PRIMARY"
            text="Retry"
          />
        </div>
      </LearningEnvironmentLayout>
    );
  }

  return (
    <LearningEnvironmentLayout
      backHref={routes.oncampus.dashboard}
      layoutMode="workspace"
    >
      <FlexContainer
        direction="col"
        className="lg:flex-row flex-1 min-h-0 w-full h-full"
        itemCenter={false}
        justifyCenter={false}
        wrap={false}
      >
        {/* Left Sidebar - Topics or Questions */}
        <div
          className={`flex flex-col flex-shrink-0 border-r border-gray-800 transition-all duration-300 ${selectedTopic ? "w-full lg:w-72" : "flex-1 lg:flex-none w-full lg:w-72"}`}
        >
          <div className="flex-1 overflow-y-auto px-4 py-4 scrollbar-thin-grey">
            {!selectedTopic ? (
              <div className="space-y-3">
                <div className="mb-3">
                  <h1 className="mt-2 text-xl font-bold text-white">
                    Aptitude Prep
                  </h1>
                  <p className="text-xs text-gray-400">
                    Choose a Topic to Begin
                  </p>
                </div>

                <FlexContainer
                  direction="col"
                  fullWidth
                  itemCenter={false}
                  justifyCenter={false}
                  wrap={false}
                  className="gap-1"
                >
                  {topicsWithCounts.map(({ topic, count, label }, index) => (
                    <div
                      key={topic}
                      className="w-full border border-gray-800 rounded-lg px-3 py-2.5 hover:border-primary hover:bg-primary/5 transition-all duration-200 cursor-pointer bg-transparent group"
                      onClick={() => handleTopicClick(topic, label)}
                    >
                      <FlexContainer
                        className="justify-start gap-3"
                        fullWidth
                        itemCenter
                      >
                        <div className="flex items-center justify-center w-2 h-2 rounded-full bg-gray-900 border border-gray-700 text-gray-500 text-[10px] font-bold group-hover:border-primary group-hover:text-primary transition-all duration-200 shrink-0 -ml-1">
                          {index + 1}
                        </div>
                        <Text
                          level="p"
                          className="flex-1 text-gray-300 text-sm font-medium truncate group-hover:text-white"
                        >
                          {label}
                        </Text>
                        <Text
                          level="span"
                          className="text-xs font-semibold text-gray-500"
                        >
                          {count}
                        </Text>
                      </FlexContainer>
                    </div>
                  ))}
                </FlexContainer>
              </div>
            ) : (
              <div className="space-y-3">
                <Button
                  onClick={handleBackToTopics}
                  variant="OUTLINE"
                  size="SMALL"
                  text="← All Topics"
                  className="border-gray-700 bg-transparent hover:border-primary hover:bg-primary/10"
                />

                <div className="mb-1">
                  <h1 className="mt-2 text-xl font-bold text-white">
                    Explore Questions
                  </h1>
                  <p className="mb-2 text-xs text-gray-400">
                    Choose a Question to Begin
                  </p>
                  {questionsLoading ? (
                    <div className="flex items-center justify-center py-10">
                      <LoadingSpinner height={6} width={6} />
                    </div>
                  ) : questionsResponse?.error ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center px-4">
                      <Text level="p" className="text-red-400 text-sm mb-4">
                        Failed to load questions
                      </Text>
                      <Button
                        onClick={() =>
                          fetchQuestions({
                            url: `${routes.api.base}${routes.api.interviewPrep}?roadmap=APTITUDE&topic=${selectedTopic}&limit=100`,
                          })
                        }
                        variant="OUTLINE"
                        size="SMALL"
                        text="Retry"
                      />
                    </div>
                  ) : (
                    <DsaQuestionList
                      questions={filteredQuestions}
                      selectedQuestionId={selectedQuestion?.id}
                      onQuestionClick={handleQuestionClick}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div
          className={`flex-1 flex flex-col min-w-0 bg-[#0A0A0A] ${!selectedTopic ? "hidden lg:flex" : "flex"}`}
        >
          <div
            className="flex-1 overflow-y-auto scrollbar-thin-grey px-2 py-4 scroll-smooth"
            id="right-scroll-area"
          >
            {!selectedTopic ? (
              <FlexContainer
                className="h-full"
                itemCenter
                justifyCenter
                fullWidth
                wrap={false}
              >
                <div className="text-center space-y-2">
                  <Text level="p" className="text-gray-400 text-lg">
                    Select an aptitude topic from the left to start practicing
                  </Text>
                  <Text level="p" className="text-gray-500 text-sm italic">
                    Unlock your true logical thinking potential
                  </Text>
                </div>
              </FlexContainer>
            ) : (
              <div className="w-full px-4">
                <div className="mb-4 pb-4 border-b border-gray-800/50">
                  <Text
                    level="h2"
                    className="text-2xl font-bold text-white mb-1"
                  >
                    {selectedTopicLabel}
                  </Text>
                  <Text level="p" className="text-sm text-gray-400">
                    Continue your {selectedTopicLabel} aptitude preparation.
                  </Text>
                </div>

                <div className="pb-1 w-full">
                  <QuestionDetailPanel question={selectedQuestion} />
                </div>
              </div>
            )}
          </div>
        </div>
      </FlexContainer>
    </LearningEnvironmentLayout>
  );
};

export default AptitudePrepPage;
