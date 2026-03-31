import type { DsaQuestionListProps } from "@tbe/interface";
import { cn } from "@tbe/utils";

import { DsaQuestionCard } from "./DsaQuestionCard";

const DsaQuestionList = ({
  questions,
  selectedQuestionId,
  onQuestionClick,
  className = "",
  completedQuestionIds = [],
  onToggleComplete,
}: DsaQuestionListProps) => {
  return (
    <div className={cn("flex flex-col w-full", className)}>
      {/* Questions List */}
      <div className="flex flex-col w-full">
        {questions.length > 0 ? (
          questions.map((question) => {
            const qId = String(question.id || question.name);
            const isCompleted = completedQuestionIds.some(
              (id) => String(id) === qId,
            );
            const isSelected = String(selectedQuestionId) === qId;

            const isRecommended = (question as any)._priorityScore > 0;
            const hasNotes = !!question.notes;

            return (
              <DsaQuestionCard
                key={qId}
                name={question.name}
                difficultyLevel={question.difficultyLevel}
                isSelected={isSelected}
                isCompleted={isCompleted}
                isRecommended={isRecommended}
                hasNotes={hasNotes}
                onClick={() => onQuestionClick?.(question)}
                onToggleComplete={() => onToggleComplete?.(qId)}
              />
            );
          })
        ) : (
          <div className="py-8 text-center">
            <p className="text-[11px] text-gray-500 font-medium">
              No questions found.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DsaQuestionList;
