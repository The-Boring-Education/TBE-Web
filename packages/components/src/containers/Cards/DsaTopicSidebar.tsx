import type { TopicWithCount } from "@tbe/hooks";
import { cn } from "@tbe/utils";
import { Folder, FolderOpen } from "lucide-react";

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
      className={cn("gap-1", className)}
    >
      {topics.map(({ topic, count, label }) => {
        const isCompleted = completionMap?.[topic] ?? false;
        const isSelected = selectedTopic === topic;

        return (
          <button
            key={topic}
            onClick={() => onTopicClick(topic)}
            aria-pressed={isSelected}
            className={cn(
              "w-full group relative py-2.5 px-4 rounded-r-lg border-l-[3px] transition-all duration-300 cursor-pointer text-left focus:outline-none",
              isCompleted
                ? "border-green-500 bg-green-500/[0.03]"
                : isSelected
                  ? "bg-red-500/[0.03] border-red-500 shadow-[0_1px_6px_rgba(239,68,68,0.02)]"
                  : "border-transparent bg-transparent hover:bg-white/[0.02] hover:border-gray-800",
            )}
          >
            <FlexContainer
              className="items-center w-full gap-3"
              itemCenter
              justifyCenter={false}
            >
              {isSelected ? (
                <FolderOpen
                  className={cn(
                    "w-[15px] h-[15px] shrink-0",
                    isCompleted
                      ? "text-green-500"
                      : "text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]",
                  )}
                />
              ) : (
                <Folder
                  className={cn(
                    "w-[15px] h-[15px] shrink-0 transition-colors",
                    isCompleted
                      ? "text-green-500/60"
                      : "text-gray-600 group-hover:text-gray-400",
                  )}
                />
              )}
              <Text
                level="p"
                className={cn(
                  "text-[13px] font-semibold leading-tight transition-colors duration-300 py-0.5 text-left break-words whitespace-normal flex-1",
                  isCompleted
                    ? "text-green-400"
                    : isSelected
                      ? "text-white"
                      : "text-gray-400 group-hover:text-gray-300",
                )}
              >
                {label}
              </Text>
            </FlexContainer>
          </button>
        );
      })}
    </FlexContainer>
  );
};

export default DsaTopicSidebar;
