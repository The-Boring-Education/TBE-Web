import { Button, FlexContainer, Text } from "@tbe/components";
import type { AptitudeQuestion } from "@tbe/interface";
import React, { useEffect,useState } from "react";

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
                    <div className="flex items-center gap-3 mb-5">
                        <div className="px-2.5 py-1 bg-gray-900/50 border border-gray-800/60 rounded-md backdrop-blur-sm">
                            <Text level="span" className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.15em]">
                                Question {currentIndex + 1} of {questions.length}
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
            <div className="w-full lg:w-[240px] flex-shrink-0 bg-[#0A0A0A] border-l border-gray-800 p-5 max-h-[300px] lg:max-h-full overflow-y-auto scrollbar-thin-grey flex flex-col z-10">
                <Text level="h3" className="text-gray-500 font-bold mb-5 text-[10px] uppercase tracking-[0.15em]">
                    Questions
                </Text>
                <div className="grid grid-cols-6 sm:grid-cols-10 lg:grid-cols-4 gap-2">
                    {questions.map((_, idx) => {
                        const isActive = idx === currentIndex;

                        return (
                            <button
                                key={idx}
                                onClick={() => setCurrentIndex(idx)}
                                aria-current={isActive ? "page" : undefined}
                                className={`w-9 h-9 flex items-center justify-center rounded-md text-[13px] font-semibold transition-all duration-300 border focus:outline-none ${isActive
                                    ? "bg-red-500 border-red-400 text-black shadow-[0_0_12px_rgba(239,68,68,0.3)]"
                                    : "bg-[#0F0F0F] border-gray-800/60 text-gray-500 hover:border-gray-600 hover:text-gray-300"
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
