import type { DsaQuestionListProps } from "@tbe/interface";
import { cn } from "@tbe/utils";
import { useState } from "react";

import { DsaQuestionCard } from "./DsaQuestionCard";

const DIFFICULTIES = ["All", "Easy", "Medium", "Hard"];

const DsaQuestionList = ({
  questions,
  selectedQuestionId,
  onQuestionClick,
  className = "",
  completedQuestionIds = [],
  onToggleComplete,
}: DsaQuestionListProps) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");

  const filteredQuestions = questions.filter((q) => {
    if (selectedDifficulty === "All") return true;
    return (
      q.difficultyLevel?.toUpperCase() === selectedDifficulty.toUpperCase()
    );
  });

  return (
    <div className={cn("flex flex-col w-full", className)}>
      {/* Difficulty Filter Chips */}
      <div className="flex items-center gap-1.5 mt-1 mb-4 w-full">
        {DIFFICULTIES.map((difficulty) => {
          const isSelected = selectedDifficulty === difficulty;

          let colorClasses = "";
          if (isSelected) {
            switch (difficulty) {
              case "Easy":
                colorClasses = "bg-green-600 border-green-500 text-white";
                break;
              case "Medium":
                colorClasses = "bg-orange-600 border-orange-500 text-white";
                break;
              case "Hard":
                colorClasses = "bg-red-600 border-red-500 text-white";
                break;
              default: // All
                colorClasses = "bg-gray-700 border-gray-600 text-white";
                break;
            }
          } else {
            colorClasses =
              "bg-[#111] border-gray-800/60 text-gray-500 hover:text-gray-400 hover:border-gray-700";
          }

          return (
            <button
              key={difficulty}
              onClick={() => setSelectedDifficulty(difficulty)}
              className={cn(
                "flex-1 px-1 py-1 rounded text-[9px] font-bold uppercase tracking-wider border transition-all duration-200 text-center",
                colorClasses,
              )}
            >
              {difficulty}
            </button>
          );
        })}
      </div>

      {/* Questions List */}
      <div className="flex flex-col w-full">
        {filteredQuestions.length > 0 ? (
          filteredQuestions.map((question) => {
            const qId = String(question.id || question.name);
            const isCompleted = completedQuestionIds.some(
              (id) => String(id) === qId,
            );
            const isSelected = String(selectedQuestionId) === qId;

            return (
              <DsaQuestionCard
                key={qId}
                name={question.name}
                difficultyLevel={question.difficultyLevel}
                isSelected={isSelected}
                isCompleted={isCompleted}
                onClick={() => onQuestionClick?.(question)}
                onToggleComplete={() => onToggleComplete?.(qId)}
              />
            );
          })
        ) : (
          <div className="py-8 text-center">
            <p className="text-[11px] text-gray-500 font-medium">
              No {selectedDifficulty.toLowerCase()} questions found.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DsaQuestionList;
