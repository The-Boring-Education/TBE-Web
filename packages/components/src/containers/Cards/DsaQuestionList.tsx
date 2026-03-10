import type { DsaQuestionListProps } from "@tbe/interface";

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
    <div className={`flex flex-col w-full ${className}`}>
      {questions.map((question) => {
        const qId = question.id || question.name;
        return (
          <DsaQuestionCard
            key={qId}
            name={question.name}
            difficultyLevel={question.difficultyLevel}
            isSelected={selectedQuestionId === question.id}
            isCompleted={completedQuestionIds.includes(qId)}
            onClick={() => onQuestionClick?.(question)}
            onToggleComplete={() => onToggleComplete?.(qId)}
          />
        );
      })}
    </div>
  );
};

export default DsaQuestionList;
