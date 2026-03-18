import type { TopicWithCount } from "@tbe/hooks";
import { cn } from "@tbe/utils";
import { ChevronRight } from "lucide-react";

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
      className={cn("gap-1.5", className)}
    >
      {topics.map(({ topic, count, label }, index) => {
        const isCompleted = completionMap?.[topic] ?? false;
        const isSelected = selectedTopic === topic;

        return (
          <div
            key={topic}
            className={cn(
              "w-full border rounded-lg px-3.5 py-3 transition-all duration-200 cursor-pointer group flex items-center justify-between",
              isCompleted
                ? "border-green-500/20 bg-green-500/[0.03] hover:border-green-500/40 hover:shadow-[0_0_12px_rgba(34,197,94,0.06)]"
                : isSelected
                  ? "border-red-500/40 bg-red-500/[0.04] shadow-[0_0_12px_rgba(239,68,68,0.08)]"
                  : "border-gray-800/60 bg-[#0D0D0D] hover:border-gray-700 hover:bg-[#111] hover:shadow-[0_0_12px_rgba(239,68,68,0.04)]",
            )}
            onClick={() => onTopicClick(topic)}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={cn(
                  "flex items-center justify-center w-6 h-6 rounded-full border text-[10px] font-bold transition-all duration-200 shrink-0",
                  isCompleted
                    ? "border-green-500/50 text-green-400 bg-green-500/10"
                    : isSelected
                      ? "border-red-500/50 text-red-400 bg-red-500/10 shadow-[0_0_8px_rgba(239,68,68,0.25)]"
                      : "border-gray-700/80 text-gray-500 bg-[#141414] group-hover:border-red-500/40 group-hover:text-red-400 group-hover:bg-red-500/[0.06]",
                )}
              >
                {index + 1}
              </div>
              <Text
                level="p"
                className={cn(
                  "text-[13px] font-semibold truncate transition-colors duration-200",
                  isCompleted
                    ? "text-green-400"
                    : isSelected
                      ? "text-white"
                      : "text-gray-300 group-hover:text-white",
                )}
              >
                {label}
              </Text>
            </div>
            <div className="flex items-center gap-2 shrink-0 ml-2">
              <span
                className={cn(
                  "text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#141414] border border-gray-800/60 tabular-nums",
                  isCompleted
                    ? "text-green-400/70 border-green-500/20"
                    : "text-gray-500",
                )}
              >
                {count}
              </span>
              <ChevronRight
                className={cn(
                  "w-3.5 h-3.5 transition-all duration-200 -mr-0.5",
                  isCompleted
                    ? "text-green-500/40"
                    : isSelected
                      ? "text-red-500/60"
                      : "text-gray-700 group-hover:text-gray-400 group-hover:translate-x-0.5",
                )}
              />
            </div>
          </div>
        );
      })}
    </FlexContainer>
  );
};

export default DsaTopicSidebar;
