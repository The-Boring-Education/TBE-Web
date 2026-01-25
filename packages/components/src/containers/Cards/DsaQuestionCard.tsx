import { DsaQuestionCardProps } from "@tbe/interface";
import { QuestionDifficulty } from "@tbe/interface";

const getDifficultyColor = (difficultyLevel: QuestionDifficulty) => {
    const colors = {
        EASY: "text-green-400",
        MEDIUM: "text-orange-400",
        HARD: "text-red-500",
    };
    return colors[difficultyLevel] || "text-gray-400";
};

export const DsaQuestionCard = ({
    name,
    difficultyLevel,
    isSelected = false,
    onClick
}: DsaQuestionCardProps) => {
    return (
        <div
            className={`w-full bg-black border rounded-xl px-4 py-3 mb-2 hover:border-gray-400 transition cursor-pointer ${isSelected ? "border-red-500" : "border-gray-700"
                }`}
            onClick={onClick}
        >
            <div className="flex items-center justify-between">
                <p className="text-white text-sm font-medium truncate">
                    {name}
                </p>
                <span className={`text-xs font-semibold ${getDifficultyColor(difficultyLevel)}`}>
                    {difficultyLevel}
                </span>
            </div>
        </div>
    );
};