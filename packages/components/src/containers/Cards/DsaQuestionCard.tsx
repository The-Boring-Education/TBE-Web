import type { DsaQuestionCardProps } from "@tbe/interface";

export const DsaQuestionCard = ({
    name,
    difficultyLevel,
    isSelected = false,
    onClick
}: DsaQuestionCardProps) => {

    const getDifficultyConfig = (level: string) => {
        switch (level?.toUpperCase()) {
            case 'EASY': return { label: 'Easy', color: 'text-emerald-400 bg-emerald-950/30 border-emerald-500/20' };
            case 'MEDIUM': return { label: 'Med.', color: 'text-orange-400 bg-orange-950/30 border-orange-500/20' };
            case 'HARD': return { label: 'Hard', color: 'text-red-400 bg-red-950/30 border-red-500/20' };
            default: return { label: level, color: 'text-gray-400 bg-gray-800/50 border-gray-700' };
        }
    };

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