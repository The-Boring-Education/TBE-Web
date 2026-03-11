import React, { useState, useEffect } from "react";
import { Button, FlexContainer, Text } from "@tbe/components";
import type { AptitudeQuestion } from "@tbe/interface";
import AptitudeQuestionCard from "./AptitudeQuestionCard";

export interface AptitudeQuizPanelProps {
    questions: AptitudeQuestion[];
}

export const AptitudeQuizPanel: React.FC<AptitudeQuizPanelProps> = ({
    questions,
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);

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
            {/* Main Panel (Moved to Left) */}
            <div className="flex-1 flex flex-col min-w-0 w-full overflow-y-auto scrollbar-thin-grey px-6 py-8">
                <div className="max-w-3xl mx-auto w-full">
                    {/* Progress header */}
                    <div className="flex items-center gap-3 mb-6">
                        <div className="px-3 py-1 bg-gray-900 border border-gray-800 rounded-full">
                            <Text level="span" className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                Question {currentIndex + 1} / {questions.length}
                            </Text>
                        </div>
                    </div>

                    {/* Question Card */}
                    <AptitudeQuestionCard
                        key={currentQuestion._id}
                        question={currentQuestion}
                        index={currentIndex}
                    />

                    {/* Navigation Buttons */}
                    <FlexContainer
                        className="mt-8 justify-between items-center"
                        fullWidth
                        direction="row"
                    >
                        <Button
                            variant="OUTLINE"
                            size="MEDIUM"
                            text="← Previous"
                            onClick={handlePrev}
                            disabled={currentIndex === 0}
                            aria-disabled={currentIndex === 0}
                            className={`px-6 border-gray-700 bg-[#111] hover:bg-white hover:text-black transition-colors ${currentIndex === 0 ? "opacity-50 cursor-not-allowed hover:bg-[#111] hover:text-white" : ""}`}
                        />
                        <Button
                            variant="PRIMARY"
                            size="MEDIUM"
                            text={currentIndex === questions.length - 1 ? "Finish Summary" : "Next Question →"}
                            onClick={handleNext}
                            disabled={currentIndex === questions.length - 1}
                            aria-disabled={currentIndex === questions.length - 1}
                            className={`px-6 ${currentIndex === questions.length - 1 ? "opacity-50 cursor-not-allowed" : ""}`}
                        />
                    </FlexContainer>
                </div>
            </div>

            {/* Quiz Sidebar for Question Navigation (Moved to Right) */}
            <div className="w-full lg:w-[280px] flex-shrink-0 bg-[#0A0A0A] border-l border-gray-800 p-6 max-h-[300px] lg:max-h-full overflow-y-auto scrollbar-thin-grey flex flex-col shadow-[-10px_0_20px_rgba(0,0,0,0.5)] z-10">
                <Text level="h3" className="text-gray-400 font-bold mb-6 text-xs uppercase tracking-[0.2em]">
                    Question Grid
                </Text>
                <div className="grid grid-cols-5 sm:grid-cols-8 lg:grid-cols-4 gap-3">
                    {questions.map((_, idx) => {
                        const isActive = idx === currentIndex;

                        return (
                            <button
                                key={idx}
                                onClick={() => setCurrentIndex(idx)}
                                aria-current={isActive ? "page" : undefined}
                                className={`w-11 h-11 flex items-center justify-center rounded-lg text-sm font-semibold transition-all duration-300 border focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0A] focus-visible:ring-red-500/50 ${isActive
                                    ? "bg-red-500 border-red-400 text-black shadow-[0_0_15px_rgba(239,68,68,0.4)] scale-105"
                                    : "bg-[#111] border-gray-800 text-gray-400 hover:bg-[#1a1a1a] hover:border-gray-600 hover:text-white"
                                    }`}
                                title={`Jump to Question ${idx + 1}`}
                            >
                                {idx + 1}
                            </button>
                        );
                    })}
                </div>
            </div>
        </FlexContainer>
    );
};

export default AptitudeQuizPanel;
