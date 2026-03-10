import { useAuth } from "@tbe/auth";
import {
  Button,
  Card,
  CardContent,
  CelebrationAnimation,
  Footer,
  Navbar,
  Progress
} from "@tbe/components";
import { MarkdownRenderer } from "@tbe/components/quizes";
import { config } from "@tbe/config/quizes";
import { quizApi } from "@tbe/services";
import type { QuizQuestion, QuizQuestionsData } from "@tbe/types";
import { cleanOptionText } from "@tbe/utils";
import { AnimatePresence,motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, ChevronDown, ChevronUp, Clock, RotateCcw, Target, Trophy, XCircle } from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useMemo, useRef, useState } from "react";

export default function ResultsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

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
      if (Array.isArray(parsed)) return parsed.map((v) => (typeof v === "number" ? v : -1));
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

  const questions: QuizQuestion[] = useMemo(() => quiz?.questions || [], [quiz?.questions]);

  const score = useMemo(() => {
    return answers.reduce((acc, answer, index) => {
      const correct = questions[index]?.correctAnswer;
      return acc + (answer === correct ? 1 : 0);
    }, 0);
  }, [answers, questions]);

  const totalQuestions = questions.length;
  const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

  useEffect(() => {
    if (!loadingQuiz && percentage >= 70) {
      const timer = setTimeout(() => setShowCelebration(true), 500);
      return () => clearTimeout(timer);
    }
  }, [loadingQuiz, percentage]);

  if (loadingQuiz) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-gray-300">Loading results...</div>
      </div>
    );
  }

  if (!quiz || questions.length === 0) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-red-400">Failed to load results. Please try again.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col">
      <Navbar variant="oncampus" theme="dark" />

      <CelebrationAnimation isActive={showCelebration} type="achievement" intensity="high" />

      <main className="flex-1 w-full mt-16 pb-12">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8 items-start">

            {/* Left Column - */}
            <div className="w-full lg:w-[30%] space-y-2 lg:sticky lg:top-24">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-4"
              >
                {/* Score Display */}
                <div className="bg-[#0F0F0F] border border-gray-800 rounded-2xl p-4 text-center shadow-xl">
                  <div className="relative inline-block mb-1">
                    <div className="text-4xl font-black text-[#FF5757] tracking-tighter">
                      {percentage}%
                    </div>
                  </div>
                  <h2 className="text-lg font-bold text-white mb-0.5">
                    {percentage >= 70 ? "Fantastic Work!" : "Keep practicing!"}
                  </h2>
                  <p className="text-gray-400 text-xs">You completed the quiz!</p>
                </div>


                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-[#0F0F0F] border border-gray-800 rounded-xl p-3 text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Target className="w-3 h-3 text-[#FF5757]" />
                    </div>
                    <div className="text-xl font-bold text-white">{score}</div>
                    <div className="text-[9px] text-gray-500 uppercase font-bold tracking-wider">of {totalQuestions} Correct</div>
                  </div>
                  <div className="bg-[#0F0F0F] border border-gray-800 rounded-xl p-3 text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Clock className="w-3 h-3 text-[#FF5757]" />
                    </div>
                    <div className="text-xl font-bold text-white">
                      {Math.floor(timeTaken / 60)}:{String(timeTaken % 60).padStart(2, "0")}
                    </div>
                    <div className="text-[9px] text-gray-500 uppercase font-bold tracking-wider">Total Time</div>
                  </div>
                </div>


                <div className="bg-[#0F0F0F] border border-gray-800 rounded-xl p-3 space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                    <span className="text-gray-400">Progress</span>
                    <span className="text-white">{percentage}%</span>
                  </div>
                  <Progress value={percentage} className="h-1.5 bg-gray-800" />
                </div>

                {/* Quiz Info Card */}
                <div className="bg-[#0A0A0A] border border-gray-800 rounded-xl p-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-900 border border-gray-800 flex items-center justify-center text-xl shrink-0">
                    {quiz.categoryIcon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[9px] text-gray-500 uppercase font-bold tracking-wider mb-0.5">Current Quiz</div>
                    <div className="text-white font-bold truncate text-xs">{quiz.categoryName}</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-center gap-2 pt-2">
                  <Button
                    variant="OUTLINE"
                    onClick={() => router.push(`/quiz/${quizId}`)}
                    className="flex-1 max-w-[120px] bg-[#FF5757] hover:bg-[#FF5757]/90 text-white font-bold py-2 rounded-lg text-xs"
                    icon={<RotateCcw className="w-3.5 h-3.5 text-white" />}
                    text="Try Again"
                  />
                  <Button
                    variant="OUTLINE"
                    onClick={() => router.push("/dashboard/quizzes")}
                    className="flex-1 max-w-[120px] bg-[#FF5757] hover:bg-[#FF5757]/90 text-white font-bold py-2 rounded-lg text-xs"
                    icon={<ArrowLeft className="w-3.5 h-3.5 text-white" />}
                    text="Quizes"
                  />
                </div>
              </motion.div>
            </div>

            {/*Right column*/}
            <div className="flex-1 w-full space-y-4 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h1 className="text-2xl font-bold text-white">Review Answers</h1>
                <div className="text-xs text-gray-500 font-medium">Click a question to expand</div>
              </div>

              <div className="space-y-2">
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
                        className={[
                          "border rounded-2xl bg-[#0F0F0F] overflow-hidden transition-all duration-300",
                          isExpanded ? "border-gray-700 ring-1 ring-gray-800 shadow-2xl" : "border-gray-800 hover:border-gray-700"
                        ].join(" ")}
                      >
                        {/* Accordion Header */}
                        <button
                          type="button"
                          onClick={() => setExpandedQuestion(isExpanded ? null : index)}
                          className="w-full flex items-center gap-3 p-2 text-left transition-colors hover:bg-gray-900/30"
                        >
                          <div className={[
                            "flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center",
                            isCorrect ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                          ].join(" ")}>
                            {isCorrect ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Question {index + 1}</span>
                              <span className={[
                                "px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest",
                                isCorrect ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
                              ].join(" ")}>
                                {isCorrect ? "Correct" : "Incorrect"}
                              </span>
                            </div>
                            <div className="text-white font-semibold truncate text-sm md:text-base">
                              {question.question.replace(/[#*`]/g, '').substring(0, 100)}...
                            </div>
                          </div>

                          <div className="flex-shrink-0 ml-4">
                            {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
                          </div>
                        </button>

                        {/* Accordion Content */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3, ease: "easeInOut" }}
                            >
                              <div className="p-2 pt-0 border-t border-gray-800/50 bg-gray-950/20">
                                <div className="space-y-2 mt-2">
                                  {/* Full Question Text */}
                                  <div className="space-y-0.5">
                                    {/* <div className="text-[10px] text-gray-500 uppercase font-black tracking-[0.2em] ml-1">Question description</div> */}
                                    <div className="p-2 bg-gray-900/50 rounded-lg border border-gray-800/50">
                                      <MarkdownRenderer content={question.question} theme="dark" className="text-gray-100 text-sm leading-tight" />
                                    </div>
                                  </div>

                                  {/* Answers Section */}
                                  <div className="space-y-0.5">
                                    <div className="text-[10px] text-gray-500 uppercase font-black tracking-[0.2em] ml-1">Answers</div>
                                    <div className="grid grid-cols-1 gap-1">
                                      {question.options.map((option, optionIndex) => {
                                        const isAnswerCorrect = optionIndex === question.correctAnswer;
                                        const isUserPicked = optionIndex === userAnswer;

                                        const getStyle = () => {
                                          if (isAnswerCorrect) return "border-green-500/50 bg-green-500/10 ring-1 ring-green-500/10";
                                          if (isUserPicked && !isCorrect) return "border-red-500/50 bg-red-500/10 ring-1 ring-red-500/10";
                                          return "border-gray-800 bg-gray-900/10 opacity-70";
                                        };

                                        return (
                                          <div
                                            key={optionIndex}
                                            className={`p-1.5 rounded-lg border transition-all duration-200 ${getStyle()}`}
                                          >
                                            <div className="flex items-start gap-2">
                                              <span className={[
                                                "flex-shrink-0 w-5 h-5 flex items-center justify-center rounded text-[10px] font-bold",
                                                isAnswerCorrect ? "bg-green-500 text-white" :
                                                  (isUserPicked && !isCorrect) ? "bg-red-500 text-white" : "bg-gray-800 text-gray-400"
                                              ].join(" ")}>
                                                {String.fromCharCode(65 + optionIndex)}
                                              </span>
                                              <div className="flex-1 text-xs">
                                                <MarkdownRenderer content={cleanOptionText(option)} theme="dark" className="text-white leading-tight" />
                                              </div>
                                              {isAnswerCorrect && <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />}
                                              {isUserPicked && !isCorrect && <XCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />}
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>

                                  {/* Explanation Section */}
                                  <div className="p-2 bg-[#FF5757]/5 rounded-xl border border-[#FF5757]/10">
                                    <h4 className="flex items-center gap-1.5 text-[#FF5757] font-bold text-[10px] mb-1 uppercase tracking-widest">
                                      <Target className="w-3 h-3" />
                                      Explanation
                                    </h4>
                                    <div className="text-gray-300 text-xs leading-tight">
                                      <MarkdownRenderer content={question.explanation} theme="dark" className="text-gray-300" />
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
      </main>

      <Footer variant="oncampus" isMini />
    </div>
  );
}
