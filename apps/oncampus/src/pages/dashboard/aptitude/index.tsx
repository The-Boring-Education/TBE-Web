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
import { useUser } from "@tbe/hooks";
import type { AptitudeQuestion } from "@tbe/interface";
import { CACHE_TIMES, queryKeys, useQuery } from "@tbe/query";
import { cn, sendRequest } from "@tbe/utils";
import {
  AlertTriangle,
  ArrowLeft,
  Folder,
  FolderOpen,
  Lightbulb,
} from "lucide-react";
import { useRouter } from "next/router";
import React, { useEffect, useMemo, useState } from "react";

const AptitudePrepPage = () => {
  const router = useRouter();
  const { loading: userLoading, isAuth } = useUser();
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [selectedTopicLabel, setSelectedTopicLabel] = useState<string>("");
  const [viewMode, setViewMode] = useState<"STUDY" | "QUIZ">("STUDY");

  // Fetch Topics (auto-fetch)
  const { data: topicsResponse, isLoading: topicsLoading } = useQuery<any>({
    queryKey: queryKeys.aptitude.topics(),
    queryFn: () =>
      sendRequest({
        url: `${routes.api.base}${routes.api.interviewPrep}?roadmap=APTITUDE`,
      }),
    ...CACHE_TIMES.STATIC,
  });

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

  const topicData = useMemo(
    () =>
      selectedTopic
        ? topicsWithCounts.find((t) => t.topic === selectedTopic)
        : undefined,
    [selectedTopic, topicsWithCounts],
  );
  // When topicData is undefined (e.g. loading), assume questions exist and fetch
  const topicHasQuestions = !topicData || (topicData.count ?? 0) > 0;

  // Fetch Questions (enabled when topic selected and has questions)
  const {
    data: questionsResponse,
    isLoading: questionsLoading,
    refetch: refetchQuestions,
  } = useQuery<any>({
    queryKey: queryKeys.aptitude.questions(selectedTopic ?? ""),
    queryFn: () =>
      sendRequest({
        url: `${routes.api.base}${routes.api.interviewPrep}?roadmap=APTITUDE&topic=${selectedTopic}`,
      }),
    ...CACHE_TIMES.STABLE,
    enabled: !!selectedTopic && topicHasQuestions,
  });

  // Fetch Study Guide (enabled when topic selected)
  const { data: studyGuideResponse, isLoading: studyGuideLoading } =
    useQuery<any>({
      queryKey: queryKeys.aptitude.studyGuide(selectedTopic ?? ""),
      queryFn: () =>
        sendRequest({
          url: `${routes.api.base}${routes.api.interviewPrep}/aptitude/study-guide?topic=${selectedTopic}`,
        }),
      ...CACHE_TIMES.STABLE,
      enabled: !!selectedTopic,
    });

  const questions = useMemo(() => {
    const data = questionsResponse?.data?.questions;
    if (!Array.isArray(data)) return [];
    return data as AptitudeQuestion[];
  }, [questionsResponse]);

  const isTopicEmpty = !!topicData && topicData.count === 0;

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
        <div className="w-full min-h-[72px] border-b border-gray-800 bg-[#0A0A0A] flex shrink-0">
          {/* Left column — aligns with sidebar width */}
          <div className="border-r border-gray-800/60 px-3 py-3.5 flex items-center justify-between shrink-0 transition-all duration-300 w-full lg:w-[260px]">
            <div>
              <Text
                level="h2"
                className="text-[13px] font-black text-white mb-0.5 tracking-tight"
              >
                Explore Topics
              </Text>
              <Text
                level="p"
                className="text-[9px] font-bold text-gray-500 uppercase tracking-[0.1em]"
              >
                Choose a topic
              </Text>
            </div>
            {selectedTopic && (
              <button
                onClick={handleBackToTopics}
                className="flex items-center justify-center w-[28px] h-[28px] rounded-[6px] border border-red-500/40 bg-red-500/5 text-red-500 hover:bg-red-500/10 hover:border-red-500 transition-all duration-300 shrink-0 shadow-[0_0_10px_rgba(239,68,68,0.1)] active:scale-95"
                title="Back to Topics"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="hidden lg:flex flex-1 items-center justify-between px-4">
            <FlexContainer wrap={false} className="gap-2">
              <FlexContainer
                direction="col"
                itemCenter={false}
                justifyCenter={false}
                wrap={false}
              >
                <Text
                  level="h1"
                  className="strong-text font-bold text-white mb-0.5 tracking-tight"
                >
                  {selectedTopic ? selectedTopicLabel : "Aptitude Preparation"}
                </Text>
                <Text
                  level="p"
                  className="text-[10px] font-medium text-gray-500 uppercase tracking-wider"
                >
                  {selectedTopic
                    ? `Solving problems on ${selectedTopicLabel}`
                    : "Select a topic to start practicing"}
                </Text>
              </FlexContainer>
            </FlexContainer>
          </div>
        </div>

        <FlexContainer
          direction="col"
          className="lg:flex-row flex-1 min-h-0 w-full"
          itemCenter={false}
          justifyCenter={false}
          wrap={false}
        >
          {/* Always Visible Left Sidebar - Topics List */}
          <div className="w-full lg:w-[260px] flex-shrink-0 border-r border-gray-800 flex flex-col bg-[#0A0A0A]">
            <div className="flex-1 overflow-y-auto px-3 py-3 scrollbar-thin-grey">
              <div className="space-y-1">
                <FlexContainer
                  direction="col"
                  fullWidth
                  itemCenter={false}
                  justifyCenter={false}
                  wrap={false}
                  className="gap-1"
                >
                  {topicsWithCounts.map(({ topic, count, label }) => {
                    const isActive = selectedTopic === topic;
                    return (
                      <button
                        key={topic}
                        onClick={() => handleTopicClick(topic, label)}
                        className={cn(
                          "w-full group relative py-2.5 px-4 rounded-r-lg border-l-[3px] transition-all duration-300 cursor-pointer text-left focus:outline-none",
                          isActive
                            ? "bg-red-500/[0.03] border-red-500 shadow-[0_1px_6px_rgba(239,68,68,0.02)] text-white"
                            : "border-transparent bg-transparent hover:bg-white/[0.02] hover:border-gray-800 text-gray-400 group-hover:text-gray-300",
                        )}
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
                            className="text-[13px] font-semibold leading-tight transition-colors duration-300 py-0.5 text-left break-words whitespace-normal flex-1"
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
                    <Text
                      level="h2"
                      className="text-white text-3xl font-extrabold tracking-tight mb-2"
                    >
                      Aptitude Vault
                    </Text>
                    <Text
                      level="p"
                      className="text-gray-400 text-[15px] leading-relaxed"
                    >
                      Sharpen your logical, quantitative, and verbal reasoning
                      skills. Pick a category on the left to begin an
                      interactive session.
                    </Text>
                  </div>
                </div>
              </FlexContainer>
            </div>
          ) : (
            <div className="flex-1 flex flex-col h-full w-full overflow-hidden bg-[#0A0A0A]">
              {(isTopicEmpty ||
                (questions.length === 0 &&
                  !questionsLoading &&
                  !questionsResponse?.error)) &&
              !studyGuideLoading &&
              !studyGuideResponse?.data?.content ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#050505] relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                    <div className="w-[500px] h-[500px] bg-red-900/10 rounded-full blur-[100px]" />
                  </div>

                  <div className="relative z-10 w-20 h-20 bg-gray-900/50 border border-gray-800 rounded-2xl flex items-center justify-center mb-6 shadow-2xl">
                    <FolderOpen className="w-8 h-8 text-gray-500 opacity-80" />
                  </div>

                  <Text
                    level="h3"
                    className="text-2xl font-bold text-white mb-3"
                  >
                    No Questions Available
                  </Text>
                  <Text
                    level="p"
                    className="text-gray-400 max-w-sm mx-auto mb-8 leading-relaxed"
                  >
                    We're actively adding more content to{" "}
                    <strong className="text-gray-300">
                      {selectedTopicLabel || selectedTopic}
                    </strong>
                    . Check back soon for new aptitude challenges.
                  </Text>

                  <Button
                    onClick={handleBackToTopics}
                    variant="OUTLINE"
                    size="MEDIUM"
                    text="Explore Other Topics"
                    className="border-gray-700 hover:border-red-500/50 hover:bg-red-500/10 transition-colors duration-300"
                  />
                </div>
              ) : questionsLoading || studyGuideLoading ? (
                <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                  <LoadingSpinner height={8} width={8} />
                  <Text level="p" className="text-gray-400 font-medium">
                    Loading challenge...
                  </Text>
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
                    onClick={() => refetchQuestions()}
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
