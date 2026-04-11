import type { DsaQuestionCardProps } from "@tbe/interface";
import { CheckCircle2, Circle, Crown, Sparkles } from "lucide-react";

export const DsaQuestionCard = ({
  name,
  isSelected = false,
  isCompleted = false,
  isRecommended = false,
  hasNotes = false,
  isRealWorldProblem = false,
  onClick,
  onToggleComplete,
}: DsaQuestionCardProps) => {
  return (
    <div
      className={`w-full rounded-md py-1.5 px-2.5 mb-0.5 cursor-pointer transition-all duration-150 group flex items-center justify-between ${
        isSelected
          ? "bg-white/[0.05] border-l-2 border-l-white/40 border border-transparent"
          : isCompleted
            ? "border border-transparent opacity-60"
            : "border border-transparent hover:bg-white/[0.03]"
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
              : "text-gray-700 hover:text-green-500"
          }`}
        >
          {isCompleted ? (
            <CheckCircle2 className="w-[16px] h-[16px]" />
          ) : (
            <Circle className="w-[16px] h-[16px]" />
          )}
        </button>
        <p
          className={`text-[14px] font-medium truncate transition-colors duration-200 flex items-center gap-1.5 ${
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
      <div className="flex items-center gap-2">
        {hasNotes && (
          <div className="w-1 h-1 rounded-full bg-red-500/70 shadow-[0_0_4px_rgba(239,68,68,0.4)]" />
        )}
        {isRealWorldProblem && (
          <Crown
            className="w-2.5 h-2.5 shrink-0"
            style={{ color: "rgba(251,191,36,0.65)" }}
            strokeWidth={2}
          />
        )}
      </div>
    </div>
  );
};
