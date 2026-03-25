import type { DsaQuestionCardProps } from "@tbe/interface";
import { getDifficultyConfig } from "@tbe/utils";
import { CheckCircle2, Circle } from "lucide-react";

export const DsaQuestionCard = ({
  name,
  difficultyLevel,
  isSelected = false,
  isCompleted = false,
  onClick,
  onToggleComplete,
}: DsaQuestionCardProps) => {
  const { label, color } = getDifficultyConfig(difficultyLevel);

  return (
    <div
      className={`w-full rounded-lg py-2 px-2.5 mb-1 cursor-pointer transition-all duration-200 group flex items-center justify-between ${
        isSelected
          ? "bg-red-500/[0.04] border border-red-500/30 shadow-[0_0_12px_rgba(239,68,68,0.06)] border-l-2 border-l-red-500"
          : isCompleted
            ? "bg-green-500/[0.03] border border-green-500/20 border-l-2 border-l-green-500/60"
            : "bg-transparent border border-transparent hover:bg-[#111] hover:border-gray-800/60"
      }`}
      onClick={onClick}
    >
      <div className="flex items-center gap-2.5 flex-1 min-w-0 pr-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleComplete?.();
          }}
          className={`flex-shrink-0 focus:outline-none transition-all duration-200 ${
            isCompleted
              ? "text-green-500 hover:text-green-400"
              : "text-gray-700 hover:text-green-500"
          }`}
        >
          {isCompleted ? (
            <CheckCircle2 className="w-[18px] h-[18px]" />
          ) : (
            <Circle className="w-[18px] h-[18px]" />
          )}
        </button>
        <p
          className={`text-[13px] font-medium truncate transition-colors duration-200 ${
            isSelected
              ? "text-white"
              : isCompleted
                ? "text-green-100/80"
                : "text-gray-400 group-hover:text-gray-200"
          }`}
        >
          {name}
        </p>
      </div>
      <span
        className={`text-[9px] font-bold px-2 py-0.5 flex-shrink-0 rounded border uppercase tracking-wider ${color}`}
      >
        {label}
      </span>
    </div>
  );
};
