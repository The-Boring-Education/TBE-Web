import React, { useState } from "react";
import markdownit from "markdown-it";
import { Button, Text, FlexContainer } from "@tbe/components";
import type { AptitudeQuestion } from "@tbe/interface";

const md = markdownit({ html: true, breaks: true });

export interface AptitudeQuestionCardProps {
    question: AptitudeQuestion;
    index: number;
}

export const AptitudeQuestionCard: React.FC<AptitudeQuestionCardProps> = ({
    question,
    index,
}) => {
    const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(
        null
    );
    const [showExplanation, setShowExplanation] = useState(false);

    const handleOptionSelect = (optIndex: number) => {
        setSelectedOptionIndex(optIndex);
    };

    const isAnswered = selectedOptionIndex !== null;
    const isCorrectlyAnswered =
        selectedOptionIndex !== null && question.options[selectedOptionIndex]?.isCorrect;

    return (
        <div className="bg-[#0D0D0D] border border-gray-800/80 rounded-xl p-4 md:p-4.5 w-full shadow-2xl relative overflow-hidden">
            <div className="flex items-start gap-4 mb-4">
                <div className="flex items-center justify-center min-w-[26px] w-[26px] h-[26px] rounded-full bg-red-950/20 border border-red-500/30 text-red-500 font-black text-xs shrink-0 mt-0.5">
                    {index + 1}
                </div>
                <div className="flex-1">
                    <div
                        className="text-white text-[15.5px] leading-relaxed font-semibold prose prose-invert prose-p:my-0 prose-pre:bg-[#111] prose-pre:border prose-pre:border-gray-800"
                        dangerouslySetInnerHTML={{
                            __html: md.render(question.question || ""),
                        }}
                    />
                </div>
            </div>

            <div className="space-y-1.5 mb-4">
                {question.options?.map((opt, idx) => {
                    const isSelected = selectedOptionIndex === idx;
                    const label = String.fromCharCode(65 + idx); // A, B, C, D

                    let optionStyle =
                        "border-gray-800/60 bg-[#121212] hover:border-gray-700 hover:bg-white/[0.03] cursor-pointer";

                    if (isAnswered) {
                        if (opt.isCorrect) {
                            optionStyle = "border-green-500/40 bg-green-500/5 text-green-400 shadow-[0_0_12px_rgba(34,197,94,0.1)] backdrop-blur-sm";
                        } else if (isSelected && !opt.isCorrect) {
                            optionStyle = "border-red-500/40 bg-red-500/5 text-red-400 shadow-[0_0_12px_rgba(239,68,68,0.1)] backdrop-blur-sm";
                        } else {
                            optionStyle = "border-gray-800/40 bg-[#0A0A0A] opacity-30 cursor-not-allowed";
                        }
                    }

                    return (
                        <div
                            key={idx}
                            role="button"
                            tabIndex={isAnswered ? -1 : 0}
                            aria-pressed={isSelected}
                            onClick={() => !isAnswered && handleOptionSelect(idx)}
                            onKeyDown={(e) => {
                                if (!isAnswered && (e.key === 'Enter' || e.key === ' ')) {
                                    e.preventDefault();
                                    handleOptionSelect(idx);
                                }
                            }}
                            className={`flex items-start sm:items-center gap-4 py-2 px-4 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-1 focus:ring-red-500/30 ${optionStyle}`}
                        >
                            <div
                                className={`flex items-center justify-center min-w-[24px] w-[24px] h-[24px] rounded border text-[11px] font-black shrink-0 transition-all duration-300 ${isAnswered
                                    ? opt.isCorrect
                                        ? "border-green-500 bg-green-500 text-black shadow-lg shadow-green-500/30"
                                        : isSelected
                                            ? "border-red-500 bg-red-500 text-black shadow-lg shadow-red-500/30"
                                            : "border-gray-800 bg-gray-900 text-gray-700"
                                    : "border-gray-700 bg-[#111] text-gray-500 group-hover:text-white"
                                    }`}
                            >
                                {label}
                            </div>
                            <div
                                className="flex-1 text-[15px] leading-relaxed prose prose-invert prose-p:my-0 prose-pre:bg-transparent prose-pre:p-0 prose-pre:m-0"
                                dangerouslySetInnerHTML={{
                                    __html: md.renderInline(opt.text || ""),
                                }}
                            />
                        </div>
                    );
                })}
            </div>

            <FlexContainer
                direction="row"
                fullWidth
                className="justify-between items-center pt-4 border-t border-gray-800"
            >
                <div className="flex gap-2">
                    {question.topic && (
                        <Text level="span" className="px-2.5 py-1 bg-gray-900 border border-gray-800 rounded text-[11px] font-medium text-gray-400 tracking-wide uppercase">
                            {question.topic}
                        </Text>
                    )}
                    {question.difficulty && (
                        <Text level="span" className="px-2.5 py-1 bg-gray-900 border border-gray-800 rounded text-[11px] font-medium text-gray-400 tracking-wide uppercase">
                            {question.difficulty}
                        </Text>
                    )}
                </div>

                {isAnswered && (
                    <Button
                        variant="GHOST"
                        size="SMALL"
                        text={showExplanation ? "Hide Explanation" : "View Explanation"}
                        onClick={() => setShowExplanation(!showExplanation)}
                        className="text-blue-400 hover:text-blue-300 hover:bg-blue-950/30"
                    />
                )}
            </FlexContainer>

            {showExplanation && (
                <div className="mt-4 p-4 bg-gray-900/30 border border-gray-800/80 rounded-xl backdrop-blur-sm">
                    <Text level="h4" className="text-[12px] font-black text-gray-400 mb-3 uppercase tracking-wider">
                        Explanation
                    </Text>
                    <div
                        className="text-gray-300 text-[14px] leading-relaxed prose prose-invert max-w-none prose-p:my-1 prose-pre:bg-[#111] prose-pre:border prose-pre:border-gray-800"
                        dangerouslySetInnerHTML={{
                            __html: md.render(question.answer || "No explanation provided."),
                        }}
                    />
                </div>
            )}
        </div>
    );
};

export default AptitudeQuestionCard;
