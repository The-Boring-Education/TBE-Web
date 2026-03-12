import { Button, FlexContainer, Text } from "@tbe/components";
import type { AptitudeQuestion } from "@tbe/interface";
import React, { useEffect,useState } from "react";

import AptitudeQuestionCard from "./AptitudeQuestionCard";
import markdownit from "markdown-it";

const md = markdownit({ html: true, breaks: true });

export interface AptitudeQuizPanelProps {
    questions: AptitudeQuestion[];
}

export const AptitudeQuizPanel: React.FC<AptitudeQuizPanelProps> = ({
    questions,
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showExplanation, setShowExplanation] = useState(false);

    // Reset explanation when changing questions
    useEffect(() => {
        setShowExplanation(false);
    }, [currentIndex]);

    // Reset if questions change
    useEffect(() => {
        setCurrentIndex(0);
    }, [questions]);

    if (!questions || questions.length === 0) {
        return (
            <div className="flex items-center justify-center p-10 text-gray-500">
                No questions available for this topic.
            </div>
        );
    }

    const handleNext = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex((prev) => prev + 1);
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex((prev) => prev - 1);
        }
    };

    const currentQuestion = questions[currentIndex];

    if (!currentQuestion) return null;

    return (
        <FlexContainer
            direction="col"
            className="lg:flex-row flex-1 min-h-0 w-full h-full gap-0"
            itemCenter={false}
            justifyCenter={false}
            wrap={false}
        >
            {/* Main Panel (Centered Compact Layout) */}
            <div className="flex-1 w-full overflow-y-auto overflow-x-hidden scrollbar-thin-grey px-4 flex flex-col">
                <div className="mx-auto w-full max-w-2xl flex-shrink-0 my-auto py-6">
                    {/* Unified Question Card */}
                    <AptitudeQuestionCard
                        key={currentQuestion._id}
                        question={currentQuestion}
                        index={currentIndex}
                        totalQuestions={questions.length}
                        onNext={handleNext}
                        onPrev={handlePrev}
                    />

                    {/* Explanation Content (In Main Workspace) */}
                    {showExplanation && (
                        <div className="mt-4 p-5 bg-[#0D0D0D] border border-gray-800/80 rounded-xl shadow-2xl">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                                <Text level="h4" className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">
                                    Explanation
                                </Text>
                            </div>
                            <div
                                className="text-gray-300 text-[13px] leading-relaxed prose prose-invert max-w-none prose-p:my-2 prose-pre:bg-[#050505] prose-pre:border prose-pre:border-gray-800"
                                dangerouslySetInnerHTML={{
                                    __html: md.render(currentQuestion.answer || "No explanation available for this question."),
                                }}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Quiz Sidebar (Control & Context) */}
            <div className="w-full lg:w-[260px] flex-shrink-0 bg-[#0A0A0A] border-l border-gray-800 p-4 flex flex-col z-10 overflow-y-auto scrollbar-thin-grey gap-5">

                {/* 1. Progress */}
                <div>
                    <Text level="span" className="text-[9px] text-gray-600 uppercase font-bold tracking-[0.15em] block mb-2">
                        Progress
                    </Text>
                    <div className="px-3 py-1.5 bg-[#111] border border-gray-800/60 rounded-md inline-flex items-baseline gap-1">
                        <span className="text-white font-bold text-sm">{currentIndex + 1}</span>
                        <span className="text-gray-600 text-sm">/</span>
                        <span className="text-gray-500 font-bold text-sm">{questions.length}</span>
                    </div>
                </div>

                {/* 2. Topic & Difficulty */}
                <div>
                    <Text level="span" className="text-[9px] text-gray-600 uppercase font-bold tracking-[0.15em] block mb-2">
                        Context
                    </Text>
                    <div className="flex flex-wrap gap-1.5">
                        {currentQuestion.topic && (
                            <span className="px-2 py-0.5 bg-red-500/8 border border-red-500/15 rounded text-[9px] font-bold text-red-400/80 uppercase tracking-wider">
                                {currentQuestion.topic}
                            </span>
                        )}
                        {currentQuestion.difficulty && (
                            <span className="px-2 py-0.5 bg-[#141414] border border-gray-800/60 rounded text-[9px] font-bold text-gray-500 uppercase tracking-wider">
                                {currentQuestion.difficulty}
                            </span>
                        )}
                    </div>
                </div>

                {/* 3. Explanation Trigger */}
                <div className="pt-3 border-t border-gray-800/40">
                    <button
                        onClick={() => setShowExplanation(!showExplanation)}
                        className={`w-full px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-[0.15em] border transition-all duration-200 ${showExplanation
                            ? "border-red-500/40 bg-red-500/10 text-red-400 hover:bg-red-500/15"
                            : "border-gray-800 bg-[#111] text-gray-400 hover:border-gray-600 hover:text-gray-300"
                            }`}
                    >
                        {showExplanation ? "Hide Explanation" : "View Explanation"}
                    </button>
                </div>
            </div>
        </FlexContainer>
    );
};

export default AptitudeQuizPanel;
