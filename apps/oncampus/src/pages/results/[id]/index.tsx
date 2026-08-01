import { useAuth } from "@tbe/auth";
import {
  CelebrationAnimation,
  ContentFeedbackWidget,
  Progress,
  Text,
} from "@tbe/components";
import { CodeRenderer } from "@tbe/components/quizes";
import { quizApi } from "@tbe/services";
import type { QuizQuestion, QuizQuestionsData } from "@tbe/types";
import { cleanOptionText, cn } from "@tbe/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Brain,
  CheckCircle2,
  ChevronUp,
  Clock,
  Monitor,
  RotateCcw,
  Target,
  X,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";

import OnCampusLearningLayout from "@/components/OnCampusLearningLayout";

export default function ResultsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  const quizId = router.query.id as string | undefined;
  const answersParam = router.query.answers as string | undefined;
  const timeTakenParam = router.query.timeTaken as string | undefined;

  const [quiz, setQuiz] = useState<QuizQuestionsData | null>(null);
  const [loadingQuiz, setLoadingQuiz] = useState(true);
  const [showCelebration, setShowCelebration] = useState(false);
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);

  // Auth guard
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  const answers: number[] = useMemo(() => {
    if (!answersParam) return [];
    try {
      const parsed = JSON.parse(answersParam);
      if (Array.isArray(parsed))
        return parsed.map((v) => (typeof v === "number" ? v : -1));
      return [];
    } catch {
      return [];
    }
  }, [answersParam]);

  const timeTaken = useMemo(() => {
    const parsed = timeTakenParam ? parseInt(timeTakenParam, 10) : 0;
    return Number.isFinite(parsed) ? parsed : 0;
  }, [timeTakenParam]);

  useEffect(() => {
    const load = async () => {
      if (!quizId) return;
      setLoadingQuiz(true);
      try {
        const response = await quizApi.getQuestions(quizId, false);
        if (response?.success && response?.data) {
          setQuiz(response.data as QuizQuestionsData);
        } else {
          setQuiz(null);
        }
      } catch {
        setQuiz(null);
      } finally {
        setLoadingQuiz(false);
      }
    };
    void load();
  }, [quizId]);

  const questions: QuizQuestion[] = useMemo(
    () => quiz?.questions || [],
    [quiz?.questions],
  );

  const score = useMemo(() => {
    return answers.reduce((acc, answer, index) => {
      const correct = questions[index]?.correctAnswer;
      return acc + (answer === correct ? 1 : 0);
    }, 0);
  }, [answers, questions]);

  const totalQuestions = questions.length;
  const percentage =
    totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

  useEffect(() => {
    if (!loadingQuiz && percentage >= 70) {
      const timer = setTimeout(() => setShowCelebration(true), 500);
      return () => clearTimeout(timer);
    }
  }, [loadingQuiz, percentage]);

  if (loadingQuiz) {
    return (
      <OnCampusLearningLayout backHref="/dashboard" isLoading>
        <div className="flex-1 flex items-center justify-center">
          <Text level="p" className="text-zinc-400">
            Loading results...
          </Text>
        </div>
      </OnCampusLearningLayout>
    );
  }

  if (!quiz || questions.length === 0) {
    return (
      <OnCampusLearningLayout backHref="/dashboard">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-primary font-semibold text-sm">
            Failed to load results. Please try again.
          </div>
        </div>
      </OnCampusLearningLayout>
    );
  }

  return (
    <OnCampusLearningLayout backHref="/dashboard" layoutMode="workspace">
      <div className="flex flex-col h-full w-full">
        {/* Workspace Header Section — Styled like the Quiz Header */}
        <div className="w-full min-h-[72px] border-b border-zinc-800 bg-zinc-950/40 flex shrink-0 sticky top-0 z-20 backdrop-blur-md">
          <div className="relative w-full h-full flex items-center px-4 sm:px-6">
            {/* Left aligned: Back Navigation + Brain Icon + Stacked Header Titles */}
            <div className="flex items-center gap-3 sm:gap-4">
              <button
                onClick={() => router.push("/dashboard/quizzes")}
                className="flex h-6 w-6 items-center justify-center rounded-lg text-zinc-500 ring-1 ring-zinc-800 hover:bg-zinc-800 hover:text-zinc-300 transition-all active:scale-95 shrink-0"
                title="Back to Quizzes"
              >
                <X className="h-3 w-3" />
              </button>

              <div className="flex items-center gap-2.5">
                <Brain className="h-5 w-5 text-primary shrink-0" />
                <div>
                  <span className="text-sm font-semibold text-zinc-100 tracking-tight block truncate max-w-[120px] sm:max-w-none">
                    {quiz?.categoryName || "Quiz"}
                  </span>
                  <span className="text-xs font-medium text-zinc-500 mt-0.5 block">
                    Quiz Results
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 w-full overflow-y-auto scrollbar-hide relative">
          <div className="absolute inset-x-0 top-0 pointer-events-none z-[100]">
            <CelebrationAnimation
              isActive={showCelebration}
              type="achievement"
              intensity="high"
            />
          </div>

          <div className="w-full max-w-6xl mx-auto px-4 md:px-6">
            <div className="flex flex-col lg:flex-row gap-4 lg:gap-8 items-start">
              {/* Left Column - Score Summary */}
              <div className="w-full lg:w-[320px] lg:sticky lg:top-0 h-fit pt-4 lg:pt-8 pb-0 lg:pb-4 z-10">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-4"
                >
                  {/* Score Display */}
                  <div className="relative">
                    {/* gradient border */}
                    <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-zinc-700/70 via-zinc-800/30 to-transparent pointer-events-none" />
                    <div className="relative flex flex-col rounded-2xl border border-zinc-800 bg-zinc-900 p-4 text-center overflow-hidden">
                      <div className="relative inline-block mb-1">
                        <div className="text-4xl font-black text-primary tracking-tighter">
                          {percentage}%
                        </div>
                      </div>
                      <h2 className="text-sm font-bold text-zinc-100 mb-0.5">
                        {percentage >= 70
                          ? "Fantastic Work!"
                          : "Keep practicing!"}
                      </h2>
                      <p className="text-zinc-500 text-xs font-medium">
                        You completed the quiz!
                      </p>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-zinc-900 border border-zinc-800/80 rounded-xl p-3 flex flex-col items-center justify-center text-center">
                      <Target className="w-4 h-4 text-primary mb-1.5 ring-1 ring-primary/10 rounded-md p-0.5 bg-primary/5" />
                      <div className="text-xl font-bold text-zinc-100 leading-none mb-1 tracking-tight">
                        {score}
                      </div>
                      <div className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider">
                        of {totalQuestions} Correct
                      </div>
                    </div>
                    <div className="bg-zinc-900 border border-zinc-800/80 rounded-xl p-3 flex flex-col items-center justify-center text-center">
                      <Clock className="w-4 h-4 text-primary mb-1.5 ring-1 ring-primary/10 rounded-md p-0.5 bg-primary/5" />
                      <div className="text-xl font-bold text-zinc-100 leading-none mb-1 tracking-tight">
                        {Math.floor(timeTaken / 60)}:
                        {String(timeTaken % 60).padStart(2, "0")}
                      </div>
                      <div className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider">
                        Total Time
                      </div>
                    </div>
                  </div>

                  {/* Progress Detail */}
                  <div className="bg-zinc-900 border border-zinc-800/80 rounded-xl p-3 space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                      <span className="text-zinc-400">Progress</span>
                      <span className="text-zinc-100">{percentage}%</span>
                    </div>
                    <Progress
                      value={percentage}
                      className="h-1.5 bg-zinc-800"
                    />
                  </div>

                  {/* Quiz Info Card */}
                  <div className="bg-zinc-900 border border-zinc-800/80 rounded-xl p-3 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-zinc-950/40 border border-zinc-800 flex items-center justify-center shrink-0">
                      <Monitor
                        className="w-3.5 h-3.5 text-zinc-400"
                        strokeWidth={2}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider mb-0.5">
                        Current Quiz
                      </div>
                      <div className="text-zinc-100 font-semibold truncate text-xs">
                        {quiz.categoryName}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-center gap-3 pt-1">
                    <button
                      onClick={() => router.push(`/quiz/${quizId}`)}
                      className="flex-1 w-full flex items-center justify-center gap-2 bg-transparent border border-primary/30 text-primary hover:bg-primary/10 hover:border-primary font-semibold h-9 rounded-xl text-xs whitespace-nowrap transition-all active:scale-95 duration-200"
                    >
                      <span>Try Again</span>
                      <RotateCcw className="w-3 h-3 shrink-0" />
                    </button>
                    <button
                      onClick={() => router.push("/dashboard")}
                      className="flex-1 w-full flex items-center justify-center gap-2 bg-transparent border border-primary/30 text-primary hover:bg-primary/10 hover:border-primary font-semibold h-9 rounded-xl text-xs whitespace-nowrap transition-all active:scale-95 duration-200"
                    >
                      <span>Quizzes</span>
                      <ArrowLeft className="w-3 h-3 rotate-180 shrink-0" />
                    </button>
                  </div>
                </motion.div>
              </div>

              {/* Right Column - Review List */}
              <div className="flex-1 w-full space-y-6 min-w-0 pt-2 lg:pt-8 pb-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg sm:text-xl font-bold text-zinc-100 tracking-tight">
                    Review Answers
                  </h2>
                  <div className="text-xs font-semibold text-zinc-500 tracking-wide uppercase">
                    {questions.length} Questions
                  </div>
                </div>

                <div className="space-y-2.5">
                  {questions.map((question, index) => {
                    const userAnswer = answers[index];
                    const isCorrect = userAnswer === question.correctAnswer;
                    const isExpanded = expandedQuestion === index;

                    // If the question contains a markdown code block, hide it when the item is collapsed
                    const displayQuestion = isExpanded
                      ? question.question
                      : question.question.includes("```")
                        ? question.question.split("```")[0]?.trim() ||
                          question.question
                        : question.question;

                    return (
                      <motion.div
                        key={question._id || index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="group"
                      >
                        <div
                          className={cn(
                            "border rounded-2xl bg-zinc-900 overflow-hidden transition-all duration-300 relative",
                            isExpanded
                              ? "border-zinc-700 ring-1 ring-zinc-700/30 shadow-2xl"
                              : "border-zinc-800 hover:border-zinc-700",
                          )}
                        >
                          {/* Accordion Header */}
                          <div
                            onClick={() =>
                              setExpandedQuestion(isExpanded ? null : index)
                            }
                            className="w-full flex items-start gap-2.5 sm:gap-4 py-2 px-3 sm:py-2.5 sm:px-4 text-left transition-colors hover:bg-zinc-800/10 cursor-pointer"
                          >
                            {/* Left-aligned status circle box (hidden on mobile, flex on desktop) */}
                            <div
                              className={cn(
                                "hidden sm:flex flex-shrink-0 w-8 h-8 rounded-lg items-center justify-center border transition-colors mt-0.5",
                                isCorrect
                                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                                  : "bg-primary/10 border-primary/20 text-primary",
                              )}
                            >
                              {isCorrect ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                              ) : (
                                <XCircle className="w-4 h-4 text-primary shrink-0" />
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2 mb-1.5 w-full">
                                <div className="flex items-center gap-2">
                                  {/* Mobile-only status icon */}
                                  <div className="sm:hidden shrink-0">
                                    {isCorrect ? (
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                    ) : (
                                      <XCircle className="w-3.5 h-3.5 text-primary" />
                                    )}
                                  </div>
                                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                                    Question {index + 1}
                                  </span>
                                </div>
                                <span
                                  className={cn(
                                    "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border shrink-0",
                                    isCorrect
                                      ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-400"
                                      : "bg-primary/5 border-primary/20 text-primary",
                                  )}
                                >
                                  {isCorrect ? "Correct" : "Incorrect"}
                                </span>
                              </div>
                              <div
                                className="text-zinc-100 font-semibold text-sm tracking-tight leading-relaxed"
                                onClick={(e) => {
                                  // Prevent clicks inside code layout elements from bubbling up & collapsing accordion
                                  if (
                                    (e.target as HTMLElement).closest(
                                      "pre, code, button",
                                    )
                                  ) {
                                    e.stopPropagation();
                                  }
                                }}
                              >
                                <CodeRenderer
                                  content={displayQuestion}
                                  theme="dark"
                                  className="text-zinc-100 text-sm [&_p]:m-0 [&_p]:leading-relaxed"
                                />
                              </div>
                            </div>

                            <div className="flex-shrink-0 ml-2 sm:ml-4 mt-0.5">
                              <div
                                className={cn(
                                  "w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-zinc-950/40 border border-zinc-800 flex items-center justify-center transition-all duration-200 active:scale-95",
                                  isExpanded ? "rotate-0" : "rotate-180",
                                )}
                              >
                                <ChevronUp className="w-4 h-4 text-zinc-500" />
                              </div>
                            </div>
                          </div>

                          {/* Accordion Content */}
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{
                                  duration: 0.3,
                                  ease: "easeInOut",
                                }}
                              >
                                <div className="px-3 sm:px-4 pb-3.5 pt-1.5 border-t border-zinc-800 bg-zinc-950/20">
                                  <div className="space-y-4 mt-3">
                                    {/* Answers Grid */}
                                    <div className="space-y-2">
                                      <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest ml-1">
                                        Option Breakdown
                                      </div>
                                      <div className="grid grid-cols-1 gap-2">
                                        {question.options.map(
                                          (option, optionIndex) => {
                                            const isAnswerCorrect =
                                              optionIndex ===
                                              question.correctAnswer;
                                            const isUserPicked =
                                              optionIndex === userAnswer;

                                            return (
                                              <div
                                                key={optionIndex}
                                                className={cn(
                                                  "w-full flex items-start gap-2.5 sm:gap-3 rounded-xl px-3 sm:px-4 py-1.5 text-xs text-left ring-1 transition-all duration-200 relative",
                                                  isAnswerCorrect
                                                    ? "bg-emerald-500/5 ring-emerald-500/30 text-emerald-400"
                                                    : isUserPicked && !isCorrect
                                                      ? "bg-primary/10 ring-primary/40 text-primary"
                                                      : "bg-zinc-900/50 ring-zinc-800/80 text-zinc-400 opacity-60",
                                                )}
                                              >
                                                {/* Letter badge */}
                                                <span
                                                  className={cn(
                                                    "flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[9px] font-bold ring-1 transition-all mt-0.5",
                                                    isAnswerCorrect
                                                      ? "bg-emerald-500/20 ring-emerald-500/50 text-emerald-400"
                                                      : isUserPicked &&
                                                          !isCorrect
                                                        ? "bg-primary/20 ring-primary/50 text-primary"
                                                        : "bg-zinc-800 ring-zinc-700 text-zinc-500",
                                                  )}
                                                >
                                                  {String.fromCharCode(
                                                    65 + optionIndex,
                                                  )}
                                                </span>

                                                {/* Option text */}
                                                <div className="flex-1 text-zinc-300 [&_p]:m-0 [&_p]:leading-normal leading-normal text-xs font-normal">
                                                  <CodeRenderer
                                                    content={cleanOptionText(
                                                      option,
                                                    )}
                                                    theme="dark"
                                                    className="max-w-none text-xs font-normal [&_p]:m-0 [&_p]:leading-normal text-zinc-300"
                                                  />
                                                </div>

                                                {isAnswerCorrect && (
                                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                                                )}
                                                {isUserPicked && !isCorrect && (
                                                  <XCircle className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                                                )}
                                              </div>
                                            );
                                          },
                                        )}
                                      </div>
                                    </div>

                                    {/* Explanation Card */}
                                    <div className="mt-3 p-3 bg-primary/5 rounded-xl border border-primary/10 relative group overflow-hidden">
                                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/40" />
                                      <div className="flex items-center gap-2 text-primary font-bold text-[10px] mb-2 uppercase tracking-widest">
                                        <Target className="w-3.5 h-3.5 shrink-0" />
                                        <span>Explanation & Insights</span>
                                      </div>
                                      <div className="text-zinc-300 text-xs md:text-xs leading-relaxed font-normal [&_p]:m-0">
                                        <CodeRenderer
                                          content={question.explanation}
                                          theme="dark"
                                          className="text-zinc-300 font-normal text-xs [&_p]:m-0"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {quizId && (
        <ContentFeedbackWidget
          contentType="QUIZ"
          contentId={quizId}
          title="Rate this quiz"
          meta={{
            quizId,
            quizName: quiz?.categoryName || "Quiz",
          }}
          theme="dark"
        />
      )}
    </OnCampusLearningLayout>
  );
}
