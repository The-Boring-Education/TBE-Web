import { TOPIC_LABELS } from "@tbe/constants";
import { type TopicWithCount, useStudyGuideTopic } from "@tbe/hooks";
import type {
  DsaQuestion,
  StudyGuideConfig,
  StudyGuideModel,
} from "@tbe/interface";
import { cn } from "@tbe/utils";
import { ArrowRight, BookOpen, Lightbulb, Sparkles } from "lucide-react";
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
  onSaveNote?: (questionId: string | number, notes: string) => Promise<void>;
  localNotes?: Record<string, string>;
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
  onSaveNote,
  localNotes = {},
  topicSidebarHeader,
  emptyStateContent,
  studyGuideConfigs,
  className,
}: DsaPrepWorkspaceProps) => {
  const { data: studyGuideData, isLoading: isStudyGuideLoading } =
    useStudyGuideTopic(selectedTopic || "");

  const [isStudyGuideOpen, setIsStudyGuideOpen] = useState(false);
  const [activeGuideSection, setActiveGuideSection] =
    useState("before-you-start");

  const filteredQuestions = selectedTopic
    ? questions.filter((q) => q.topics?.[0] === selectedTopic)
    : [];

  const currentTopicConfig =
    selectedTopic && studyGuideConfigs
      ? studyGuideConfigs[selectedTopic.toUpperCase().replace(/\s+/g, "_")]
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
      <div className="w-full min-h-[72px] border-b border-gray-800 bg-[#0A0A0A] flex shrink-0">
        {/* Left column — aligns with sidebar width */}
        <div
          className={cn(
            "border-r border-gray-800/60 px-3 py-3.5 flex items-center shrink-0 transition-all duration-300 w-full lg:w-[260px]",
          )}
        >
          {!selectedTopic ? (
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
          ) : (
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <Text
                    level="h3"
                    className="text-white text-[14px] font-black tracking-tight leading-none mb-1.5"
                  >
                    Questions
                  </Text>
                  {selectedTopic && (
                    <div className="flex flex-col gap-1.5 w-full">
                      {(() => {
                        const solvedCount = filteredQuestions.filter((q) =>
                          completedQuestionIds?.includes(q.id || q.name),
                        ).length;
                        const totalCount = filteredQuestions.length || 1;
                        const progress = (solvedCount / totalCount) * 100;

                        return (
                          <>
                            <Text
                              level="p"
                              className="text-[9px] font-bold text-gray-500 uppercase tracking-wider"
                            >
                              {solvedCount} / {filteredQuestions.length} Solved
                            </Text>
                            <div className="h-[3px] w-[140px] bg-gray-800/80 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-red-500 transition-all duration-700 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.4)]"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {selectedTopic && (
                    <Button
                      onClick={onBackToTopics}
                      variant="OUTLINE"
                      size="SMALL"
                      text="←"
                      className="border-gray-800 text-gray-400 bg-transparent hover:border-red-500 hover:bg-red-500/10 shrink-0 py-[3px] px-[8px] h-auto text-[10px] font-bold uppercase tracking-wide whitespace-nowrap"
                    />
                  )}
                  {currentTopicConfig?.hasStudyGuide && (
                    <button
                      onClick={handleToggleStudyGuide}
                      className={cn(
                        "flex items-center justify-center w-[30px] h-[30px] rounded-[6px] border-[0.5px] transition-all duration-300 flex-shrink-0",
                        isStudyGuideOpen
                          ? "bg-red-500/15 border-red-500/50 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.25)] scale-105"
                          : "bg-red-500/[0.04] border-red-500/20 text-red-400 group-hover:border-red-500/40 hover:text-red-300 shadow-[0_0_8px_rgba(239,68,68,0.1)]",
                      )}
                      title={
                        isStudyGuideOpen
                          ? "Back to Questions"
                          : "Open Study Guide"
                      }
                    >
                      <BookOpen
                        className={cn(
                          "w-[16px] h-[16px] transition-all duration-300",
                          isStudyGuideOpen ? "scale-110" : "",
                        )}
                        strokeWidth={2}
                      />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="hidden lg:flex flex-1 items-center justify-between px-4">
          {!isStudyGuideOpen ? (
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
                  {selectedTopic
                    ? TOPIC_LABELS[selectedTopic] || selectedTopic
                    : "DSA Preparation"}
                </Text>
                <Text
                  level="p"
                  className="text-[10px] font-medium text-gray-500 uppercase tracking-wider"
                >
                  {selectedTopic
                    ? `Solving problems on ${TOPIC_LABELS[selectedTopic] || selectedTopic}`
                    : "Select a topic to start practicing"}
                </Text>
              </FlexContainer>
            </FlexContainer>
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
            "w-full lg:w-[260px]",
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
                {isStudyGuideOpen ? (
                  currentTopicConfig ? (
                    <StudyGuideNav
                      config={currentTopicConfig}
                      activeId={activeGuideSection}
                      onSectionClick={setActiveGuideSection}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 px-4 text-center gap-3">
                      <Sparkles className="w-8 h-8 text-gray-800 animate-pulse opacity-30" />
                      <Text
                        level="p"
                        className="text-[10px] font-black text-gray-600 uppercase tracking-widest leading-relaxed"
                      >
                        Navigation will be
                        <br />
                        available shortly
                      </Text>
                    </div>
                  )
                ) : (
                  <DsaQuestionList
                    questions={filteredQuestions}
                    selectedQuestionId={selectedQuestion?.id}
                    onQuestionClick={onQuestionClick}
                    completedQuestionIds={completedQuestionIds}
                    onToggleComplete={onToggleComplete}
                    localNotes={localNotes}
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
          {isStudyGuideOpen && selectedTopic ? (
            <StudyGuideReader
              topic={selectedTopic}
              sectionId={activeGuideSection}
              data={studyGuideData as StudyGuideModel}
            />
          ) : (
            <div
              className="flex-1 overflow-y-auto scrollbar-thin-grey px-6 py-5 scroll-smooth"
              id="right-scroll-area"
            >
              {!selectedTopic ? (
                emptyStateContent || (
                  <div className="hidden lg:flex flex-1 flex-col min-w-0 bg-[#0A0A0A] relative overflow-hidden h-full">
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
                      <div className="text-center space-y-5 max-w-md px-6 z-10">
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
              ) : !selectedQuestion ? (
                <div className="flex flex-1 flex-col items-center justify-center h-full min-h-[400px]">
                  <div className="flex flex-col items-center text-center space-y-6 max-w-[500px] mx-auto px-6 w-full">
                    <div className="space-y-3.5 flex flex-col items-center">
                      <Text
                        level="h2"
                        className="text-white text-[22px] font-bold tracking-tight whitespace-nowrap text-center"
                      >
                        Select a question to view details
                      </Text>
                      <Text
                        level="p"
                        className="text-gray-500 text-sm font-medium leading-relaxed max-w-[440px] mx-auto text-center"
                      >
                        Choose any problem from the list on the left to see the
                        full problem statement, examples, and solutions.
                      </Text>
                    </div>

                    <button
                      onClick={() =>
                        filteredQuestions[0] &&
                        onQuestionClick(filteredQuestions[0])
                      }
                      className="group flex items-center justify-center gap-2.5 mx-auto w-full max-w-[320px] py-2.5 rounded-full bg-red-600 hover:bg-red-500 text-white shadow-[0_4px_15px_rgba(220,38,38,0.25)] transition-all duration-300 transform hover:scale-[1.03] active:scale-95 whitespace-nowrap"
                    >
                      <span className="font-bold text-[13px]">
                        Start with the first question
                      </span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="w-full max-w-3xl mx-auto">
                  <div className="pb-1 w-full">
                    <QuestionDetailPanel
                      question={{
                        ...selectedQuestion,
                        notes:
                          localNotes[
                            String(selectedQuestion.id || selectedQuestion.name)
                          ] || selectedQuestion.notes,
                      }}
                      onNoteSaveSuccess={(note) => {
                        if (onSaveNote) {
                          onSaveNote(
                            selectedQuestion.id || selectedQuestion.name,
                            note,
                          );
                        }
                      }}
                    />
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
