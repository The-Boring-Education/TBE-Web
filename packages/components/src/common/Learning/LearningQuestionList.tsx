import type { LearningQuestionListProps } from "@tbe/interface";
import { FaStar } from "react-icons/fa";

import LearningSidebarList from "./LearningSidebarList";
import QuestionLink from "./QuestionLink";

const LearningQuestionList = ({
  questions,
  currentQuestionId,
  isLocked = false,
  href,
  onQuestionSelect,
  theme = "light",
}: LearningQuestionListProps) => {
  return (
    <LearningSidebarList
      items={questions ?? []}
      getKey={(item) => item?._id?.toString() ?? ""}
      renderItem={(item) => {
        const questionId = item?._id?.toString();
        if (!questionId) return null;

        return (
          <div className="flex items-center w-full">
            <QuestionLink
              currentQuestionId={currentQuestionId}
              frequency={item.frequency}
              handleQuestionClick={() =>
                onQuestionSelect(
                  `${item.question}\n\n${item.answer}`,
                  questionId,
                )
              }
              href={href}
              isCompleted={item.isCompleted}
              question={`${item.question}\n\n${item.answer}`}
              questionId={questionId}
              title={item.title}
              isLocked={isLocked}
              theme={theme}
            />
            {item.isStarred && (
              <FaStar
                className="ml-1 text-yellow-400"
                style={{ fontSize: "0.9em" }}
                title="Starred"
              />
            )}
          </div>
        );
      }}
    />
  );
};

export default LearningQuestionList;
