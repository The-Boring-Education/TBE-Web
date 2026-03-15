import type { TopicWithCount } from "@tbe/hooks";
import { cn } from "@tbe/utils";

import Text from "../../common/Typography/Text";
import FlexContainer from "../Page/common/FlexContainer";

export interface DsaTopicSidebarProps {
  topics: TopicWithCount[];
  selectedTopic: string | null;
  onTopicClick: (topic: string) => void;
  completionMap?: Record<string, boolean>;
  className?: string;
}

const DsaTopicSidebar = ({
  topics,
  selectedTopic,
  onTopicClick,
  completionMap,
  className,
}: DsaTopicSidebarProps) => {
  return (
    <FlexContainer
      direction="col"
      fullWidth
      itemCenter={false}
      justifyCenter={false}
      wrap={false}
      className={cn("gap-2", className)}
    >
      {topics.map(({ topic, count, label }, index) => {
        const isCompleted = completionMap?.[topic] ?? false;
        const isSelected = selectedTopic === topic;

        return (
          <div
            key={topic}
            className={cn(
              "w-full border rounded-xl px-4 py-3 transition-all duration-200 cursor-pointer group flex items-center justify-between",
              isCompleted
                ? "border-green-500/30 hover:border-green-500/50 hover:bg-green-500/10 bg-transparent"
                : isSelected
                  ? "border-red-500/50 bg-red-500/5"
                  : "border-gray-800 hover:border-red-500 hover:bg-transparent bg-transparent",
            )}
            onClick={() => onTopicClick(topic)}
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div
                className={cn(
                  "flex items-center justify-center w-5.5 h-5.5 rounded-full border text-xs font-bold transition-all duration-200 shrink-0",
                  isCompleted
                    ? "border-green-500 text-green-500"
                    : isSelected
                      ? "border-red-500 text-red-500"
                      : "border-gray-700 text-gray-500 group-hover:border-red-500 group-hover:text-red-500",
                )}
              >
                {index + 1}
              </div>
              <Text
                level="p"
                className={cn(
                  "text-sm font-bold truncate transition-colors",
                  isCompleted
                    ? "text-green-500"
                    : isSelected
                      ? "text-white"
                      : "text-white",
                )}
              >
                {label}
              </Text>
            </div>
            <div className="ml-3 shrink-0">
              <Text
                level="span"
                className={cn(
                  "text-xs font-medium",
                  isCompleted ? "text-green-500/80" : "text-gray-500",
                )}
              >
                {count}
              </Text>
            </div>
          </div>
        );
      })}
    </FlexContainer>
  );
};

export default DsaTopicSidebar;
