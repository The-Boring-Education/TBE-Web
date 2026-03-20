import { TOP_NAVIGATION, TOPIC_LABELS } from "@tbe/constants";
import { type TopicWithCount, useStudyGuideTopic } from "@tbe/hooks";
import type { DsaQuestion } from "@tbe/interface";
import { cn } from "@tbe/utils";
import { BookOpen, Lightbulb } from "lucide-react";
import { type ReactNode, useState } from "react";

import Button from "../../common/Buttons/Button";
import Link from "../../common/Typography/Link";
import Text from "../../common/Typography/Text";
import FlexContainer from "../Page/common/FlexContainer";
import DsaQuestionList from "./DsaQuestionList";
import DsaTopicSidebar from "./DsaTopicSidebar";
import QuestionDetailPanel from "./QuestionDetailPanel";
import StudyGuideNav from "./StudyGuideNav";
import StudyGuideReader from "./StudyGuideReader";

export interface DsaPrepWorkspaceProps {
  questions: DsaQuestion[];
  topicsWithCounts: TopicWithCount[];
  selectedTopic: string | null;
  selectedQuestion: DsaQuestion | null;
  onTopicClick: (topic: string) => void;
  onQuestionClick: (question: DsaQuestion) => void;
  onBackToTopics: () => void;
  completionMap?: Record<string, boolean>;
  completedQuestionIds?: (string | number)[];
  onToggleComplete?: (questionId: string | number) => void;
  topicSidebarHeader?: ReactNode;
  emptyStateContent?: ReactNode;
  studyGuideConfigs?: Record<string, any>; // Deprecated
  className?: string;
}

const DsaPrepWorkspace = ({
  questions,
  topicsWithCounts,
  selectedTopic,
  selectedQuestion,
  onTopicClick,
  onQuestionClick,
  onBackToTopics,
  completionMap,
  completedQuestionIds,
  onToggleComplete,
  topicSidebarHeader,
  emptyStateContent,
  className,
}: DsaPrepWorkspaceProps) => {
  const { data: studyGuideData, isLoading: isStudyGuideLoading } =
    useStudyGuideTopic(selectedTopic || "");

  console.log("StudyGuide State:", {
    selectedTopic,
    studyGuideData,
    isStudyGuideLoading,
  });

  const [isStudyGuideOpen, setIsStudyGuideOpen] = useState(false);
  const [activeGuideSection, setActiveGuideSection] = useState("");

  const filteredQuestions = selectedTopic
    ? questions.filter((q) => q.topics?.[0] === selectedTopic)
    : [];

  const handleToggleStudyGuide = () => {
    setIsStudyGuideOpen((prev) => !prev);
    if (!isStudyGuideOpen && studyGuideData?.sections?.length > 0) {
      const firstSection = studyGuideData.sections.find(
        (s: any) => !s.isDivider,
      );
      if (firstSection) {
        setActiveGuideSection(firstSection.id);
      }
    }
  };

  const handleBackToTopics = () => {
    setIsStudyGuideOpen(false);
    onBackToTopics();
  };

  return (
    <div className={cn("flex flex-col h-full w-full", className)}>
      <div className="w-full border-b border-gray-800 bg-[#0A0A0A] flex shrink-0">
        <div
          className={cn(
            "border-r border-gray-800/60 px-2 py-2 shrink-0 transition-all duration-300 w-full lg:w-[280px]",
          )}
        >
          {!selectedTopic ? (
            <div>
              <Text
                level="h2"
                className="text-[14px] font-black text-white mb-0.5 tracking-tight"
              >
                Explore Topics
              </Text>
              <Text
                level="p"
                className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.1em]"
              >
                Choose a topic to practice
              </Text>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between w-full mb-0.5">
                <Text
                  level="h2"
                  className="text-[14px] font-black text-white tracking-tight"
                >
                  Questions
                </Text>
                {studyGuideData?.hasGuide && (
                  <button
                    onClick={handleToggleStudyGuide}
                    disabled={isStudyGuideLoading}
                    className={cn(
                      "flex items-center justify-center w-[34px] h-[34px] rounded-[8px] border-[0.5px] transition-all duration-300",
                      isStudyGuideLoading && "animate-pulse opacity-50",
                      isStudyGuideOpen
                        ? "bg-red-500/15 border-red-500/50 text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.35)] scale-105"
                        : "bg-red-500/[0.04] border-red-500/20 text-red-400 group-hover:border-red-500/40 hover:text-red-300 shadow-[0_0_12px_rgba(239,68,68,0.15)]",
                    )}
                    title={
                      isStudyGuideOpen
                        ? "Back to Questions"
                        : "Open Study Guide"
                    }
                  >
                    <BookOpen
                      className={cn(
                        "w-[18px] h-[18px] transition-all duration-300",
                        isStudyGuideOpen ? "scale-110" : "",
                      )}
                      strokeWidth={2}
                    />
                  </button>
                )}
              </div>
              <Text
                level="p"
                className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.1em]"
              >
                {filteredQuestions.length} question
                {filteredQuestions.length !== 1 ? "s" : ""} available
              </Text>
            </div>
          )}
        </div>

        <div className="hidden lg:flex flex-1 items-center justify-between px-4 py-2">
          {!isStudyGuideOpen ? (
            <div>
              <Text level="h1" className="text-xl font-bold text-white mb-0.5">
                {selectedTopic
                  ? TOPIC_LABELS[selectedTopic] || selectedTopic
                  : "DSA Preparation"}
              </Text>
              <Text level="p" className="text-xs text-gray-400">
                {selectedTopic
                  ? `Continue your DSA preparation. Solving problems on ${TOPIC_LABELS[selectedTopic] || selectedTopic}.`
                  : "Select a topic from the sidebar to start practicing interactively."}
              </Text>
            </div>
          ) : (
            <div />
          )}
          {isStudyGuideOpen && (
            <div className="flex items-center gap-4">
              {TOP_NAVIGATION?.issues?.[0] && (
                <Link
                  className="text-[11px] font-bold text-gray-400 hover:text-red-500 transition-colors uppercase tracking-widest"
                  href={TOP_NAVIGATION.issues[0].href}
                  target={TOP_NAVIGATION.issues[0]?.target as any}
                >
                  {TOP_NAVIGATION.issues[0]?.name}
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      <FlexContainer
        direction="col"
        className="lg:flex-row flex-1 min-h-0 w-full"
        itemCenter={false}
        justifyCenter={false}
        wrap={false}
      >
        <div
          className={cn(
            "flex flex-col flex-shrink-0 border-r border-gray-800/60 bg-[#0A0A0A] transition-all duration-300",
            "w-full lg:w-[280px]",
          )}
        >
          <div className="flex-1 overflow-y-auto px-3 py-3 scrollbar-thin-grey">
            {!selectedTopic ? (
              <div className="flex flex-col">
                {topicSidebarHeader}
                <DsaTopicSidebar
                  topics={topicsWithCounts}
                  selectedTopic={selectedTopic}
                  onTopicClick={onTopicClick}
                  completionMap={completionMap}
                />
              </div>
            ) : (
              <div className="space-y-4">
                <Button
                  onClick={onBackToTopics}
                  variant="OUTLINE"
                  size="SMALL"
                  className="border-red-500/40 text-red-500 bg-transparent hover:border-red-500 hover:bg-red-500/10 font-bold px-4 self-start"
                >
                  ← Back
                </Button>
                {isStudyGuideOpen && studyGuideData ? (
                  <StudyGuideNav
                    data={studyGuideData}
                    activeId={activeGuideSection}
                    onSectionClick={setActiveGuideSection}
                  />
                ) : isStudyGuideLoading && isStudyGuideOpen ? (
                  <div className="space-y-2 p-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className="h-10 w-full bg-white/[0.03] animate-pulse rounded-lg"
                      />
                    ))}
                  </div>
                ) : (
                  <DsaQuestionList
                    questions={filteredQuestions}
                    selectedQuestionId={selectedQuestion?.id}
                    onQuestionClick={onQuestionClick}
                    completedQuestionIds={completedQuestionIds}
                    onToggleComplete={onToggleComplete}
                  />
                )}
              </div>
            )}
          </div>
        </div>

        <div
          className={cn(
            "flex-1 flex flex-col min-w-0 bg-[#0A0A0A]",
            !selectedTopic ? "hidden lg:flex" : "flex",
          )}
        >
          {isStudyGuideOpen && studyGuideData ? (
            <StudyGuideReader
              data={studyGuideData}
              sectionId={activeGuideSection}
            />
          ) : isStudyGuideLoading && isStudyGuideOpen ? (
            <div className="flex-1 px-8 py-12 space-y-8 animate-pulse bg-[#050505]">
              <div className="h-12 w-1/3 bg-white/[0.05] rounded-xl" />
              <div className="h-6 w-full bg-white/[0.02] rounded-lg" />
              <div className="grid grid-cols-2 gap-6">
                <div className="h-32 bg-white/[0.03] rounded-3xl" />
                <div className="h-32 bg-white/[0.03] rounded-3xl" />
              </div>
              <div className="h-64 w-full bg-white/[0.02] rounded-3xl" />
            </div>
          ) : (
            <div
              className="flex-1 overflow-y-auto scrollbar-thin-grey px-6 py-5 scroll-smooth"
              id="right-scroll-area"
            >
              {!selectedTopic ? (
                emptyStateContent || (
                  <div className="hidden lg:flex flex-1 flex-col min-w-0 bg-[#050505] relative overflow-hidden h-full">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-900/10 rounded-full blur-[100px] pointer-events-none" />
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-900/10 rounded-full blur-[100px] pointer-events-none" />

                    <FlexContainer
                      className="h-full z-10"
                      itemCenter
                      justifyCenter
                      direction="col"
                    >
                      <div className="mb-6 p-4 rounded-3xl bg-white/[0.02] border border-white/5 shadow-2xl">
                        <Lightbulb className="w-12 h-12 text-red-500/80" />
                      </div>
                      <Text
                        level="h2"
                        className="text-2xl font-black text-white mb-2 tracking-tight"
                      >
                        Ready to level up?
                      </Text>
                      <Text
                        level="p"
                        className="text-gray-500 max-w-sm text-center leading-relaxed"
                      >
                        Select a topic from the sidebar to start practicing
                        interactively and master each concept with precision.
                      </Text>
                    </FlexContainer>
                  </div>
                )
              ) : (
                <FlexContainer direction="col" fullWidth>
                  <QuestionDetailPanel question={selectedQuestion} />
                </FlexContainer>
              )}
            </div>
          )}
        </div>
      </FlexContainer>
    </div>
  );
};

export default DsaPrepWorkspace;
