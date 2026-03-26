import { useAuth } from "@tbe/auth";
import { LearningEnvironmentLayout, Text } from "@tbe/components";
import { CodeRenderer } from "@tbe/components/quizes";
import { config } from "@tbe/config/quizes";
import { gamificationApi, quizApi } from "@tbe/services";
import type { QuizQuestion, QuizQuestionsData } from "@tbe/types";
import { cleanOptionText } from "@tbe/utils";
import { cn } from "@tbe/utils";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type GameState = "loading" | "playing" | "submitting";

const isMongoObjectId = (val?: string): boolean => {
  if (!val) return false;
  return /^[a-fA-F0-9]{24}$/.test(val);
};

const resolveUserIdToMongoId = async (
  user: { id?: string; email?: string; name?: string; image?: string } | null,
) => {
  const candidateId = user?.id;
  if (candidateId && isMongoObjectId(candidateId)) return candidateId;
  if (!user?.email) return null;

  const base = (config.API_BASE_URL || "").replace(/\/$/, "");

  try {
    const resp = await fetch(
      `${base}/user?email=${encodeURIComponent(user.email)}`,
    );
    const json = await resp.json();
    const dbId = json?.data?._id;
    if (isMongoObjectId(dbId)) return dbId;
  } catch {
    // ignore and try create below
  }

  try {
    const createResp = await fetch(`${base}/user`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: user?.name || "User",
        email: user.email,
        googleId: user?.id || "",
        image: user?.image || "",
      }),
    });
    const createJson = await createResp.json();
    const createdId = createJson?.data?._id;
    if (isMongoObjectId(createdId)) return createdId;
  } catch {
    // ignore
  }

  return null;
};

export default function QuizPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const quizId = router.query.id as string | undefined;

  const [quiz, setQuiz] = useState<QuizQuestionsData | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<number, number>
  >({});
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [questionTimes, setQuestionTimes] = useState<Record<number, number>>(
    {},
  );
  const [gameState, setGameState] = useState<GameState>("loading");
  const [quizStartTime] = useState(Date.now());
  const hasSubmittedRef = useRef(false);

  // Auth guard (non-dashboard route)
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

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
  const progress =
    questions.length > 0
      ? ((currentQuestionIndex + 1) / questions.length) * 100
      : 0;

  const submitQuiz = useCallback(async () => {
    if (!quizId || !quiz || hasSubmittedRef.current) return;
    hasSubmittedRef.current = true;
    setGameState("submitting");

    const mongoUserId = await resolveUserIdToMongoId(user);

    const totalTimeSpent = Math.floor((Date.now() - quizStartTime) / 1000);
    const answersPayload = questions.map((q, index) => {
      const selectedAnswer = selectedAnswers[index] ?? -1;
      const isCorrect = selectedAnswer === q.correctAnswer;
      const timeSpent = questionTimes[index] || 0;
      return { questionIndex: index, selectedAnswer, isCorrect, timeSpent };
    });

    try {
      if (mongoUserId) {
        await quizApi.submitQuiz(quizId, {
          userId: mongoUserId,
          answers: answersPayload,
          totalTimeSpent,
        });

        // gamification: best-effort
        gamificationApi
          .updateuserGamificationPoints({
            userId: mongoUserId,
            actionType: "COMPLETE_QUIZ",
          } as any)
          .catch(() => {});
      }
    } catch {
      // ignore submit errors, still show local results
    } finally {
      const answersParam = encodeURIComponent(
        JSON.stringify(answersPayload.map((a) => a.selectedAnswer)),
      );
      router.replace(
        `/results/${quizId}?answers=${answersParam}&timeTaken=${totalTimeSpent}`,
      );
    }
  }, [
    quizId,
    quiz,
    user,
    quizStartTime,
    questions,
    selectedAnswers,
    questionTimes,
    router,
  ]);

  const selectAnswer = (answerIndex: number) => {
    if (!quiz || !currentQuestion) return;
    if (gameState !== "playing") return;

    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
    setQuestionTimes((prev) => ({
      ...prev,
      [currentQuestionIndex]: timeSpent,
    }));
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: answerIndex,
    }));

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      void submitQuiz();
    }
  };

  if (gameState === "loading") {
    return (
      <LearningEnvironmentLayout backHref="/dashboard/quizzes" isLoading>
        <div className="flex-1 flex items-center justify-center">
          <Text level="p" className="text-gray-400">
            Loading quiz...
          </Text>
        </div>
      </LearningEnvironmentLayout>
    );
  }

  if (gameState === "submitting") {
    return (
      <LearningEnvironmentLayout backHref="/dashboard/quizzes" isLoading>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            {/* Animated Spinner */}
            <div className="flex justify-center mb-6">
              <div className="relative w-10 h-10">
                <div className="absolute inset-0 border-4 border-gray-800 rounded-full" />
                <div className="absolute inset-0 border-4 border-transparent border-t-red-500 rounded-full animate-spin" />
              </div>
            </div>
            <Text level="h1" className="text-white font-bold text-lg">
              Submitting quiz...
            </Text>
            <Text level="p" className="text-gray-400 text-sm mt-2">
              Please wait while we process your results
            </Text>
          </div>
        </div>
      </LearningEnvironmentLayout>
    );
  }

  const selectedAnswer = selectedAnswers[currentQuestionIndex];

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
                {quiz?.categoryName || "Quiz"}
              </Text>
              <Text
                level="p"
                className="text-[8px] font-bold text-gray-500 uppercase tracking-widest leading-none bg-gray-900/50 px-2 py-0.5 rounded border border-gray-800"
              >
                Question {currentQuestionIndex + 1} of {questions.length}
              </Text>
            </div>

            {/* Right-aligned Progress Tracker */}
            <div className="flex-1 flex justify-end items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-end mr-1">
                  <Text
                    level="p"
                    className="text-[8px] font-bold text-gray-500 uppercase tracking-wider"
                  >
                    Progress
                  </Text>
                  <Text
                    level="p"
                    className="text-[13px] font-black text-white leading-none mt-0.5"
                  >
                    {Math.round(
                      ((currentQuestionIndex + 1) / questions.length) * 100,
                    )}
                    %
                  </Text>
                </div>
                <div className="w-20 h-1 bg-gray-900 border border-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)] transition-all duration-500"
                    style={{
                      width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 w-full max-w-6xl mx-auto px-4 py-8 md:py-12 overflow-y-auto scrollbar-hide">
          <div className="flex flex-col gap-3">
            {/* Question Card */}
            <div className="bg-[#0A0A0A] border border-gray-800 rounded-xl overflow-hidden shadow-2xl transition-all duration-300">
              <div className="p-4 md:p-5 border-b border-gray-800/50">
                <div className="text-white text-[15px] leading-relaxed font-semibold">
                  <CodeRenderer
                    content={currentQuestion.question}
                    theme="dark"
                    className="max-w-none text-white selection:bg-red-500/30"
                  />
                </div>
              </div>

              {/* Options List */}
              <div className="p-3 md:p-4 bg-black/10">
                <div className="grid grid-cols-1 gap-1.5">
                  {currentQuestion.options.map((option, index) => {
                    const isSelected = selectedAnswer === index;
                    return (
                      <button
                        key={index}
                        type="button"
                        onClick={() => selectAnswer(index)}
                        className={cn(
                          "group w-full text-left py-2 px-3 rounded-lg border transition-all duration-300 flex items-center relative overflow-hidden",
                          isSelected
                            ? "border-red-500/50 bg-red-500/5 shadow-[0_0_10px_rgba(239,68,68,0.02)]"
                            : "border-gray-800/60 bg-transparent hover:border-gray-700 hover:bg-white/[0.02]",
                        )}
                      >
                        <div className="flex items-center gap-3 w-full">
                          <div
                            className={cn(
                              "w-6 h-6 rounded-md border flex items-center justify-center text-[10px] font-black shrink-0 transition-all duration-300",
                              isSelected
                                ? "border-red-500 bg-red-500 text-white shadow-[0_0_10px_rgba(239,68,68,0.4)]"
                                : "border-gray-700 bg-[#111] text-gray-500 group-hover:border-gray-500 group-hover:text-gray-200",
                            )}
                          >
                            {String.fromCharCode(65 + index)}
                          </div>

                          <div
                            className={cn(
                              "flex-1 text-[14px] font-medium leading-tight",
                              isSelected
                                ? "text-white font-bold"
                                : "text-gray-400",
                            )}
                          >
                            <CodeRenderer
                              content={cleanOptionText(option)}
                              theme="dark"
                              className="max-w-none transition-transform"
                            />
                          </div>

                          <div
                            className={cn(
                              "shrink-0 transition-all duration-300 transform",
                              isSelected
                                ? "opacity-100 scale-100"
                                : "opacity-0 scale-50",
                            )}
                          >
                            <CheckCircle2 className="w-4 h-4 text-red-500" />
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-gray-500">
              <div className="h-px w-8 bg-gray-800" />
              <Text
                level="p"
                className="text-[11px] font-bold uppercase tracking-widest text-gray-600"
              >
                Auto-advancing on selection
              </Text>
              <div className="h-px w-8 bg-gray-800" />
            </div>
          </div>
        </div>
      </div>
    </LearningEnvironmentLayout>
  );
}
