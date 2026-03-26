import { useAuth } from "@tbe/auth";
import {
  Button,
  CelebrationAnimation,
  LearningEnvironmentLayout,
  Progress,
  Text,
} from "@tbe/components";
import { MarkdownRenderer } from "@tbe/components/quizes";
import { quizApi } from "@tbe/services";
import type { QuizQuestion, QuizQuestionsData } from "@tbe/types";
import { cleanOptionText, cn } from "@tbe/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronUp,
  Clock,
  RotateCcw,
  Target,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";

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
      <LearningEnvironmentLayout backHref="/dashboard/quizzes" isLoading>
        <div className="flex-1 flex items-center justify-center">
          <Text level="p" className="text-gray-400">
            Loading results...
          </Text>
        </div>
      </LearningEnvironmentLayout>
    );
  }

  if (!quiz || questions.length === 0) {
    return (
      <LearningEnvironmentLayout backHref="/dashboard/quizzes">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-red-400">
            Failed to load results. Please try again.
          </div>
        </div>
      </LearningEnvironmentLayout>
    );
  }

  return (
    <LearningEnvironmentLayout
      backHref="/dashboard/quizzes"
      layoutMode="workspace"
    >
      <div className="flex flex-col h-full w-full">
        {/* Workspace Header Section — Centered Title Mode */}
        <div className="w-full min-h-[72px] border-b border-gray-800 bg-[#0A0A0A] flex shrink-0 sticky top-0 z-20">
          <div className="relative w-full h-full flex items-center px-6">
            {/* Left Back Navigation */}
            <div className="flex-1 flex items-center">
              <button
                onClick={() => router.push("/dashboard/quizzes")}
                className="flex items-center justify-center w-[28px] h-[28px] rounded-[6px] border border-red-500/40 bg-red-500/5 text-red-500 hover:bg-red-500/10 hover:border-red-500 transition-all duration-300 shrink-0 shadow-[0_0_10px_rgba(239,68,68,0.1)] active:scale-95"
                title="Back to Quizzes"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Absolute Centered Header Info */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
              <Text
                level="h1"
                className="text-[13px] font-bold text-white tracking-tight leading-none mb-1"
              >
                Quiz Results
              </Text>
              <Text
                level="p"
                className="text-[8px] font-bold text-gray-500 uppercase tracking-widest leading-none bg-gray-900/50 px-2 py-0.5 rounded border border-gray-800"
              >
                {quiz?.categoryName || "Review Mode"}
              </Text>
            </div>

            {/* Right-aligned Result Badge */}
            <div className="flex-1 flex justify-end items-center gap-6">
              <div className="flex items-center gap-3 bg-red-500/5 border border-red-500/20 rounded-lg px-2.5 py-1">
                <div className="flex flex-col items-end mr-1">
                  <Text
                    level="p"
                    className="text-[8px] font-bold text-red-500/70 uppercase tracking-wider leading-none"
                  >
                    Result
                  </Text>
                  <Text
                    level="p"
                    className="text-[13px] font-black text-red-500 leading-none mt-1"
                  >
                    {percentage}%
                  </Text>
                </div>
                <Target className="w-3.5 h-3.5 text-red-500" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 w-full overflow-y-auto scrollbar-hide">
          <CelebrationAnimation
            isActive={showCelebration}
            type="achievement"
            intensity="high"
          />

          <div className="w-full max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8">
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              {/* Left Column - Score Summary */}
              <div className="w-full lg:w-[320px] space-y-4 lg:sticky lg:top-24">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-4"
                >
                  {/* Score Display */}
                  <div className="bg-[#0F0F0F] border border-gray-800 rounded-2xl p-4 text-center shadow-xl">
                    <div className="relative inline-block mb-1">
                      <div className="text-4xl font-black text-red-500 tracking-tighter">
                        {percentage}%
                      </div>
                    </div>
                    <h2 className="text-lg font-bold text-white mb-0.5">
                      {percentage >= 70
                        ? "Fantastic Work!"
                        : "Keep practicing!"}
                    </h2>
                    <p className="text-gray-400 text-xs text-medium">
                      You completed the quiz!
                    </p>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-[#0F0F0F] border border-gray-800 rounded-xl p-3 flex flex-col items-center justify-center text-center">
                      <Target className="w-4 h-4 text-red-500 mb-1.5" />
                      <div className="text-xl font-black text-white leading-none mb-1">
                        {score}
                      </div>
                      <div className="text-[9px] text-gray-500 uppercase font-bold tracking-wider">
                        of {totalQuestions} Correct
                      </div>
                    </div>
                    <div className="bg-[#0F0F0F] border border-gray-800 rounded-xl p-3 flex flex-col items-center justify-center text-center">
                      <Clock className="w-4 h-4 text-red-500 mb-1.5" />
                      <div className="text-xl font-black text-white leading-none mb-1">
                        {Math.floor(timeTaken / 60)}:
                        {String(timeTaken % 60).padStart(2, "0")}
                      </div>
                      <div className="text-[9px] text-gray-500 uppercase font-bold tracking-wider">
                        Total Time
                      </div>
                    </div>
                  </div>

                  {/* Progress Detail */}
                  <div className="bg-[#0F0F0F] border border-gray-800 rounded-xl p-3 space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                      <span className="text-gray-400">Progress</span>
                      <span className="text-white">{percentage}%</span>
                    </div>
                    <Progress
                      value={percentage}
                      className="h-1.5 bg-gray-800"
                    />
                  </div>

                  {/* Quiz Info Card */}
                  <div className="bg-[#0A0A0A] border border-gray-800 rounded-xl p-3 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-900 border border-gray-800 flex items-center justify-center text-xl shrink-0">
                      {quiz.categoryIcon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[9px] text-gray-500 uppercase font-bold tracking-wider mb-0.5">
                        Current Quiz
                      </div>
                      <div className="text-white font-bold truncate text-xs">
                        {quiz.categoryName}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-center gap-2 pt-2">
                    <Button
                      variant="OUTLINE"
                      onClick={() => router.push(`/quiz/${quizId}`)}
                      className="flex-1 max-w-[120px] bg-red-500 hover:bg-red-500/90 text-white font-bold py-2 rounded-lg text-xs"
                      icon={<RotateCcw className="w-3.5 h-3.5 text-white" />}
                      text="Try Again"
                    />
                    <Button
                      variant="OUTLINE"
                      onClick={() => router.push("/dashboard/quizzes")}
                      className="flex-1 max-w-[120px] bg-red-500 hover:bg-red-500/90 text-white font-bold py-2 rounded-lg text-xs"
                      icon={<ArrowLeft className="w-3.5 h-3.5 text-white" />}
                      text="Quizzes"
                    />
                  </div>
                </motion.div>
              </div>

              {/* Right Column - Review List */}
              <div className="flex-1 w-full space-y-6 min-w-0">
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-black text-white tracking-tight">
                    Review Answers
                  </h1>
                  <div className="text-[11px] text-gray-500 font-bold uppercase tracking-widest">
                    {questions.length} Questions analyzed
                  </div>
                </div>

                <div className="space-y-3">
                  {questions.map((question, index) => {
                    const userAnswer = answers[index];
                    const isCorrect = userAnswer === question.correctAnswer;
                    const isExpanded = expandedQuestion === index;

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
                            "border rounded-2xl bg-[#0A0A0A] overflow-hidden transition-all duration-300 relative",
                            isExpanded
                              ? "border-gray-700 ring-1 ring-gray-800 shadow-2xl"
                              : "border-gray-800 hover:border-gray-700",
                          )}
                        >
                          {/* Accordion Header */}
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedQuestion(isExpanded ? null : index)
                            }
                            className="w-full flex items-center gap-4 p-4 text-left transition-colors hover:bg-white/[0.01]"
                          >
                            <div
                              className={cn(
                                "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center border transition-colors",
                                isCorrect
                                  ? "bg-green-500/10 border-green-500/20 text-green-500"
                                  : "bg-red-500/10 border-red-500/20 text-red-500",
                              )}
                            >
                              {isCorrect ? (
                                <CheckCircle2 className="w-4 h-4" />
                              ) : (
                                <XCircle className="w-4 h-4" />
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em]">
                                  Question {index + 1}
                                </span>
                                <span
                                  className={cn(
                                    "px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border",
                                    isCorrect
                                      ? "bg-green-500/5 border-green-500/20 text-green-400"
                                      : "bg-red-500/5 border-red-500/20 text-red-400",
                                  )}
                                >
                                  {isCorrect ? "Correct" : "Incorrect"}
                                </span>
                              </div>
                              <div className="text-white font-semibold truncate text-[14px] md:text-[15px] tracking-tight">
                                {question.question
                                  .replace(/[#*`]/g, "")
                                  .substring(0, 100)}
                                ...
                              </div>
                            </div>

                            <div className="flex-shrink-0 ml-4">
                              <div
                                className={cn(
                                  "w-8 h-8 rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center transition-transform duration-300",
                                  isExpanded ? "rotate-0" : "rotate-180",
                                )}
                              >
                                <ChevronUp className="w-4 h-4 text-gray-500" />
                              </div>
                            </div>
                          </button>

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
                                <div className="px-4 pb-6 pt-2 border-t border-gray-800/50 bg-[#050505]">
                                  <div className="space-y-6 mt-4">
                                    {/* Question Description */}
                                    <div className="space-y-2">
                                      <div className="text-[10px] text-gray-500 uppercase font-black tracking-[0.3em] ml-1">
                                        The Question
                                      </div>
                                      <div className="p-4 bg-[#0A0A0A] rounded-xl border border-gray-800/80">
                                        <MarkdownRenderer
                                          content={question.question}
                                          theme="dark"
                                          className="text-white text-[15px] leading-relaxed selection:bg-red-500/30 font-medium"
                                        />
                                      </div>
                                    </div>

                                    {/* Answers Grid */}
                                    <div className="space-y-3">
                                      <div className="text-[10px] text-gray-500 uppercase font-black tracking-[0.3em] ml-1">
                                        Option Breakdown
                                      </div>
                                      <div className="grid grid-cols-1 gap-2.5">
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
                                                  "py-2.5 px-3.5 rounded-lg border transition-all duration-300 flex items-center relative gap-3.5 overflow-hidden",
                                                  isAnswerCorrect
                                                    ? "border-green-500 bg-green-500/[0.03] shadow-[0_0_20px_rgba(34,197,94,0.05)]"
                                                    : isUserPicked && !isCorrect
                                                      ? "border-red-500 bg-red-500/[0.03] shadow-[0_0_20px_rgba(239,68,68,0.05)]"
                                                      : "border-gray-800 bg-black/40 opacity-50 shadow-none",
                                                )}
                                              >
                                                <span
                                                  className={cn(
                                                    "flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-md text-[10px] font-black border transition-all",
                                                    isAnswerCorrect
                                                      ? "bg-green-500 border-green-500 text-white shadow-[0_0_8px_rgba(34,197,94,0.3)]"
                                                      : isUserPicked &&
                                                          !isCorrect
                                                        ? "bg-red-500 border-red-500 text-white shadow-[0_0_8px_rgba(239,68,68,0.3)]"
                                                        : "bg-[#111] border-gray-800 text-gray-500",
                                                  )}
                                                >
                                                  {String.fromCharCode(
                                                    65 + optionIndex,
                                                  )}
                                                </span>

                                                <div className="flex-1 text-[14px] font-bold text-white">
                                                  <MarkdownRenderer
                                                    content={cleanOptionText(
                                                      option,
                                                    )}
                                                    theme="dark"
                                                    className="text-white selection:bg-red-500/20"
                                                  />
                                                </div>

                                                {isAnswerCorrect && (
                                                  <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                                                )}
                                                {isUserPicked && !isCorrect && (
                                                  <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                                                )}
                                              </div>
                                            );
                                          },
                                        )}
                                      </div>
                                    </div>

                                    {/* Explanation Card */}
                                    <div className="mt-4 p-4 bg-red-500/[0.02] rounded-xl border border-red-500/10 relative group overflow-hidden">
                                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500/30" />
                                      <div className="flex items-center gap-2 text-red-500 font-bold text-[10px] mb-2 uppercase tracking-widest">
                                        <Target className="w-3.5 h-3.5" />
                                        <span>Explanation & Insights</span>
                                      </div>
                                      <div className="text-gray-300 text-[13px] md:text-sm leading-relaxed font-medium">
                                        <MarkdownRenderer
                                          content={question.explanation}
                                          theme="dark"
                                          className="text-gray-300"
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
    </LearningEnvironmentLayout>
  );
}
