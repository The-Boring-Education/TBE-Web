import { DsaQuestionCard } from "./DsaQuestionCard";

export interface DsaQuestion {
    name: string;
    difficultyLevel: "EASY" | "MEDIUM" | "HARD";
    id?: string | number;
    content?: string;
    domain?: string[];
    companyType?: string[];
    topics?: string[]
}


interface DsaQuestionListProps {
    questions: DsaQuestion[];
    selectedQuestionId?: string | number;
    onQuestionClick?: (question: DsaQuestion) => void;
    className?: string;
}

const DsaQuestionList = ({
    questions,
    selectedQuestionId,
    onQuestionClick,
    className = ""
}: DsaQuestionListProps) => {
    return (
        <div className={`flex flex-col  w-full ${className}`}>
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
