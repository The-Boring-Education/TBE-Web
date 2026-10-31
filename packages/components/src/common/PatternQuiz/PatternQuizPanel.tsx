import { usePatternQuiz } from "@tbe/hooks";
import type { PatternQuizPanelProps } from "@tbe/interface";
import { cn } from "@tbe/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Award,
  Brain,
  Check,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Info,
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

  const toggleExplanation = (questionId: string) => {
    setExpandedQuestions((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  const getScoreFeedback = (score: number) => {
    if (score === 100) {
      return {
        title: "Perfect Score! 🏆",
        desc: "You've masterfully internalised these algorithmic patterns.",
        badge: "Mastery",
      };
    }
    if (score >= 80) {
      return {
        title: "Outstanding! 🌟",
        desc: "Superb pattern recognition intuition. Ready for top interviews!",
        badge: "Advanced",
      };
    }
    if (score >= 60) {
      return {
        title: "Great Job! 👍",
        desc: "Solid understanding. Re-study the patterns you missed to reach perfection.",
        badge: "Proficient",
      };
    }
    return {
      title: "Keep Learning! 💪",
      desc: "Review the explanations below and try again to build your intuition.",
      badge: "Practicing",
    };
  };

  // 1. Idle State (Start Screen) - Matches Platform Learn Quiz Style
  if (quizState === "idle") {
    return (
      <div className="w-full flex justify-center pt-0 pb-2 animate-fadeIn font-sans">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className={`w-full max-w-[480px] rounded-2xl border border-slate-200/90 dark:border-[#24242A] bg-white dark:bg-[#16161A] p-5 sm:p-6 shadow-2xs relative overflow-hidden text-center space-y-4 ${className}`}
        >
          {/* Glowing Top Icon */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative flex w-12 h-12 items-center justify-center rounded-xl border border-red-100 dark:border-red-900/40 bg-red-50 dark:bg-red-950/40 text-[#FF4D4D] shadow-2xs">
              <Brain className="w-6 h-6 text-[#FF4D4D]" />
            </div>

            <div className="space-y-1">
              <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                DSA Pattern Quiz
              </h1>
              <p className="max-w-md text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed mx-auto">
                Train your algorithmic intuition by matching problems with their
                optimal DSA patterns.
              </p>
            </div>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-3 gap-2 w-full">
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
                className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-slate-200/80 dark:border-[#24242C] bg-slate-50/60 dark:bg-[#1E1E24]"
              >
                <spec.icon className="w-3.5 h-3.5 text-[#FF4D4D] mb-1" />
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                  {spec.label}
                </span>
                <span className="text-xs font-black text-slate-800 dark:text-slate-200 mt-0.5">
                  {spec.val}
                </span>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={startQuiz}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#FF4D4D] hover:bg-[#EE3126] px-6 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-xs transition-all cursor-pointer"
          >
            Start Assessment
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      </div>
    );
  }

  // 2. Completed State (Results Screen) - Matches Platform Learn Quiz Style
  if (quizState === "completed" && result) {
    const feedback = getScoreFeedback(result.score);
    const filteredQuestionIndices = questions
      .map((q, idx) => ({ q, idx }))
      .filter(({ idx }) => {
        const isCorrect = result.answers[idx]?.isCorrect ?? false;
        if (filter === "correct") return isCorrect;
        if (filter === "incorrect") return !isCorrect;
        return true;
      });

    return (
      <div className="w-full flex justify-center py-2 animate-fadeIn">
        <div className="w-full max-w-[560px] space-y-4">
          {/* Top Summary Card */}
          <div className="bg-white dark:bg-[#16161A] border border-slate-200/90 dark:border-[#24242A] rounded-2xl p-5 sm:p-7 shadow-xs">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-5 text-center sm:text-left">
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-900/60">
                  <Award className="w-3 h-3" />
                  Assessment Completed
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {feedback.title}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium max-w-sm">
                  {feedback.desc}
                </p>
              </div>

              {/* Accuracy Pill */}
              <div className="flex flex-col items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-slate-50 dark:bg-[#202026] border border-slate-200/80 dark:border-[#2C2C34] shrink-0">
                <span className="text-2xl sm:text-3xl font-black text-[#FF3B30]">
                  {result.score}%
                </span>
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Accuracy
                </span>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-6 pt-5 border-t border-slate-100 dark:border-[#24242C]">
              <div className="bg-slate-50 dark:bg-[#202026] p-3 rounded-xl text-center">
                <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  Score
                </div>
                <div className="text-sm sm:text-base font-black text-slate-900 dark:text-white mt-0.5">
                  {result.correctAnswers} / {result.totalQuestions}
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-[#202026] p-3 rounded-xl text-center">
                <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  Incorrect
                </div>
                <div className="text-sm sm:text-base font-black text-rose-500 mt-0.5">
                  {result.incorrectAnswers}
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-[#202026] p-3 rounded-xl text-center">
                <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  Mastery
                </div>
                <div className="text-sm sm:text-base font-black text-amber-500 mt-0.5">
                  {feedback.badge}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-end gap-2.5 mt-5">
              <button
                type="button"
                onClick={startQuiz}
                className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-[#2C2C34] hover:bg-slate-50 dark:hover:bg-[#222228] text-slate-700 dark:text-slate-300 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Retake Quiz
              </button>
              <button
                type="button"
                onClick={() => {
                  resetQuiz();
                  router.push("/dashboard");
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#FF3B30] hover:bg-[#EE3126] text-white shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Detailed Question Review */}
          <div className="bg-white dark:bg-[#16161A] border border-slate-200/90 dark:border-[#24242A] rounded-2xl p-4 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#24242C] pb-3">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                Questions &amp; Detailed Explanations
              </h3>
              <span className="text-xs text-slate-400">
                {result.correctAnswers} of {result.totalQuestions} correct
              </span>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-100 dark:border-[#24242C]">
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
                    type="button"
                    onClick={() => setFilter(tab)}
                    className={cn(
                      "flex-1 pb-2 text-[10px] font-black uppercase tracking-wider transition-colors relative",
                      filter === tab
                        ? "text-[#FF4D4D]"
                        : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200",
                    )}
                  >
                    {tab} ({count})
                    {filter === tab && (
                      <motion.div
                        layoutId="quizFilterTab"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF4D4D]"
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Questions Review List */}
            <div className="space-y-3 pt-1">
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
                      className={cn(
                        "rounded-xl border p-3.5 transition-all",
                        isCorrect
                          ? "border-emerald-500/20 bg-emerald-500/[0.02]"
                          : "border-rose-500/20 bg-rose-500/[0.02]",
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className={cn(
                            "mt-0.5 flex w-5 h-5 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                            isCorrect
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                              : "bg-rose-500/10 text-rose-600 dark:text-rose-400",
                          )}
                        >
                          {isCorrect ? (
                            <Check className="w-3 h-3 stroke-[3]" />
                          ) : (
                            <X className="w-3 h-3 stroke-[3]" />
                          )}
                        </span>

                        <div className="min-w-0 flex-1 space-y-2">
                          <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 leading-snug">
                            {q.question}
                          </p>

                          {/* Options comparison */}
                          <div className="space-y-1 text-xs">
                            {!isCorrect && (
                              <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-medium">
                                <span className="font-bold uppercase tracking-wider text-[9px] opacity-75">
                                  Your Answer:
                                </span>
                                <span>
                                  {answer && answer.selectedAnswer !== -1
                                    ? q.options[answer.selectedAnswer]
                                    : "None"}
                                </span>
                              </div>
                            )}

                            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                              <span className="font-bold uppercase tracking-wider text-[9px] opacity-75">
                                Correct Answer:
                              </span>
                              <span>{q.options[q.correctAnswer]}</span>
                            </div>
                          </div>

                          {/* Explanation Toggle */}
                          <div className="pt-1">
                            <button
                              type="button"
                              onClick={() => toggleExplanation(q.id)}
                              className="text-[10px] font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 transition-colors"
                            >
                              <span>
                                {isExpanded
                                  ? "Hide Explanation"
                                  : "View Explanation"}
                              </span>
                              <ChevronRight
                                className={cn(
                                  "w-3 h-3 transition-transform",
                                  isExpanded ? "rotate-90" : "",
                                )}
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
                                  <div className="mt-2 bg-slate-50 dark:bg-[#1E1E24] rounded-lg p-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border border-slate-200/80 dark:border-[#2A2A32] flex items-start gap-2">
                                    <Info className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                                    <span>{q.explanation}</span>
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
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3. Playing State - Compact Centered Square Card
  const progress =
    totalQuestions > 0 ? ((currentIndex + 1) / totalQuestions) * 100 : 0;
  const selectedForCurrent = currentQuestion
    ? selectedAnswers.get(currentQuestion.id)
    : undefined;
  const isLastQuestion = currentIndex === totalQuestions - 1;

  return (
    <div className="w-full flex flex-col items-center pt-0 pb-2 animate-fadeIn font-sans">
      <div className="w-full max-w-[540px] flex flex-col gap-2">
        {/* Top Header Card */}
        <div className="bg-white dark:bg-[#16161A] border border-slate-200/90 dark:border-[#24242A] rounded-xl p-2.5 sm:p-3 shadow-2xs shrink-0">
          <div className="flex items-center justify-between gap-2">
            {/* Left: Icon + Title */}
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded-md bg-red-50 dark:bg-red-950/40 text-[#FF4D4D] border border-red-100 dark:border-red-900/40 flex items-center justify-center shrink-0">
                <Brain className="w-3.5 h-3.5" />
              </div>

              <div className="min-w-0">
                <h1 className="text-xs sm:text-[13px] font-black text-slate-900 dark:text-white tracking-tight truncate leading-tight">
                  DSA Pattern Challenge
                </h1>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium leading-none">
                  Pattern Recognition Assessment
                </p>
              </div>
            </div>

            {/* Right: Question Count Badge */}
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-red-50/70 dark:bg-red-950/30 border border-red-100/90 dark:border-red-900/40 text-[10.5px] font-bold text-[#FF4D4D] shadow-2xs shrink-0">
              <span>
                {currentIndex + 1} / {totalQuestions}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-100 dark:bg-[#24242C] h-1 rounded-full overflow-hidden mt-2">
            <div
              className="bg-[#FF4D4D] h-1 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        {currentQuestion && (
          <div className="bg-white dark:bg-[#16161A] border border-slate-200/90 dark:border-[#24242A] rounded-xl p-3.5 sm:p-4 shadow-2xs flex flex-col gap-3">
            {/* Category Tag */}
            <div className="flex items-center justify-between">
              <span className="inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-red-50 dark:bg-red-950/40 text-[#FF4D4D] border border-red-100/80 dark:border-red-900/40">
                Question {currentIndex + 1}
              </span>
              <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-widest">
                Difficulty: {currentQuestion.difficulty}
              </span>
            </div>

            {/* Question Text */}
            <p className="text-xs sm:text-[13px] font-semibold text-slate-900 dark:text-white leading-relaxed">
              {currentQuestion.question}
            </p>

            {/* Options 2x2 Compact Square Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
              {currentQuestion.options.map((option, idx) => {
                const isSelected = selectedForCurrent === idx;

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => selectAnswer(currentQuestion.id, idx)}
                    className={cn(
                      "w-full text-left px-2.5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl border transition-all duration-150 flex items-center gap-2 cursor-pointer group min-h-[42px]",
                      isSelected
                        ? "bg-red-500/10 dark:bg-red-950/40 border-2 border-[#FF4D4D] text-[#FF4D4D] font-bold shadow-2xs"
                        : "bg-slate-50/70 dark:bg-[#1E1E24] border-slate-200/80 dark:border-[#282832] text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-[#383844] hover:bg-slate-100/80 dark:hover:bg-[#25252C]",
                    )}
                  >
                    {/* Circle badge */}
                    <div
                      className={cn(
                        "w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-bold shrink-0 transition-colors",
                        isSelected
                          ? "bg-[#FF4D4D] text-white border-[#FF4D4D]"
                          : "bg-white dark:bg-[#16161A] border-slate-300 dark:border-[#33333C] text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-white",
                      )}
                    >
                      {String.fromCharCode(65 + idx)}
                    </div>

                    <span className="flex-1 text-[11px] sm:text-xs leading-snug font-medium line-clamp-2">
                      {option}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-[#24242A]">
              <button
                type="button"
                onClick={prevQuestion}
                disabled={currentIndex === 0}
                className={cn(
                  "px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1 transition-all",
                  currentIndex === 0
                    ? "opacity-30 border-transparent text-slate-400 cursor-not-allowed"
                    : "border-slate-200 dark:border-[#2A2A34] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#202026] cursor-pointer",
                )}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Previous
              </button>

              {isLastQuestion ? (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={selectedForCurrent === undefined}
                  className={cn(
                    "px-3.5 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider text-white transition-all shadow-xs flex items-center gap-1.5",
                    selectedForCurrent === undefined
                      ? "bg-slate-300 dark:bg-[#2C2C34] text-slate-500 cursor-not-allowed"
                      : "bg-[#FF4D4D] hover:bg-[#EE3126] cursor-pointer",
                  )}
                >
                  <span>Submit Quiz</span>
                  <Check className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={nextQuestion}
                  disabled={selectedForCurrent === undefined}
                  className={cn(
                    "px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1",
                    selectedForCurrent === undefined
                      ? "bg-slate-100 dark:bg-[#202026] text-slate-400 cursor-not-allowed"
                      : "bg-[#FF4D4D] hover:bg-[#EE3126] text-white cursor-pointer shadow-xs",
                  )}
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatternQuizPanel;
