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
      className={`w-full border rounded-lg pl-[1px] pr-2 py-1.5 mb-1 cursor-pointer transition-all duration-200 group flex items-center justify-between
                ${
                  isSelected
                    ? "bg-[#1A0505] border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.1)]"
                    : isCompleted
                      ? "bg-green-500/10 border-green-500/30 hover:border-green-500/50"
                      : "bg-transparent border-gray-800 hover:border-gray-600 hover:bg-[#111]"
                }`}
      onClick={onClick}
    >
      <div className="flex items-center space-x-2 flex-1 min-w-0 pr-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleComplete?.(e);
          }}
          className={`flex-shrink-0 focus:outline-none transition-colors duration-200 ${isCompleted ? "text-green-500 hover:text-green-400" : "text-gray-600 hover:text-green-500"}`}
        >
          {isCompleted ? (
            <CheckCircle2 className="w-5 h-5" />
          ) : (
            <Circle className="w-5 h-5" />
          )}
        </button>
        <p
          className={`text-[13px] font-medium truncate ${isSelected ? "text-white" : isCompleted ? "text-green-50" : "text-gray-300 group-hover:text-white"}`}
        >
          {name}
        </p>
      </div>
      <span
        className={`text-[10px] font-medium px-2 py-0.5 flex-shrink-0 rounded-full border ${color}`}
      >
        {label}
      </span>
    </div>
  );
};
