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
        <div className="bg-[#111] border border-gray-800 rounded-xl p-5 md:p-6 w-full shadow-lg">
            <div className="flex items-start gap-4 mb-6">
                <div className="flex items-center justify-center min-w-[32px] w-[32px] h-[32px] rounded-full bg-red-950/40 border border-red-500/50 text-red-500 font-bold text-sm shrink-0">
                    {index + 1}
                </div>
                <div className="flex-1 mt-1">
                    <div
                        className="text-white text-[15px] sm:text-base leading-relaxed font-medium prose prose-invert prose-pre:bg-[#1a1a1a] prose-pre:border prose-pre:border-gray-800"
                        dangerouslySetInnerHTML={{
                            __html: md.render(question.question || ""),
                        }}
                    />
                </div>
            </div>

            <div className="space-y-3 mb-6">
                {question.options?.map((opt, idx) => {
                    const isSelected = selectedOptionIndex === idx;
                    const label = String.fromCharCode(65 + idx); // A, B, C, D

                    let optionStyle =
                        "border-gray-800 hover:border-gray-600 bg-[#141414] hover:bg-[#1a1a1a] cursor-pointer shadow-sm";

                    if (isAnswered) {
                        if (opt.isCorrect) {
                            optionStyle = "border-green-500/50 bg-green-950/20 text-green-300 shadow-[0_0_15px_rgba(34,197,94,0.1)]";
                        } else if (isSelected && !opt.isCorrect) {
                            optionStyle = "border-red-500/50 bg-red-950/20 text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.1)]";
                        } else {
                            optionStyle = "border-gray-800/60 bg-[#111] opacity-50 cursor-not-allowed";
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
                            className={`flex items-start sm:items-center gap-4 p-4 min-h-[64px] rounded-xl border transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#111] focus-visible:ring-red-500/50 ${optionStyle}`}
                        >
                            <div
                                className={`flex items-center justify-center min-w-[30px] w-[30px] h-[30px] rounded border text-sm font-bold shrink-0 transition-colors duration-300 ${isAnswered
                                    ? opt.isCorrect
                                        ? "border-green-500 bg-green-500 text-black shadow-lg shadow-green-500/20"
                                        : isSelected
                                            ? "border-red-500 bg-red-500 text-black shadow-lg shadow-red-500/20"
                                            : "border-gray-700 bg-gray-900 text-gray-600"
                                    : "border-gray-600 bg-[#111] text-gray-400 hover:text-white"
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
                <div className="mt-4 p-4 bg-gray-900/50 border border-gray-800 rounded-lg">
                    <Text level="h4" className="text-sm font-bold text-gray-300 mb-2">
                        Explanation
                    </Text>
                    <div
                        className="text-gray-400 text-sm leading-relaxed prose prose-invert max-w-none prose-p:my-1 prose-pre:bg-[#111] prose-pre:border prose-pre:border-gray-800"
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
