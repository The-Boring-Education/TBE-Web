import { usePatternQuiz } from "@tbe/hooks";
import type { PatternQuizPanelProps } from "@tbe/interface";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Brain,
  Check,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Layers,
  RotateCcw,
  TrendingUp,
  X,
} from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const PatternQuizPanel = ({
  questionsPerRound = 5,
  className = "",
  onComplete,
}: PatternQuizPanelProps) => {
  const router = useRouter();
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

  // States for completed review filters and expanded explanations
  const [filter, setFilter] = useState<"all" | "correct" | "incorrect">("all");
  const [expandedQuestions, setExpandedQuestions] = useState<
    Record<string, boolean>
  >({});

  const handleSubmit = () => {
    submitQuiz();
  };

  useEffect(() => {
    if (quizState === "completed" && result && onComplete) {
      onComplete(result);
    }
  }, [quizState, result, onComplete]);

  // Toggle explanation expansion
  const toggleExplanation = (questionId: string) => {
    setExpandedQuestions((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  // Get motivational quote based on score
  const getScoreFeedback = (score: number) => {
    if (score === 100) {
      return {
        title: "Perfect Score! 🏆",
        desc: "You've masterfully internalised these algorithmic patterns.",
        color: "text-[#51cf66]",
      };
    }
    if (score >= 80) {
      return {
        title: "Outstanding! 🌟",
        desc: "Superb pattern recognition intuition. Ready for interviews!",
        color: "text-[#51cf66]",
      };
    }
    if (score >= 60) {
      return {
        title: "Great Job! 👍",
        desc: "Solid understanding. Re-study the patterns you missed to reach perfection.",
        color: "text-[#ffa94d]",
      };
    }
    return {
      title: "Keep Learning! 💪",
      desc: "Review the explanations below and try again to build your intuition.",
      color: "text-[#ff5757]",
    };
  };

  // Idle State (Start Screen) - Compact Padding, borderless on mobile, includes header
  if (quizState === "idle") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={`rounded-2xl border border-transparent sm:border-[#252525] bg-transparent sm:bg-gradient-to-b sm:from-[#141414] sm:to-[#0d0d0d] p-0 sm:p-7 relative overflow-hidden shadow-none sm:shadow-[0_8px_32px_rgba(0,0,0,0.5)] ${className}`}
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-[#ff5757]/[0.04] rounded-full blur-[50px] pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center text-center gap-5">
          {/* Animated Glowing Icon Container without Sparkles */}
          <div className="relative flex size-14 items-center justify-center rounded-2xl border border-[#ff5757]/20 bg-[#ff5757]/05 text-[#ff5757]">
            <Brain className="size-7 text-[#ff5757] drop-shadow-[0_0_6px_rgba(255,87,87,0.4)]" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-sans">
              DSA Pattern Quiz
            </h1>
            <p className="max-w-md text-xs sm:text-sm text-gray-500 font-medium leading-relaxed mx-auto font-sans">
              Train your algorithmic intuition by matching problems with their
              optimal DSA patterns.
            </p>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-3 gap-2 w-full max-w-md mt-1">
            {[
              {
                label: "Questions",
                val: `${questionsPerRound} Qs`,
                icon: HelpCircle,
              },
              { label: "Scope", val: "12+ Patterns", icon: Layers },
              { label: "Difficulty", val: "Adaptive", icon: TrendingUp },
            ].map((spec, i) => (
              <div
                key={i}
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-[#222] bg-[#161616]/40"
              >
                <spec.icon className="size-4 text-[#ff5757] mb-1 opacity-70" />
                <span className="text-[9px] font-bold text-[#555] uppercase tracking-wider font-sans">
                  {spec.label}
                </span>
                <span className="text-[11px] font-black text-[#e0e0e0] mt-0.5 font-sans">
                  {spec.val}
                </span>
              </div>
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.985 }}
            onClick={startQuiz}
            className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-[#ff5757] hover:bg-[#ff6c6c] px-6 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-[0_4px_12px_rgba(255,87,87,0.25)] transition-all font-sans"
          >
            Start Quiz
            <ArrowRight className="size-3.5" />
          </motion.button>
        </div>
      </motion.div>
    );
  }

  // Completed State (Results Screen) - Compact Padding, borderless on mobile
  if (quizState === "completed" && result) {
    const feedback = getScoreFeedback(result.score);
    const scoreRadius = 38;
    const strokeCircumference = 2 * Math.PI * scoreRadius;
    const strokeDashoffset =
      strokeCircumference - (result.score / 100) * strokeCircumference;

    const filteredQuestionIndices = questions
      .map((q, idx) => ({ q, idx }))
      .filter(({ idx }) => {
        const isCorrect = result.answers[idx]?.isCorrect ?? false;
        if (filter === "correct") return isCorrect;
        if (filter === "incorrect") return !isCorrect;
        return true;
      });

    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`rounded-2xl border border-transparent sm:border-[#252525] bg-transparent sm:bg-gradient-to-b sm:from-[#141414] sm:to-[#0d0d0d] p-0 sm:p-7 relative overflow-hidden shadow-none sm:shadow-[0_8px_32px_rgba(0,0,0,0.5)] ${className}`}
      >
        <div className="flex flex-col items-center gap-6">
          {/* Header & SVG Score Circle */}
          <div className="text-center flex flex-col items-center gap-3">
            <div className="relative flex items-center justify-center size-28">
              <svg className="size-full transform -rotate-90">
                <circle
                  cx="56"
                  cy="56"
                  r={scoreRadius}
                  stroke="#222"
                  strokeWidth="4"
                  fill="transparent"
                />
                <motion.circle
                  cx="56"
                  cy="56"
                  r={scoreRadius}
                  stroke="url(#quiz-score-grad)"
                  strokeWidth="6"
                  fill="transparent"
                  strokeDasharray={strokeCircumference}
                  initial={{ strokeDashoffset: strokeCircumference }}
                  animate={{ strokeDashoffset }}
                  transition={{ duration: 1.0, ease: "easeOut" }}
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient
                    id="quiz-score-grad"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#ff5757" />
                    <stop offset="100%" stopColor="#ff9f9f" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-[#fafafa] tracking-tighter leading-none font-sans">
                  {result.score}%
                </span>
                <span className="text-[8px] font-bold text-[#707070] uppercase tracking-widest mt-0.5 font-sans">
                  Score
                </span>
              </div>
            </div>

            <div className="space-y-1 max-w-md">
              <h3
                className={`text-base sm:text-lg font-black ${feedback.color} tracking-tight`}
              >
                {feedback.title}
              </h3>
              <p className="text-[11px] text-[#8a8a8a] leading-relaxed font-sans">
                {feedback.desc}
              </p>
              <p className="text-[10px] font-bold text-[#555] uppercase tracking-wider mt-0.5 font-sans">
                Completed {result.correctAnswers} of {result.totalQuestions} Qs
                correctly
              </p>
            </div>
          </div>

          <div className="w-full h-px bg-[#222]" />

          {/* Results filtering tabs */}
          <div className="w-full max-w-md">
            <div className="flex border-b border-[#222] mb-3">
              {(["all", "correct", "incorrect"] as const).map((tab) => {
                const count =
                  tab === "all"
                    ? result.totalQuestions
                    : tab === "correct"
                      ? result.correctAnswers
                      : result.incorrectAnswers;

                return (
                  <button
                    key={tab}
                    onClick={() => setFilter(tab)}
                    className={`flex-1 pb-2 text-[10px] font-black uppercase tracking-wider transition-colors relative font-sans ${
                      filter === tab
                        ? "text-[#ff5757]"
                        : "text-[#555] hover:text-[#a0a0a0]"
                    }`}
                  >
                    {tab} ({count})
                    {filter === tab && (
                      <motion.div
                        layoutId="activeTabUnderline"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#ff5757]"
                        transition={{
                          type: "spring",
                          stiffness: 350,
                          damping: 30,
                        }}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Questions Review List - Compact Spacing */}
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {filteredQuestionIndices.map(({ q, idx }) => {
                  const answer = result.answers[idx];
                  const isCorrect = answer?.isCorrect ?? false;
                  const isExpanded = expandedQuestions[q.id] ?? false;

                  return (
                    <motion.div
                      key={q.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      className={`rounded-xl border-l-[3px] border bg-[#161616]/40 p-3.5 transition-all ${
                        isCorrect
                          ? "border-l-[#51cf66] border-[#222] hover:border-[#51cf66]/20"
                          : "border-l-[#ff5757] border-[#222] hover:border-[#ff5757]/20"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className={`mt-0.5 flex size-5.5 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                            isCorrect
                              ? "bg-[#51cf66]/10 text-[#51cf66]"
                              : "bg-[#ff5757]/10 text-[#ff5757]"
                          }`}
                        >
                          {isCorrect ? (
                            <Check className="size-3 stroke-[3px]" />
                          ) : (
                            <X className="size-3 stroke-[3px]" />
                          )}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] font-bold text-[#e0e0e0] leading-relaxed font-sans">
                            {q.question}
                          </p>

                          {/* Selected vs Correct answers */}
                          <div className="mt-2 space-y-1">
                            {!isCorrect && (
                              <div className="flex items-center gap-1.5 text-[10px] text-[#ff5757]/90 font-medium font-sans">
                                <span className="font-bold uppercase tracking-wider text-[9px] text-[#ff5757]/45 font-sans">
                                  Your Answer:
                                </span>
                                <span>
                                  {answer && answer.selectedAnswer !== -1
                                    ? q.options[answer.selectedAnswer]
                                    : "None"}
                                </span>
                              </div>
                            )}
                            <div className="flex items-center gap-1.5 text-[10px] text-[#51cf66] font-semibold font-sans">
                              <span className="font-bold uppercase tracking-wider text-[9px] text-[#51cf66]/45 font-sans">
                                Correct Answer:
                              </span>
                              <span>{q.options[q.correctAnswer]}</span>
                            </div>
                          </div>

                          {/* Explanation Toggle */}
                          <div className="mt-2">
                            <button
                              type="button"
                              onClick={() => toggleExplanation(q.id)}
                              className="text-[9px] font-black uppercase tracking-wider text-[#777] hover:text-white flex items-center gap-0.5 transition-colors font-sans"
                            >
                              {isExpanded
                                ? "Hide Explanation"
                                : "View Explanation"}
                              <ChevronRight
                                className={`size-3 transition-transform ${
                                  isExpanded ? "rotate-90" : ""
                                }`}
                              />
                            </button>

                            <AnimatePresence initial={false}>
                              {isExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="overflow-hidden"
                                >
                                  <div className="mt-2 bg-[#202020]/20 rounded-lg p-2.5 text-[10px] text-[#808080] leading-relaxed border border-[#2d2d2d] border-dashed font-sans">
                                    {q.explanation}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {filteredQuestionIndices.length === 0 && (
                <div className="text-center py-6 border border-dashed border-[#222] rounded-xl">
                  <p className="text-[10px] text-[#444] font-semibold font-sans">
                    No questions in this filter tab.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 mt-2">
            <button
              onClick={startQuiz}
              className="flex items-center gap-1.5 rounded-xl bg-[#ff5757] hover:bg-[#ff6c6c] px-5 py-2.5 text-[11px] font-black uppercase tracking-wider text-white transition-all shadow-[0_4px_12px_rgba(255,87,87,0.2)] font-sans"
            >
              <RotateCcw className="size-3.5" />
              Try Again
            </button>
            <button
              onClick={() => {
                resetQuiz();
                router.push("/dashboard");
              }}
              className="rounded-xl border border-[#2e2e2e] bg-[#1a1a1a] text-[#f0f0f0] hover:border-[#ff5757]/45 hover:bg-[#ff5757]/05 px-5 py-2.5 text-[11px] font-black uppercase tracking-wider transition-all font-sans"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  // In-progress State (Upgraded style matching the Resource/Quiz App)
  // Transparent/borderless layout on mobile devices.
  const progress =
    totalQuestions > 0 ? ((currentIndex + 1) / totalQuestions) * 100 : 0;
  const selectedForCurrent = currentQuestion
    ? selectedAnswers.get(currentQuestion.id)
    : undefined;
  const isLastQuestion = currentIndex === totalQuestions - 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`rounded-2xl border border-transparent sm:border-[#252525] bg-transparent sm:bg-gradient-to-b sm:from-[#141414] sm:to-[#0d0d0d] p-0 sm:p-6 shadow-none sm:shadow-lg ${className}`}
    >
      {/* Quiz Title Header */}
      <div className="text-center mb-5">
        <h2 className="text-xs sm:text-sm font-black text-[#fafafa] uppercase tracking-wider font-sans">
          DSA Pattern Challenge
        </h2>
        <p className="text-[10px] sm:text-[11px] text-gray-500 font-semibold mt-0.5 font-sans">
          Question {currentIndex + 1} of {totalQuestions}
        </p>
      </div>

      {/* Progress Bar Container */}
      <div className="mb-6">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#1b1b1b] border border-[#222]">
          <motion.div
            className="h-full rounded-full bg-[#ff5757] shadow-[0_0_6px_rgba(255,87,87,0.4)]"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-gray-600 font-semibold mt-1.5 font-sans">
          <span>{Math.round(progress)}% Complete</span>
          {currentQuestion && (
            <span className="uppercase tracking-widest text-[#ff5757]/80">
              Difficulty: {currentQuestion.difficulty}
            </span>
          )}
        </div>
      </div>

      {/* Question Card wrapper - Borderless on mobile */}
      <AnimatePresence mode="wait">
        {currentQuestion && (
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.2 }}
            className="border border-transparent sm:border-[#222] bg-transparent sm:bg-[#1a1a1a]/40 rounded-xl shadow-none sm:shadow-lg overflow-hidden"
          >
            {/* Question Text inside Header */}
            <div className="bg-transparent sm:bg-[#1a1a1a] p-3 sm:p-5 border-b border-transparent sm:border-[#222]">
              <p className="text-xs sm:text-sm font-semibold text-[#fafafa] leading-relaxed font-sans">
                {currentQuestion.question}
              </p>
            </div>

            {/* Options list exactly structured like resource app - Smaller padding and fonts */}
            <div className="p-1 sm:p-5 space-y-2.5">
              {currentQuestion.options.map((option, idx) => {
                const isSelected = selectedForCurrent === idx;
                return (
                  <div
                    key={idx}
                    onClick={() => selectAnswer(currentQuestion.id, idx)}
                    className={`py-1.5 px-3 rounded-lg border-2 cursor-pointer transition-all duration-200 flex items-center gap-3 ${
                      isSelected
                        ? "border-[#ff5757] bg-[#ff5757]/10"
                        : "border-[#252525] bg-[#111] hover:border-[#ff5757]/30 hover:bg-[#ff5757]/03"
                    }`}
                  >
                    {/* Width & height specified using standard Tailwind w-6 h-6 to keep it circular, avoiding cylinder stretching */}
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-black shrink-0 transition-all duration-200 ${
                        isSelected
                          ? "border-[#ff5757] bg-[#ff5757] text-[#0A0A0A]"
                          : "border-[#333] text-[#555]"
                      }`}
                    >
                      {String.fromCharCode(65 + idx)}
                    </div>

                    <div className="flex-grow text-[#e0e0e0] text-[11px] sm:text-xs font-semibold leading-snug font-sans">
                      {option}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation - Compact padding */}
      <div className="mt-6 flex items-center justify-between border-t border-[#222] pt-4">
        <button
          onClick={prevQuestion}
          disabled={currentIndex === 0}
          className={`flex items-center gap-1 rounded-xl border border-[#2e2e2e] bg-[#1a1a1a] text-[10px] font-black uppercase tracking-wider px-4 py-2.5 transition-colors font-sans ${
            currentIndex === 0
              ? "opacity-25 cursor-not-allowed text-[#444]"
              : "text-[#f0f0f0] hover:border-[#ff5757]/45 hover:bg-[#ff5757]/05"
          }`}
        >
          <ChevronLeft className="size-3.5" />
          Previous
        </button>

        {isLastQuestion ? (
          <button
            onClick={handleSubmit}
            disabled={selectedForCurrent === undefined}
            className={`flex items-center gap-1 rounded-xl px-5 py-2.5 text-[10px] font-black uppercase tracking-wider text-[#0A0A0A] transition-all shadow-[0_4px_12px_rgba(255,87,87,0.2)] font-sans ${
              selectedForCurrent === undefined
                ? "bg-[#ff5757]/50 cursor-not-allowed opacity-50"
                : "bg-[#ff5757] hover:bg-[#ff6c6c]"
            }`}
          >
            Submit Quiz
          </button>
        ) : (
          <button
            onClick={nextQuestion}
            disabled={selectedForCurrent === undefined}
            className={`flex items-center gap-1 rounded-xl px-5 py-2.5 text-[10px] font-black uppercase tracking-wider text-[#fafafa] border border-[#2e2e2e] transition-all font-sans ${
              selectedForCurrent === undefined
                ? "bg-[#202020] text-[#444] cursor-not-allowed"
                : "bg-[#1c1c1c] text-[#f0f0f0] hover:border-[#ff5757]/45 hover:bg-[#ff5757]/05"
            }`}
          >
            Next
            <ChevronRight className="size-3.5" />
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default PatternQuizPanel;
