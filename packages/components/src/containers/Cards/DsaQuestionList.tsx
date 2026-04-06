import type { DsaQuestionListProps } from "@tbe/interface";
import { cn } from "@tbe/utils";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

import { DsaQuestionCard } from "./DsaQuestionCard";

const DIFFICULTY_ORDER = { EASY: 0, MEDIUM: 1, HARD: 2 };
const DIFFICULTY_LABELS = {
  EASY: { label: "Easy", color: "text-green-400" },
  MEDIUM: { label: "Medium", color: "text-orange-400" },
  HARD: { label: "Hard", color: "text-red-400" },
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
    <div className={cn("flex flex-col w-full", className)}>
      {sortedGroups.map(([difficulty, groupQuestions]) => {
        const isExpanded = expandedGroups[difficulty] ?? true;
        const { label, color } = DIFFICULTY_LABELS[
          difficulty as keyof typeof DIFFICULTY_LABELS
        ] || {
          label: difficulty,
          color: "text-gray-400",
        };

        return (
          <div key={difficulty} className="mb-2">
            {/* Difficulty Group Header */}
            <button
              onClick={() => toggleGroup(difficulty)}
              className="flex items-center gap-2 w-full px-2 py-1.5 rounded-lg hover:bg-[#1a1a1a] transition-colors duration-200 group"
            >
              <ChevronDown
                className={cn(
                  "w-4 h-4 text-gray-500 transition-transform duration-200",
                  !isExpanded && "-rotate-90",
                )}
              />
              <span
                className={cn(
                  "text-[11px] font-bold uppercase tracking-wider",
                  color,
                )}
              >
                {label}
              </span>
              <span className="text-[10px] text-gray-600 font-medium">
                ({groupQuestions.length})
              </span>
            </button>

            {/* Questions in Group */}
            {isExpanded && (
              <div className="flex flex-col w-full">
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
                      isRealWorld={Boolean(
                        question.isRealWorld ?? question.isRealWorldProblem,
                      )}
                      topics={question.topics}
                      companyTypes={question.companyType}
                      userTargetCompanies={userTargetCompanies}
                      onClick={() => onQuestionClick?.(question)}
                      onToggleComplete={() => onToggleComplete?.(qId)}
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
