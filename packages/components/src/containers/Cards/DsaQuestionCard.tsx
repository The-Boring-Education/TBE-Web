import type { DsaQuestionCardProps } from "@tbe/interface";
import { getDifficultyConfig } from "@tbe/utils";

export const DsaQuestionCard = ({
    name,
    difficultyLevel,
    isSelected = false,
    onClick
}: DsaQuestionCardProps) => {

    const { label, color } = getDifficultyConfig(difficultyLevel);

    return (
        <div
            className={`w-full border rounded-lg px-3 py-2.5 mb-1 cursor-pointer transition-all duration-200 group flex items-center justify-between
                ${isSelected
                    ? "bg-[#1A0505] border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.1)]"
                    : "bg-transparent border-gray-800 hover:border-gray-600 hover:bg-[#111]"
                }`}
            onClick={onClick}
        >
            <p className={`text-sm font-medium truncate pr-2 ${isSelected ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>
                {name}
            </p>
            <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${color}`}>
                {label}
            </span>
        </div>
    );
};