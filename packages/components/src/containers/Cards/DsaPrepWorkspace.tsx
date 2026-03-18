import { TOPIC_LABELS } from "@tbe/constants";
import type { TopicWithCount } from "@tbe/hooks";
import type { DsaQuestion } from "@tbe/interface";
import { cn } from "@tbe/utils";
import { Target } from "lucide-react";
import type { ReactNode } from "react";

import Text from "../../common/Typography/Text";
import FlexContainer from "../Page/common/FlexContainer";
import DsaQuestionList from "./DsaQuestionList";
import DsaTopicSidebar from "./DsaTopicSidebar";
import QuestionDetailPanel from "./QuestionDetailPanel";

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
  const filteredQuestions = selectedTopic
    ? questions.filter((q) => q.topics?.[0] === selectedTopic)
    : [];

  return (
    <FlexContainer
      direction="col"
      className={cn("lg:flex-row flex-1 min-h-0 w-full", className)}
      itemCenter={false}
      justifyCenter={false}
      wrap={false}
    >
      {/* Left Sidebar - Topics or Questions */}
      <div
        className={cn(
          "flex flex-col flex-shrink-0 border-r border-gray-800/60 bg-[#0A0A0A] transition-all duration-300",
          selectedTopic
            ? "w-full lg:w-[340px]"
            : "flex-1 lg:flex-none w-full lg:w-[320px]",
        )}
      >
        <div className="flex-1 overflow-y-auto px-4 py-5 scrollbar-thin-grey">
          {!selectedTopic ? (
            <div className="flex flex-col">
              {topicSidebarHeader}

              <div className="mb-5">
                <Text
                  level="span"
                  className="text-[9px] text-gray-600 uppercase font-bold tracking-[0.15em] block mb-1.5"
                >
                  DSA Sheet
                </Text>
                <Text level="h2" className="text-lg font-bold text-white">
                  Explore Topics
                </Text>
                <Text level="p" className="text-[11px] text-gray-500 mt-0.5">
                  Choose a topic to begin your preparation
                </Text>
              </div>

              <DsaTopicSidebar
                topics={topicsWithCounts}
                selectedTopic={selectedTopic}
                onTopicClick={onTopicClick}
                completionMap={completionMap}
              />
            </div>
          ) : (
            <div className="space-y-4">
              <button
                onClick={onBackToTopics}
                className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-500 hover:text-white transition-colors duration-200 group"
              >
                <span className="transition-transform duration-200 group-hover:-translate-x-0.5">
                  ←
                </span>
                Back to Topics
              </button>

              <div>
                <Text
                  level="span"
                  className="text-[9px] text-gray-600 uppercase font-bold tracking-[0.15em] block mb-1.5"
                >
                  {TOPIC_LABELS[selectedTopic] || selectedTopic}
                </Text>
                <Text level="h2" className="text-lg font-bold text-white">
                  Questions
                </Text>
                <Text
                  level="p"
                  className="text-[11px] text-gray-500 mt-0.5 mb-4"
                >
                  {filteredQuestions.length} question
                  {filteredQuestions.length !== 1 ? "s" : ""} available
                </Text>

                <DsaQuestionList
                  questions={filteredQuestions}
                  selectedQuestionId={selectedQuestion?.id}
                  onQuestionClick={onQuestionClick}
                  completedQuestionIds={completedQuestionIds}
                  onToggleComplete={onToggleComplete}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div
        className={cn(
          "flex-1 flex flex-col min-w-0 bg-[#0A0A0A]",
          !selectedTopic ? "hidden lg:flex" : "flex",
        )}
      >
        <div
          className="flex-1 overflow-y-auto scrollbar-thin-grey px-6 py-5 scroll-smooth"
          id="right-scroll-area"
        >
          {!selectedTopic ? (
            emptyStateContent || (
              <FlexContainer
                className="h-full"
                itemCenter
                justifyCenter
                fullWidth
                wrap={false}
              >
                <div className="text-center space-y-3 bg-gray-900 p-10 rounded-2xl border border-gray-800 max-w-lg">
                  <Target className="w-12 h-12 text-red-500/50 mx-auto" />
                  <Text level="p" className="text-gray-300 text-base font-bold">
                    Select a topic from the left
                  </Text>
                  <Text level="p" className="text-gray-500 text-xs">
                    Start your focused preparation today. Click on any topic to
                    view the curated list of questions.
                  </Text>
                </div>
              </FlexContainer>
            )
          ) : (
            <div className="w-full max-w-3xl mx-auto">
              <div className="mb-6 pb-4 border-b border-gray-800">
                <Text level="h2" className="text-2xl font-bold text-white mb-1">
                  {TOPIC_LABELS[selectedTopic] || selectedTopic}
                </Text>
                <Text level="p" className="text-sm text-gray-400">
                  Continue your {TOPIC_LABELS[selectedTopic] || selectedTopic}{" "}
                  preparation journey.
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
  );
};

export default DsaPrepWorkspace;
