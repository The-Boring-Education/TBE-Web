import type { PatternQuizPanelProps } from "@tbe/interface";
import { usePatternQuiz } from "@tbe/hooks";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";

import Text from "../../common/Typography/Text";
import Button from "../../common/Buttons/Button";
import FlexContainer from "../../containers/Page/common/FlexContainer";

const PatternQuizPanel = ({
  questionsPerRound = 5,
  className = "",
  onComplete,
}: PatternQuizPanelProps) => {
  const {
    currentQuestion,
    currentIndex,
    totalQuestions,
    selectedAnswers,
    quizState,
    result,
    questions,
    startQuiz,
    selectAnswer,
    nextQuestion,
    prevQuestion,
    submitQuiz,
    resetQuiz,
  } = usePatternQuiz(questionsPerRound);

  const handleSubmit = () => {
    submitQuiz();
  };

  useEffect(() => {
    if (quizState === "completed" && result && onComplete) {
      onComplete(result);
    }
  }, [quizState, result, onComplete]);

  // Idle State
  if (quizState === "idle") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`rounded-2xl border border-[#2a2a2a] bg-[#111] p-6 sm:p-8 ${className}`}
      >
        <FlexContainer
          direction="col"
          itemCenter={true}
          justifyCenter={true}
          wrap={false}
          className="gap-4 text-center"
        >
          <Text level="h3" className="text-2xl font-black text-[#f0f0f0]">
            🧩 Find the Pattern
          </Text>
          <Text level="p" className="max-w-md text-sm text-[#909090] leading-relaxed">
            Can you identify which DSA pattern best solves a given problem? Test
            your pattern recognition skills with {questionsPerRound} randomly
            selected questions covering 12+ algorithmic patterns.
          </Text>
          <div className="flex flex-wrap justify-center gap-2 mt-2">
            {["Easy", "Medium", "Hard"].map((diff) => (
              <span
                key={diff}
                className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
                  diff === "Easy"
                    ? "bg-[#51cf66]/10 text-[#51cf66]"
                    : diff === "Medium"
                      ? "bg-[#ffa94d]/10 text-[#ffa94d]"
                      : "bg-[#ff5757]/10 text-[#ff5757]"
                }`}
              >
                {diff}
              </span>
            ))}
          </div>
          <Button
            variant="PRIMARY"
            text="Start Quiz"
            onClick={startQuiz}
            className="mt-4"
          />
        </FlexContainer>
      </motion.div>
    );
  }

  // Completed State
  if (quizState === "completed" && result) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`rounded-2xl border border-[#2a2a2a] bg-[#111] p-6 sm:p-8 ${className}`}
      >
        <FlexContainer
          direction="col"
          itemCenter={true}
          justifyCenter={true}
          wrap={false}
          className="gap-6"
        >
          <div className="text-center">
            <div className="relative mx-auto mb-4 flex size-28 items-center justify-center rounded-full border-4 border-[#2a2a2a] bg-[#0D0D0D]">
              <span className="text-4xl font-black text-[#ff5757]">
                {result.score}%
              </span>
            </div>
            <Text level="h3" className="text-xl font-black text-[#f0f0f0]">
              Quiz Complete!
            </Text>
            <Text level="p" className="mt-1 text-sm text-[#808080]">
              {result.correctAnswers} of {result.totalQuestions} correct
            </Text>
          </div>

          <div className="w-full max-w-lg space-y-3">
            {questions.map((q, idx) => {
              const answer = result.answers[idx];
              const isCorrect = answer?.isCorrect ?? false;
              return (
                <motion.div
                  key={q.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-4"
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        isCorrect
                          ? "bg-[#51cf66]/15 text-[#51cf66]"
                          : "bg-[#ff5757]/15 text-[#ff5757]"
                      }`}
                    >
                      {isCorrect ? "✓" : "✗"}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-[#c0c0c0] leading-relaxed line-clamp-2">
                        {q.question}
                      </p>
                      <p className="mt-1 text-[11px] text-[#51cf66] font-semibold">
                        Answer: {q.options[q.correctAnswer]}
                      </p>
                      <p className="mt-1 text-[11px] text-[#707070] leading-relaxed">
                        {q.explanation}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="flex gap-3 mt-2">
            <Button
              variant="PRIMARY"
              text="Try Again"
              onClick={startQuiz}
            />
            <Button
              variant="OUTLINE"
              text="Close"
              onClick={resetQuiz}
            />
          </div>
        </FlexContainer>
      </motion.div>
    );
  }

  // In-progress State
  const progress =
    totalQuestions > 0 ? ((currentIndex + 1) / totalQuestions) * 100 : 0;
  const selectedForCurrent = currentQuestion
    ? selectedAnswers.get(currentQuestion.id)
    : undefined;
  const isLastQuestion = currentIndex === totalQuestions - 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`rounded-2xl border border-[#2a2a2a] bg-[#111] p-6 sm:p-8 ${className}`}
    >
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <Text level="p" className="text-xs font-bold text-[#808080] uppercase tracking-wider">
          Question {currentIndex + 1} of {totalQuestions}
        </Text>
        {currentQuestion && (
          <span
            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
              currentQuestion.difficulty === "easy"
                ? "bg-[#51cf66]/10 text-[#51cf66]"
                : currentQuestion.difficulty === "medium"
                  ? "bg-[#ffa94d]/10 text-[#ffa94d]"
                  : "bg-[#ff5757]/10 text-[#ff5757]"
            }`}
          >
            {currentQuestion.difficulty}
          </span>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-6 h-1.5 w-full overflow-hidden rounded-full bg-[#252525]">
        <motion.div
          className="h-full rounded-full bg-[#ff5757]"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        {currentQuestion && (
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <Text level="p" className="mb-5 text-sm font-semibold text-[#e0e0e0] leading-relaxed">
              {currentQuestion.question}
            </Text>

            {/* Options */}
            <div className="space-y-3">
              {currentQuestion.options.map((option, idx) => {
                const isSelected = selectedForCurrent === idx;
                return (
                  <motion.button
                    key={idx}
                    type="button"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() =>
                      selectAnswer(currentQuestion.id, idx)
                    }
                    className={`w-full rounded-xl border p-4 text-left text-sm font-medium transition-colors ${
                      isSelected
                        ? "border-[#ff5757] bg-[#ff5757]/10 text-[#f0f0f0]"
                        : "border-[#2a2a2a] bg-[#1a1a1a] text-[#b0b0b0] hover:border-[#3a3a3a] hover:bg-[#1f1f1f]"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span
                        className={`flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${
                          isSelected
                            ? "border-[#ff5757] bg-[#ff5757] text-white"
                            : "border-[#3a3a3a] text-[#707070]"
                        }`}
                      >
                        {String.fromCharCode(65 + idx)}
                      </span>
                      {option}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <div className="mt-6 flex items-center justify-between">
        <Button
          variant="GHOST"
          text="Previous"
          onClick={prevQuestion}
          disabled={currentIndex === 0}
        />
        {isLastQuestion ? (
          <Button
            variant="PRIMARY"
            text="Submit Quiz"
            onClick={handleSubmit}
            disabled={selectedForCurrent === undefined}
          />
        ) : (
          <Button
            variant="SECONDARY"
            text="Next"
            onClick={nextQuestion}
            disabled={selectedForCurrent === undefined}
          />
        )}
      </div>
    </motion.div>
  );
};

export default PatternQuizPanel;
