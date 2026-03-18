import { TOPIC_LABELS } from "@tbe/constants";
import type { TopicWithCount } from "@tbe/hooks";
import type { DsaQuestion } from "@tbe/interface";
import type { StudyGuideConfig } from "@tbe/interface";
import { cn } from "@tbe/utils";
import { BookOpen, Lightbulb } from "lucide-react";
import { type ReactNode, useState } from "react";

import Button from "../../common/Buttons/Button";
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
  studyGuideConfigs?: Record<string, StudyGuideConfig>;
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
  studyGuideConfigs,
  className,
}: DsaPrepWorkspaceProps) => {
  const [isStudyGuideOpen, setIsStudyGuideOpen] = useState(false);
  const [activeGuideSection, setActiveGuideSection] =
    useState("before-you-start");

  const filteredQuestions = selectedTopic
    ? questions.filter((q) => q.topics?.[0] === selectedTopic)
    : [];

  const currentTopicConfig =
    selectedTopic && studyGuideConfigs
      ? studyGuideConfigs[selectedTopic]
      : null;

  const handleToggleStudyGuide = () => {
    setIsStudyGuideOpen((prev) => !prev);
    if (!isStudyGuideOpen) {
      setActiveGuideSection("before-you-start");
    }
  };

  const handleBackToTopics = () => {
    setIsStudyGuideOpen(false);
    onBackToTopics();
  };

  return (
    <div className={cn("flex flex-col h-full w-full", className)}>
      {/* Header Banner — sidebar border extends through here */}
      <div className="w-full border-b border-gray-800 bg-[#0A0A0A] flex shrink-0">
        {/* Left column — aligns with sidebar width */}
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
              <div className="flex items-center justify-between w-full">
                <Text
                  level="h2"
                  className="text-[14px] font-black text-white mb-0.5 tracking-tight"
                >
                  Questions
                </Text>
                {currentTopicConfig?.hasStudyGuide && (
                  <button
                    onClick={handleToggleStudyGuide}
                    className={cn(
                      "flex items-center justify-center w-[38px] h-[38px] rounded-[8px] border-[0.5px] transition-all duration-300",
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
                        "w-[22px] h-[22px] transition-all duration-300",
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
          {selectedTopic && (
            <Button
              onClick={handleBackToTopics}
              variant="OUTLINE"
              size="SMALL"
              text="View All Topics"
              className="border-gray-700 bg-transparent hover:border-red-500 hover:bg-red-500/10 shrink-0 py-[4px] px-[8px] h-auto text-[11px] font-medium whitespace-nowrap"
            />
          )}
        </div>
      </div>

      {/* Split Layout: Sidebar + Content */}
      <FlexContainer
        direction="col"
        className="lg:flex-row flex-1 min-h-0 w-full"
        itemCenter={false}
        justifyCenter={false}
        wrap={false}
      >
        {/* Left Sidebar - Topics or Questions */}
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
              <div className="space-y-3">
                {isStudyGuideOpen && currentTopicConfig ? (
                  <StudyGuideNav
                    config={currentTopicConfig}
                    activeId={activeGuideSection}
                    onSectionClick={setActiveGuideSection}
                  />
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
          {isStudyGuideOpen && currentTopicConfig ? (
            <StudyGuideReader
              topic={currentTopicConfig.topic}
              sectionId={activeGuideSection}
            />
          ) : (
            <div
              className="flex-1 overflow-y-auto scrollbar-thin-grey px-6 py-5 scroll-smooth"
              id="right-scroll-area"
            >
              {!selectedTopic ? (
                emptyStateContent || (
                  <div className="hidden lg:flex flex-1 flex-col min-w-0 bg-[#050505] relative overflow-hidden h-full">
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
                            DSA Vault
                          </Text>
                          <Text
                            level="p"
                            className="text-gray-400 text-[15px] leading-relaxed"
                          >
                            Master data structures and algorithms with curated
                            problems. Pick a topic on the left to begin your
                            preparation journey.
                          </Text>
                        </div>
                      </div>
                    </FlexContainer>
                  </div>
                )
              ) : (
                <div className="w-full max-w-3xl mx-auto">
                  <div className="pb-1 w-full">
                    <QuestionDetailPanel question={selectedQuestion} />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </FlexContainer>
    </div>
  );
};

export default DsaPrepWorkspace;
