import { DsaQuestionCard } from "./DsaQuestionCard";
import { DsaQuestionListProps } from "@tbe/interface";

const DsaQuestionList = ({
    questions,
    selectedQuestionId,
    onQuestionClick,
    className = ""
}: DsaQuestionListProps) => {
    return (
        <div className={`flex flex-col w-full ${className}`}>
            {questions.map((question) => (
                <DsaQuestionCard
                    key={question.id || question.name}
                    name={question.name}
                    difficultyLevel={question.difficultyLevel}
                    isSelected={selectedQuestionId === question.id}
                    onClick={() => onQuestionClick?.(question)}
                />
            ))}
        </div>
    );
};

export default DsaQuestionList;