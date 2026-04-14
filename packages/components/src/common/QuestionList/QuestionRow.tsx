import type { QuestionRowProps } from "@tbe/interface";
import { cn } from "@tbe/utils";
import { CheckCircle2, Circle, Globe, Lock, Sparkles } from "lucide-react";

/**
 * Checklist row: completion toggle, title, optional "real world" badge, notes indicator.
 * Use via {@link DifficultyQuestionList} or standalone in custom lists.
 */
export const QuestionRow = ({
  name,
  isSelected = false,
  isCompleted = false,
  isRecommended = false,
  hasNotes = false,
  isRealWorldProblem = false,
  realWorldBadgeLabel = "Real World",
  isLocked = false,
  className,
  onClick,
  onToggleComplete,
}: QuestionRowProps) => {
  const handleToggleComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleComplete?.(e);
  };

  return (
    <div
      data-testid="tbe-question-row"
      className={cn(
        "w-full rounded-lg py-2 px-2.5 mb-1 cursor-pointer transition-all duration-200 group flex items-start justify-between gap-2",
        isSelected
          ? "bg-red-500/[0.04] border border-red-500/30 shadow-[0_0_12px_rgba(239,68,68,0.06)] border-l-2 border-l-red-500"
          : isCompleted
            ? "bg-green-500/[0.03] border border-green-500/20 border-l-2 border-l-green-500/60"
            : isLocked
              ? "opacity-60"
              : "bg-transparent border border-transparent hover:bg-[#111] hover:border-gray-800/60",
        isLocked && "cursor-pointer",
        className,
      )}
      onClick={onClick}
    >
      <div className="flex items-start gap-2.5 flex-1 min-w-0">
        <button
          type="button"
          data-testid="tbe-question-row-complete"
          onClick={handleToggleComplete}
          className={cn(
            "mt-0.5 shrink-0 focus:outline-none transition-all duration-200",
            isLocked
              ? "text-gray-600 cursor-not-allowed"
              : isCompleted
                ? "text-green-500 hover:text-green-400"
                : "text-gray-700 hover:text-green-500",
          )}
        >
          {isLocked ? (
            <Lock className="w-[18px] h-[18px] text-gray-500" />
          ) : isCompleted ? (
            <CheckCircle2 className="w-[18px] h-[18px]" />
          ) : (
            <Circle className="w-[18px] h-[18px]" />
          )}
        </button>

        <div className="flex flex-col min-w-0 gap-1">
          <p
            className={cn(
              "text-[13px] font-medium leading-snug transition-colors duration-200 flex items-center gap-1.5",
              isSelected
                ? "text-white"
                : isCompleted
                  ? "text-green-100/80"
                  : isLocked
                    ? "text-gray-500"
                    : "text-gray-400 group-hover:text-gray-200",
            )}
          >
            {isRecommended && (
              <Sparkles className="w-3.5 h-3.5 text-red-500 fill-red-500/20 shrink-0" />
            )}
            <span className="min-w-0 break-words">{name}</span>
          </p>

          {isRealWorldProblem && (
            <span
              data-testid="tbe-question-row-real-world"
              className="inline-flex items-center gap-1 text-blue-400"
              title="Real-world style problem"
            >
              <Globe className="w-2 h-2 shrink-0" />
              <span className="text-[8px] font-bold uppercase tracking-wide">
                {realWorldBadgeLabel}
              </span>
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col items-end gap-1 shrink-0 pt-0.5">
        {hasNotes && (
          <span
            data-testid="tbe-question-row-notes-dot"
            className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.45)]"
            aria-hidden
          />
        )}
      </div>
    </div>
  );
};
