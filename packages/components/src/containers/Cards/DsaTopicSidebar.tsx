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
      {topics.map(({ topic, label }) => {
        const isCompleted = completionMap?.[topic] ?? false;
        const isSelected = selectedTopic === topic;

        return (
          <button
            key={topic}
            onClick={() => onTopicClick(topic)}
            aria-pressed={isSelected}
            className={cn(
              "w-full group relative py-2 px-4 rounded-r-lg border-l-[3px] transition-all duration-300 cursor-pointer text-left focus:outline-none",
              isSelected
                ? isCompleted
                  ? "border-green-500 bg-green-500/[0.05]"
                  : "bg-red-500/[0.05] border-red-500 shadow-[0_1px_8px_rgba(239,68,68,0.05)]"
                : isCompleted
                  ? "border-transparent bg-transparent hover:bg-green-500/[0.03] hover:border-green-500/30"
                  : "border-transparent bg-transparent hover:bg-white/[0.03] hover:border-red-500/30",
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
                      : "text-gray-500 group-hover:text-gray-300",
                  )}
                />
              )}
              <Text
                level="p"
                className={cn(
                  "text-[13px] font-semibold leading-tight transition-colors duration-300 py-0.5 text-left whitespace-nowrap flex-1",
                  isCompleted
                    ? "text-green-400"
                    : isSelected
                      ? "text-white"
                      : "text-gray-200 group-hover:text-white",
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
