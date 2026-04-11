import type { DsaQuestionListProps } from "@tbe/interface";
import { cn } from "@tbe/utils";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

import { DsaQuestionCard } from "./DsaQuestionCard";

const DIFFICULTY_ORDER = { EASY: 0, MEDIUM: 1, HARD: 2 };
const DIFFICULTY_LABELS: Record<string, { label: string; labelColor: string }> =
  {
    EASY: { label: "Easy", labelColor: "text-gray-300" },
    MEDIUM: { label: "Medium", labelColor: "text-gray-300" },
    HARD: { label: "Hard", labelColor: "text-gray-300" },
  };

const DsaQuestionList = ({
  questions,
  selectedQuestionId,
  onQuestionClick,
  className = "",
  completedQuestionIds = [],
  onToggleComplete,
  localNotes = {},
  userTargetCompanies = [],
}: DsaQuestionListProps) => {
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    {
      EASY: true,
      MEDIUM: true,
      HARD: true,
    },
  );

  const toggleGroup = (group: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [group]: !prev[group],
    }));
  };

  // Group questions by difficulty
  const groupedQuestions = questions.reduce(
    (acc, question) => {
      const difficulty = question.difficultyLevel?.toUpperCase() || "MEDIUM";
      if (!acc[difficulty]) {
        acc[difficulty] = [];
      }
      acc[difficulty].push(question);
      return acc;
    },
    {} as Record<string, typeof questions>,
  );

  // Sort groups by difficulty order
  const sortedGroups = Object.entries(groupedQuestions).sort(
    ([a], [b]) =>
      (DIFFICULTY_ORDER[a as keyof typeof DIFFICULTY_ORDER] ?? 1) -
      (DIFFICULTY_ORDER[b as keyof typeof DIFFICULTY_ORDER] ?? 1),
  );

  if (questions.length === 0) {
    return (
      <div className={cn("flex flex-col w-full", className)}>
        <div className="py-8 text-center">
          <p className="text-[11px] text-gray-500 font-medium">
            No questions found.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col w-full gap-1", className)}>
      {sortedGroups.map(([difficulty, groupQuestions]) => {
        const isExpanded = expandedGroups[difficulty] ?? true;
        const { label, labelColor } = DIFFICULTY_LABELS[difficulty] || {
          label: difficulty,
          labelColor: "text-gray-400",
        };

        const completedInGroup = groupQuestions.filter((q) => {
          const qId = String(q.id || q.name);
          return completedQuestionIds.some((id) => String(id) === qId);
        }).length;

        return (
          <div key={difficulty} className="flex flex-col">
            {/* Difficulty Group Header — monochrome sleek */}
            <button
              onClick={() => toggleGroup(difficulty)}
              className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-md border border-white/[0.05] bg-white/[0.03] hover:bg-white/[0.05] hover:border-white/[0.08] transition-all duration-200 group"
            >
              {/* Neutral dot */}
              <div className="w-1.5 h-1.5 rounded-full bg-gray-600 flex-shrink-0" />
              <span
                className={cn(
                  "text-[11px] font-bold uppercase tracking-widest flex-1 text-left",
                  labelColor,
                )}
              >
                {label}
              </span>
              <span className="text-[9px] text-gray-600 font-medium tabular-nums">
                {completedInGroup}/{groupQuestions.length}
              </span>
              <ChevronDown
                className={cn(
                  "w-3.5 h-3.5 text-gray-600 transition-transform duration-200 flex-shrink-0",
                  !isExpanded && "-rotate-90",
                )}
              />
            </button>

            {/* Questions in Group */}
            {isExpanded && (
              <div className="flex flex-col w-full mt-0.5 pl-1">
                {groupQuestions.map((question) => {
                  const qId = String(question.id || question.name);
                  const isCompleted = completedQuestionIds.some(
                    (id) => String(id) === qId,
                  );
                  const isSelected = String(selectedQuestionId) === qId;

                  const isRecommended = (question as any)._priorityScore > 0;
                  const hasNotes =
                    !!question.notes || !!(localNotes && localNotes[qId]);

                  return (
                    <DsaQuestionCard
                      key={qId}
                      name={question.name}
                      difficultyLevel={question.difficultyLevel}
                      isSelected={isSelected}
                      isCompleted={isCompleted}
                      isRecommended={isRecommended}
                      hasNotes={hasNotes}
                      isRealWorld={(question as any).isRealWorld}
                      onClick={() => onQuestionClick?.(question)}
                      onToggleComplete={() => onToggleComplete?.(qId)}
                      hideDifficultyBadge
                    />
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default DsaQuestionList;
