import { TOPIC_LABELS } from "@tbe/constants";
import type { DsaQuestionCardProps } from "@tbe/interface";
import { getDifficultyConfig } from "@tbe/utils";
import { CheckCircle2, Circle, Crown, Sparkles } from "lucide-react";

export const DsaQuestionCard = ({
  name,
  difficultyLevel,
  isSelected = false,
  isCompleted = false,
  isRecommended = false,
  hasNotes = false,
  isRealWorld = false,
  topics = [],
  companyTypes = [],
  userTargetCompanies = [],
  onClick,
  onToggleComplete,
}: DsaQuestionCardProps) => {
  const { label: diffLabel, color: diffColor } =
    getDifficultyConfig(difficultyLevel);

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
            onToggleComplete?.(e);
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
        <div className="flex flex-col min-w-0">
          <p
            className={`text-[13px] font-medium truncate transition-colors duration-200 flex items-center gap-1.5 ${
              isSelected
                ? "text-white"
                : isCompleted
                  ? "text-green-100/80"
                  : "text-gray-400 group-hover:text-gray-200"
            }`}
          >
            {isRecommended && (
              <Sparkles className="w-3 h-3 text-red-500 fill-red-500/20 shrink-0" />
            )}
            {name}
          </p>
          <div className="flex flex-wrap items-center gap-1.5 mt-1">
            {hasNotes && (
              <div className="flex items-center gap-1 opacity-60">
                <span className="text-[9px] text-red-400 font-bold uppercase tracking-tighter">
                  Notes
                </span>
              </div>
            )}
            {topics.slice(0, 1).map((topic) => (
              <span
                key={topic}
                className="text-[9px] text-gray-600 font-bold uppercase tracking-tighter"
              >
                {TOPIC_LABELS[topic] || topic}
              </span>
            ))}
            {(() => {
              // Priority: Show labels that match user's target companies first
              const matchedCompanies = companyTypes.filter((c) =>
                userTargetCompanies.includes(c),
              );

              // If we have matches, show the first matched one.
              // Otherwise show the first available one ONLY if no target is set.
              // This strictly hides "STARTUP" if user selected "Product-based"
              const labelToShow =
                matchedCompanies.length > 0
                  ? matchedCompanies[0]
                  : userTargetCompanies.length === 0
                    ? companyTypes[0]
                    : null;

              if (!labelToShow) return null;

              return (
                <span
                  key={labelToShow}
                  className="text-[9px] text-gray-700 font-bold uppercase tracking-tighter bg-gray-900/40 px-1 rounded transition-all duration-300"
                >
                  {labelToShow}
                </span>
              );
            })()}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {hasNotes && (
          <div className="w-1 h-1 rounded-full bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.5)]" />
        )}
        {isRealWorld && (
          <Crown
            className="w-2.5 h-2.5 shrink-0"
            style={{ color: "rgba(251,191,36,0.65)" }}
            strokeWidth={2}
            title="Real World Problem"
          />
        )}
        <span
          className={`text-[8px] font-black px-1.5 py-0.5 flex-shrink-0 rounded-[4px] border uppercase tracking-widest ${diffColor} opacity-90`}
        >
          {diffLabel}
        </span>
      </div>
    </div>
  );
};
