import { Button, FlexContainer, Text } from "@tbe/components";
import type { AptitudeQuestion } from "@tbe/interface";
import markdownit from "markdown-it";
import React, { useState } from "react";

const md = markdownit({ html: true, breaks: true });

export interface AptitudeQuestionCardProps {
  question: AptitudeQuestion;
  index: number;
  totalQuestions: number;
  onNext: () => void;
  onPrev: () => void;
}

export const AptitudeQuestionCard: React.FC<AptitudeQuestionCardProps> = ({
  question,
  index,
  totalQuestions,
  onNext,
  onPrev,
}) => {
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(
    null,
  );

  const handleOptionSelect = (optIndex: number) => {
    setSelectedOptionIndex(optIndex);
  };

  const isAnswered = selectedOptionIndex !== null;
  const isCorrectlyAnswered =
    selectedOptionIndex !== null &&
    question.options[selectedOptionIndex]?.isCorrect;

  return (
    <div className="bg-[#0D0D0D] border border-gray-800/80 rounded-xl p-4 md:p-5 w-full shadow-2xl relative flex flex-col flex-shrink-0">
      <div className="flex items-start gap-3.5 mb-5">
        <div className="flex items-center justify-center min-w-[24px] w-[24px] h-[24px] rounded-full bg-red-500/10 border border-red-500/20 text-red-500 font-extrabold text-xs shrink-0 mt-0.5 shadow-[0_0_10px_rgba(239,68,68,0.15)]">
          {index + 1}
        </div>
        <div className="flex-1">
          <div
            className="text-white text-[15px] leading-relaxed font-semibold prose prose-invert prose-p:my-0 prose-pre:bg-[#111] prose-pre:border prose-pre:border-gray-800"
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
              optionStyle =
                "border-green-500/40 bg-green-500/5 text-green-400 shadow-[0_0_12px_rgba(34,197,94,0.1)] backdrop-blur-sm";
            } else if (isSelected && !opt.isCorrect) {
              optionStyle =
                "border-red-500/40 bg-red-500/5 text-red-400 shadow-[0_0_12px_rgba(239,68,68,0.1)] backdrop-blur-sm";
            } else {
              optionStyle =
                "border-gray-800/40 bg-[#0A0A0A] opacity-30 cursor-not-allowed";
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
                if (!isAnswered && (e.key === "Enter" || e.key === " ")) {
                  e.preventDefault();
                  handleOptionSelect(idx);
                }
              }}
              className={`flex items-start sm:items-center gap-3 py-2 px-3 rounded-lg border transition-all duration-300 focus:outline-none focus:ring-1 focus:ring-red-500/30 ${optionStyle}`}
            >
              <div
                className={`flex items-center justify-center min-w-[22px] w-[22px] h-[22px] rounded border text-[11px] font-black shrink-0 transition-all duration-300 ${
                  isAnswered
                    ? opt.isCorrect
                      ? "border-green-500 bg-green-500 text-black shadow-[0_0_8px_rgba(34,197,94,0.4)]"
                      : isSelected
                        ? "border-red-500 bg-red-500 text-black shadow-[0_0_8px_rgba(239,68,68,0.4)]"
                        : "border-gray-800 bg-gray-900 text-gray-700"
                    : "border-gray-700 bg-[#141414] text-gray-400 group-hover:text-white"
                }`}
              >
                {label}
              </div>
              <div
                className="flex-1 text-[14px] leading-snug prose prose-invert prose-p:my-0 prose-pre:bg-transparent prose-pre:p-0 prose-pre:m-0"
                dangerouslySetInnerHTML={{
                  __html: md.renderInline(opt.text || ""),
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Integrated Navigation Footer */}
      <FlexContainer
        className="mt-4 pt-4 border-t border-gray-800/60 justify-between items-center"
        fullWidth
        direction="row"
      >
        <Button
          variant="OUTLINE"
          size="SMALL"
          text="← Prev"
          onClick={onPrev}
          disabled={index === 0}
          aria-disabled={index === 0}
          className={`px-5 py-1.5 text-xs border-gray-700 bg-[#111] hover:bg-white hover:text-black transition-colors ${index === 0 ? "opacity-50 cursor-not-allowed hover:bg-[#111] hover:text-white" : ""}`}
        />
        <Button
          variant="PRIMARY"
          size="SMALL"
          text={index === totalQuestions - 1 ? "Finish" : "Next →"}
          onClick={onNext}
          disabled={index === totalQuestions - 1}
          aria-disabled={index === totalQuestions - 1}
          className={`px-5 py-1.5 text-xs ${index === totalQuestions - 1 ? "opacity-50 cursor-not-allowed" : ""}`}
        />
      </FlexContainer>
    </div>
  );
};

export default AptitudeQuestionCard;
