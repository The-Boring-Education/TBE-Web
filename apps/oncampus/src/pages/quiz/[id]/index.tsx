import { useAuth } from "@tbe/auth";
import { LoadingSpinner, Text } from "@tbe/components";
import { CodeRenderer } from "@tbe/components/quizes";
import { routes } from "@tbe/constants";
import { queryKeys, useQueryClient } from "@tbe/query";
import { gamificationApi, quizApi } from "@tbe/services";
import type { QuizQuestion, QuizQuestionsData } from "@tbe/types";
import { cleanOptionText, cn, sendRequest } from "@tbe/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Brain, X, Zap } from "lucide-react";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import OnCampusLearningLayout from "@/components/OnCampusLearningLayout";

type GameState = "loading" | "playing" | "submitting";

const isMongoObjectId = (val?: string): boolean => {
  if (!val) return false;
  return /^[a-fA-F0-9]{24}$/.test(val);
};

const resolveUserIdToMongoId = async (
  user: { id?: string; email?: string; name?: string; image?: string } | null,
): Promise<string | null> => {
  const candidateId = user?.id;
  if (candidateId && isMongoObjectId(candidateId)) return candidateId;
  if (!user?.email) return null;

  try {
    const lookup = await sendRequest({
      url: `${routes.api.base}${routes.api.user}?email=${encodeURIComponent(user.email)}`,
    });
    const dbId = lookup?.data?._id;
    if (dbId && isMongoObjectId(String(dbId))) return String(dbId);
  } catch {
    // try create below
  }

  try {
    const created = await sendRequest({
      method: "POST",
      url: `${routes.api.base}${routes.api.user}`,
      body: {
        name: user?.name || "User",
        email: user.email,
        googleId: user?.id || "",
        image: user?.image || "",
      },
    });
    const createdId = created?.data?._id;
    if (createdId && isMongoObjectId(String(createdId)))
      return String(createdId);
  } catch {
    // ignore
  }

  return null;
};

export default function QuizPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isAuthenticated, isLoading } = useAuth();
  const quizId = router.query.id as string | undefined;

  const [quiz, setQuiz] = useState<QuizQuestionsData | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Per-question: which option index was chosen
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<number, number>
  >({});
  // Per-question: time taken
  const [questionTimes, setQuestionTimes] = useState<Record<number, number>>(
    {},
  );
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());

  const [gameState, setGameState] = useState<GameState>("loading");
  const [quizStartTime] = useState(Date.now());
  const hasSubmittedRef = useRef(false);
  const mongoUserIdRef = useRef<string | null>(null);

  // Auth guard
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!user?.email && !user?.id) {
      mongoUserIdRef.current = null;
      return;
    }
    void resolveUserIdToMongoId(user).then((id) => {
      mongoUserIdRef.current = id;
    });
  }, [user]);

  const loadQuiz = useCallback(async () => {
    if (!quizId) return;
    try {
      const response = await quizApi.getQuestions(quizId, false);
      if (response?.success && response?.data) {
        setQuiz(response.data as QuizQuestionsData);
        setGameState("playing");
        setCurrentQuestionIndex(0);
        setSelectedAnswers({});
        setQuestionTimes({});
      } else {
        throw new Error(response?.message || "Failed to load quiz");
      }
    } catch {
      setQuiz(null);
      setGameState("loading");
    }
  }, [quizId]);

  useEffect(() => {
    void loadQuiz();
  }, [loadQuiz]);

  useEffect(() => {
    if (gameState === "playing") {
      setQuestionStartTime(Date.now());
    }
  }, [currentQuestionIndex, gameState]);

  const questions = useMemo(() => quiz?.questions || [], [quiz?.questions]);
  const currentQuestion: QuizQuestion | undefined =
    questions[currentQuestionIndex];
  const total = questions.length;
  const progress = total > 0 ? ((currentQuestionIndex + 1) / total) * 100 : 0;

  const submitQuiz = useCallback(
    async (currentSelectedAnswers = selectedAnswers) => {
      if (!quizId || !quiz || hasSubmittedRef.current) return;
      hasSubmittedRef.current = true;
      setGameState("submitting");

      const mongoUserId =
        mongoUserIdRef.current ?? (await resolveUserIdToMongoId(user));
      if (mongoUserId) mongoUserIdRef.current = mongoUserId;

      const totalTimeSpent = Math.floor((Date.now() - quizStartTime) / 1000);
      const answersPayload = questions.map((q, index) => {
        const selAns = currentSelectedAnswers[index] ?? -1;
        const correctIdx = (q as any).correctAnswer ?? (q as any).correct ?? -1;
        const isCorrect = selAns === correctIdx;
        const timeSpent = questionTimes[index] || 0;
        return {
          questionIndex: index,
          selectedAnswer: selAns,
          isCorrect,
          timeSpent,
        };
      });

      try {
        if (mongoUserId) {
          await quizApi.submitQuiz(quizId, {
            userId: mongoUserId,
            answers: answersPayload,
            totalTimeSpent,
          });

          gamificationApi
            .updateuserGamificationPoints({
              userId: mongoUserId,
              actionType: "COMPLETE_QUIZ",
            } as any)
            .then(() => {
              void queryClient.invalidateQueries({
                queryKey: queryKeys.gamification.points(mongoUserId),
              });
            })
            .catch(() => {});
        }
      } catch {
        // ignore submit errors
      } finally {
        const answersParam = encodeURIComponent(
          JSON.stringify(answersPayload.map((a) => a.selectedAnswer)),
        );
        router.replace(
          `/results/${quizId}?answers=${answersParam}&timeTaken=${totalTimeSpent}`,
        );
      }
    },
    [
      quizId,
      quiz,
      user,
      quizStartTime,
      questions,
      selectedAnswers,
      questionTimes,
      router,
      queryClient,
    ],
  );

  const selectAnswer = (idx: number) => {
    if (!quiz || !currentQuestion || gameState !== "playing") return;

    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
    setQuestionTimes((prev) => ({
      ...prev,
      [currentQuestionIndex]: timeSpent,
    }));

    const updatedAnswers = { ...selectedAnswers, [currentQuestionIndex]: idx };
    setSelectedAnswers(updatedAnswers);

    if (currentQuestionIndex < total - 1) {
      // Small visual transition delay so the user feels the selection click
      setTimeout(() => {
        setCurrentQuestionIndex((prev) => prev + 1);
      }, 180);
    } else {
      setTimeout(() => {
        void submitQuiz(updatedAnswers);
      }, 180);
    }
  };

  const handleNext = useCallback(() => {
    if (currentQuestionIndex + 1 >= total) {
      void submitQuiz();
    } else {
      setCurrentQuestionIndex((c) => c + 1);
    }
  }, [currentQuestionIndex, total, submitQuiz]);

  const handlePrev = useCallback(() => {
    if (currentQuestionIndex === 0) return;
    setCurrentQuestionIndex((c) => c - 1);
  }, [currentQuestionIndex]);

  // ── Loading / Submitting screens ──────────────────────────────────────────

  if (gameState === "loading") {
    return (
      <OnCampusLearningLayout backHref="/dashboard/quizzes" isLoading>
        <div className="flex-1 flex items-center justify-center">
          <Text level="p" className="text-zinc-400">
            Loading quiz...
          </Text>
        </div>
      </OnCampusLearningLayout>
    );
  }

  if (gameState === "submitting") {
    return (
      <OnCampusLearningLayout backHref="/dashboard/quizzes" isLoading>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <LoadingSpinner height={10} width={10} />
            </div>
            <Text level="h1" className="text-zinc-100 font-bold text-lg">
              Submitting quiz...
            </Text>
            <Text level="p" className="text-zinc-500 text-sm mt-2">
              Please wait while we process your results
            </Text>
          </div>
        </div>
      </OnCampusLearningLayout>
    );
  }

  if (!currentQuestion) return null;

  const selectedAnswer = selectedAnswers[currentQuestionIndex];

  // ── Main quiz UI ──────────────────────────────────────────────────────────

  return (
    <OnCampusLearningLayout backHref="/dashboard" layoutMode="workspace">
      <div className="flex flex-col h-full w-full">
        {/* ── Scrollable content ── */}
        <div className="flex-1 w-full max-w-4xl mx-auto px-4 py-4 sm:pt-8 sm:pb-4 overflow-y-auto scrollbar-hide flex flex-col justify-start">
          <div className="relative">
            {/* gradient border */}
            <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-zinc-700/70 via-zinc-800/30 to-transparent pointer-events-none" />

            <div className="relative flex flex-col rounded-2xl border border-zinc-800 bg-zinc-900 overflow-hidden">
              {/* Header inside the panel exactly like QuizModal */}
              <div className="flex items-center justify-between px-4 sm:px-6 pt-3 pb-2 border-b border-zinc-800/60">
                <div className="flex items-center gap-2.5">
                  <Brain className="h-5 w-5 text-primary shrink-0" />
                  <div>
                    <span className="text-sm font-semibold text-zinc-100 tracking-tight leading-none block">
                      {quiz?.categoryName || "Quiz"}
                    </span>
                    <span className="text-xs font-medium text-zinc-500 mt-0.5 block">
                      Showing {total} Questions
                    </span>
                  </div>
                </div>

                {/* Back to quizzes button inside header like close button in QuizModal */}
                <button
                  onClick={() => router.push("/dashboard/quizzes")}
                  className="flex h-6 w-6 items-center justify-center rounded-lg text-zinc-500 ring-1 ring-zinc-800 hover:bg-zinc-800 hover:text-zinc-300 transition-all active:scale-95 shrink-0"
                  title="Back to Quizzes"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>

              {/* Progress inside the panel exactly like QuizModal but only one text line */}
              <div className="px-4 sm:px-6 pt-2.5 pb-0">
                <span className="text-xs font-semibold text-zinc-500">
                  Question {currentQuestionIndex + 1} of {total}
                </span>
              </div>

              {/* Question and Options Content exactly like QuizModal */}
              <div className="px-4 sm:px-6 py-3 flex-1">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentQuestionIndex}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.22, ease: "easeOut" }}
                  >
                    {/* Question text */}
                    <div className="mb-2.5 text-sm font-medium text-zinc-100 leading-relaxed">
                      <CodeRenderer
                        content={currentQuestion.question}
                        theme="dark"
                        className="max-w-none text-zinc-100 selection:bg-primary/30 [&_p]:m-0 [&_p]:leading-relaxed"
                      />
                    </div>

                    {/* Options */}
                    <div className="space-y-1.5">
                      {currentQuestion.options.map((opt, idx) => {
                        const isSelected = selectedAnswer === idx;

                        let rowClass =
                          "w-full flex items-center gap-3 rounded-xl px-4 py-1.5 text-xs text-left ring-1 transition-all duration-200 cursor-pointer ";

                        if (isSelected) {
                          rowClass +=
                            "bg-primary/10 ring-primary/40 text-primary";
                        } else {
                          rowClass +=
                            "bg-zinc-900 ring-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:ring-zinc-700 hover:text-zinc-100";
                        }

                        return (
                          <button
                            key={idx}
                            id={`quiz-option-${currentQuestionIndex}-${idx}`}
                            className={rowClass}
                            onClick={() => selectAnswer(idx)}
                          >
                            {/* Letter badge */}
                            <span
                              className={cn(
                                "flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[9px] font-bold ring-1 transition-all",
                                isSelected
                                  ? "bg-primary/20 ring-primary/50 text-primary"
                                  : "bg-zinc-800 ring-zinc-700 text-zinc-400",
                              )}
                            >
                              {String.fromCharCode(65 + idx)}
                            </span>

                            {/* Option text */}
                            <span className="flex-1 text-zinc-300 [&_p]:m-0 [&_p]:leading-normal leading-normal text-xs font-normal">
                              <CodeRenderer
                                content={cleanOptionText(opt)}
                                theme="dark"
                                className="max-w-none transition-transform text-xs font-normal [&_p]:m-0 [&_p]:leading-normal"
                              />
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* ── Footer ── */}
              <div className="flex items-center justify-center px-4 sm:px-6 py-2 border-t border-zinc-800/60 bg-zinc-950/20">
                <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-semibold tracking-wide">
                  <Zap className="h-3 w-3 text-primary/80 shrink-0 animate-pulse" />
                  AUTO-ADVANCING ON SELECTION
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </OnCampusLearningLayout>
  );
}
