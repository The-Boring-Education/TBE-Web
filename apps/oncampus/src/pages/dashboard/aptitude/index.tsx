import {
  AptitudeQuizPanel,
  AptitudeStudyGuide,
  Button,
  FlexContainer,
  LearningEnvironmentLayout,
  LoadingSpinner,
  Text,
} from "@tbe/components";
import { routes } from "@tbe/constants";
import { useApi, useUser } from "@tbe/hooks";
import type { AptitudeQuestion } from "@tbe/interface";
import { AlertTriangle, Folder, FolderOpen, Lightbulb } from "lucide-react";
import { useRouter } from "next/router";
import React, { useEffect, useMemo, useState } from "react";

const AptitudePrepPage = () => {
  const router = useRouter();
  const { loading: userLoading, isAuth } = useUser();
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [selectedTopicLabel, setSelectedTopicLabel] = useState<string>("");
  const [isTopicEmpty, setIsTopicEmpty] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<"STUDY" | "QUIZ">("STUDY");



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

  // Fetch Study Guide (Manual Trigger)
  const {
    response: studyGuideResponse,
    loading: studyGuideLoading,
    makeRequest: fetchStudyGuide,
  } = useApi("aptitude-study-guide", undefined, { enabled: false });

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

  const questions = useMemo(() => {
    const data = questionsResponse?.data?.questions;
    if (!Array.isArray(data)) return [];
    return data as AptitudeQuestion[];
  }, [questionsResponse]);

  useEffect(() => {
    if (selectedTopic && topicsWithCounts.length > 0) {
      const topicData = topicsWithCounts.find((t) => t.topic === selectedTopic);

      // Always fetch study guide if a topic is selected
      fetchStudyGuide({
        url: `${routes.api.base}${routes.api.interviewPrep}/aptitude/study-guide?topic=${selectedTopic}`,
      });

      if (topicData && topicData.count === 0) {
        setIsTopicEmpty(true);
      } else {
        setIsTopicEmpty(false);
        fetchQuestions({
          url: `${routes.api.base}${routes.api.interviewPrep}?roadmap=APTITUDE&topic=${selectedTopic}&limit=100`,
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTopic, topicsWithCounts]);

  useEffect(() => {
    if (!userLoading && !isAuth) {
      router.push("/login");
    }
  }, [userLoading, isAuth, router]);

  const handleTopicClick = (topic: string, label: string) => {
    setSelectedTopic(topic);
    setSelectedTopicLabel(label);
    setViewMode("STUDY");
  };

  const handleBackToTopics = () => {
    setSelectedTopic(null);
    setSelectedTopicLabel("");
    setViewMode("STUDY");
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
      <div className="flex flex-col h-full w-full">
        {/* Header - Always visible, title adapts if topic selected */}
        <div className="w-full border-b border-gray-800 px-5 py-3 bg-[#0A0A0A] flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between shrink-0">
          <div>
            <Text level="h1" className="text-xl font-bold text-white mb-0.5">
              {selectedTopic ? selectedTopicLabel : "Aptitude Preparation"}
            </Text>
            <Text level="p" className="text-xs text-gray-400">
              {selectedTopic
                ? `Continue your aptitude preparation. Solving problems on ${selectedTopicLabel}.`
                : "Select a topic from the sidebar to start practicing interactively."}
            </Text>
          </div>
          {selectedTopic && (
            <Button
              onClick={handleBackToTopics}
              variant="OUTLINE"
              size="SMALL"
              text="View All Topics"
              className="border-gray-700 bg-transparent hover:border-primary hover:bg-primary/10 shrink-0 py-[4px] px-[8px] h-auto text-[11px] font-medium whitespace-nowrap"
            />
          )}
        </div>

        <FlexContainer
          direction="col"
          className="lg:flex-row flex-1 min-h-0 w-full"
          itemCenter={false}
          justifyCenter={false}
          wrap={false}
        >
          {/* Always Visible Left Sidebar - Topics List */}
          <div className="w-full lg:w-72 flex-shrink-0 border-r border-gray-800 flex flex-col bg-[#0A0A0A]">
            <div className="flex-1 overflow-y-auto px-3 py-3 scrollbar-thin-grey">
              <div className="space-y-3">
                <div className="mb-2.5 px-1 pt-1">
                  <Text level="h2" className="text-[14px] font-black text-white mb-0.5 tracking-tight">
                    Explore Topics
                  </Text>
                  <Text level="p" className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.1em]">
                    Choose a Topic to practice
                  </Text>
                </div>

                <FlexContainer
                  direction="col"
                  fullWidth
                  itemCenter={false}
                  justifyCenter={false}
                  wrap={false}
                  className="gap-1"
                >
                  {topicsWithCounts.map(({ topic, count, label }, index) => {
                    const isActive = selectedTopic === topic;
                    return (
                      <button
                        key={topic}
                        onClick={() => handleTopicClick(topic, label)}
                        className={`w-full group relative py-2.5 px-4 rounded-r-lg border-l-[3px] transition-all duration-300 cursor-pointer text-left focus:outline-none ${isActive
                          ? "bg-red-500/[0.03] border-red-500 shadow-[0_1px_6px_rgba(239,68,68,0.02)]"
                          : "border-transparent bg-transparent hover:bg-white/[0.02] hover:border-gray-800"
                          }`}
                        aria-pressed={isActive}
                      >
                        <FlexContainer
                          className="items-center w-full gap-3"
                          itemCenter
                          justifyCenter={false}
                        >
                          {isActive ? (
                            <FolderOpen className="w-[15px] h-[15px] shrink-0 text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                          ) : (
                            <Folder className="w-[15px] h-[15px] shrink-0 text-gray-600 group-hover:text-gray-400 transition-colors" />
                          )}
                          <Text
                            level="p"
                            className={`text-[13px] font-semibold leading-tight transition-colors duration-300 py-0.5 text-left break-words whitespace-normal flex-1 ${isActive ? "text-white" : "text-gray-400 group-hover:text-gray-300"
                              }`}
                          >
                            {label}
                          </Text>
                        </FlexContainer>
                      </button>
                    );
                  })}
                </FlexContainer>
              </div>
            </div>
          </div>
          {!selectedTopic ? (
            <div className="hidden lg:flex flex-1 flex-col min-w-0 bg-[#050505] relative overflow-hidden">
              {/* Subtle Background Glows */}
              <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-900/10 rounded-full blur-[100px] pointer-events-none" />
              <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-900/10 rounded-full blur-[100px] pointer-events-none" />

              <FlexContainer
                className="h-full z-10"
                itemCenter
                justifyCenter
                fullWidth
                wrap={false}
              >
                <div className="text-center space-y-5 max-w-md px-6">
                  <div className="relative mx-auto w-24 h-24 mb-6">
                    <div className="absolute inset-0 bg-red-500/20 rounded-2xl blur-xl" />
                    <div className="relative w-full h-full bg-[#111] border border-gray-800 rounded-2xl flex items-center justify-center shadow-2xl">
                      <Lightbulb className="w-10 h-10 text-white opacity-80 drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]" />
                    </div>
                  </div>

                  <div>
                    <Text level="h2" className="text-white text-3xl font-extrabold tracking-tight mb-2">
                      Aptitude Vault
                    </Text>
                    <Text level="p" className="text-gray-400 text-[15px] leading-relaxed">
                      Sharpen your logical, quantitative, and verbal reasoning skills. Pick a category on the left to begin an interactive session.
                    </Text>
                  </div>
                </div>
              </FlexContainer>
            </div>
          ) : (
            <div className="flex-1 flex flex-col h-full w-full overflow-hidden bg-[#0A0A0A]">
              {(isTopicEmpty || (questions.length === 0 && !questionsLoading && !questionsResponse?.error)) && !studyGuideLoading && !studyGuideResponse?.data?.content ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#050505] relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                    <div className="w-[500px] h-[500px] bg-red-900/10 rounded-full blur-[100px]" />
                  </div>

                  <div className="relative z-10 w-20 h-20 bg-gray-900/50 border border-gray-800 rounded-2xl flex items-center justify-center mb-6 shadow-2xl">
                    <FolderOpen className="w-8 h-8 text-gray-500 opacity-80" />
                  </div>

                  <Text level="h3" className="text-2xl font-bold text-white mb-3">
                    No Questions Available
                  </Text>
                  <Text level="p" className="text-gray-400 max-w-sm mx-auto mb-8 leading-relaxed">
                    We're actively adding more content to <strong className="text-gray-300">{selectedTopicLabel || selectedTopic}</strong>. Check back soon for new aptitude challenges.
                  </Text>

                  <Button
                    onClick={handleBackToTopics}
                    variant="OUTLINE"
                    size="MEDIUM"
                    text="Explore Other Topics"
                    className="border-gray-700 hover:border-red-500/50 hover:bg-red-500/10 transition-colors duration-300"
                  />
                </div>
              ) : (questionsLoading || studyGuideLoading) ? (
                <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                  <LoadingSpinner height={8} width={8} />
                  <Text level="p" className="text-gray-400 font-medium">Loading challenge...</Text>
                </div>
              ) : questionsResponse?.error ? (
                <div className="flex flex-col items-center justify-center py-10 text-center px-4 h-full">
                  <div className="w-16 h-16 bg-red-950/30 border border-red-500/20 rounded-full flex items-center justify-center mb-4">
                    <AlertTriangle className="w-7 h-7 text-red-500" />
                  </div>
                  <Text level="p" className="text-red-400 text-sm mb-6">
                    Network error while fetching questions.
                  </Text>
                  <Button
                    onClick={() =>
                      fetchQuestions({
                        url: `${routes.api.base}${routes.api.interviewPrep}?roadmap=APTITUDE&topic=${selectedTopic}&limit=100`,
                      })
                    }
                    variant="PRIMARY"
                    size="MEDIUM"
                    text="Try Again"
                  />
                </div>
              ) : (
                <div className="flex-1 h-full w-full overflow-hidden">
                  {viewMode === "STUDY" ? (
                    <AptitudeStudyGuide
                      topicName={selectedTopicLabel}
                      markdownContent={studyGuideResponse?.data?.content || ""}
                      onStartQuiz={() => setViewMode("QUIZ")}
                    />
                  ) : (
                    <AptitudeQuizPanel questions={questions} />
                  )}
                </div>
              )}
            </div>
          )}
        </FlexContainer>
      </div>
    </LearningEnvironmentLayout>
  );
};

export default AptitudePrepPage;
