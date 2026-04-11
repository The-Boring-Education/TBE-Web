import type { DsaQuestionCardProps } from "@tbe/interface";
import { getDifficultyConfig } from "@tbe/utils";
import { CheckCircle2, Circle, Globe, Sparkles } from "lucide-react";

export const DsaQuestionCard = ({
  name,
  difficultyLevel,
  isSelected = false,
  isCompleted = false,
  isRecommended = false,
  hasNotes = false,
  isRealWorld = false,
  onClick,
  onToggleComplete,
  hideDifficultyBadge = false,
}: DsaQuestionCardProps) => {
  const { label: diffLabel, color: diffColor } =
    getDifficultyConfig(difficultyLevel);

  return (
    <div
      className={`w-full rounded-lg py-2 px-2.5 mb-0.5 cursor-pointer transition-all duration-200 group flex items-center justify-between ${
        isSelected
          ? "bg-white/[0.04] border-l-2 border-l-white/50 border border-transparent pl-2"
          : isCompleted
            ? "border border-transparent"
            : "border border-transparent hover:bg-white/[0.02]"
      }`}
      onClick={onClick}
    >
      <div className="flex items-center gap-2.5 flex-1 min-w-0 pr-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleComplete?.(e);
          }}
          className={`flex-shrink-0 focus:outline-none transition-all duration-200 ${
            isCompleted
              ? "text-green-500 hover:text-green-400"
              : "text-gray-700 hover:text-gray-500"
          }`}
        >
          {isCompleted ? (
            <CheckCircle2 className="w-[16px] h-[16px]" />
          ) : (
            <Circle className="w-[16px] h-[16px]" />
          )}
        </button>
        <p
          className={`text-[13px] font-medium truncate transition-colors duration-200 flex items-center gap-1.5 ${
            isSelected
              ? "text-white"
              : isCompleted
                ? "text-gray-500"
                : "text-gray-400 group-hover:text-gray-200"
          }`}
        >
          {isRecommended && (
            <Sparkles className="w-3 h-3 text-red-500 fill-red-500/20 shrink-0" />
          )}
          {name}
        </p>
      </div>

      {/* Right side indicators */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {hasNotes && (
          <div className="w-1 h-1 rounded-full bg-red-500/70 shadow-[0_0_4px_rgba(239,68,68,0.4)]" />
        )}
        {isRealWorld && (
          <Globe
            className="w-3 h-3 text-gray-600"
            title="Real World Question"
          />
        )}
        {!hideDifficultyBadge && (
          <span
            className={`text-[8px] font-black px-1.5 py-0.5 flex-shrink-0 rounded-[4px] border uppercase tracking-widest ${diffColor} opacity-90`}
          >
            {diffLabel}
          </span>
        )}
      </div>
    </div>
  );
};
