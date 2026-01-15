import { useAuth } from "@tbe/auth";
import { quizApi, gamificationApi } from "@tbe/services";
import { config } from "@tbe/config/quizes";
import { Button } from "@tbe/components";
import { CodeRenderer } from "@tbe/components/quizes";
import type { QuizQuestionsData, QuizQuestion } from "@tbe/types";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";

type GameState = "loading" | "playing" | "submitting";

const isMongoObjectId = (val?: string): boolean => {
  if (!val) return false;
  return /^[a-fA-F0-9]{24}$/.test(val);
};

const resolveUserIdToMongoId = async (user: { id?: string; email?: string; name?: string; image?: string } | null) => {
  const candidateId = user?.id;
  if (candidateId && isMongoObjectId(candidateId)) return candidateId;
  if (!user?.email) return null;

  const base = (config.API_BASE_URL || "").replace(/\/$/, "");

  try {
    const resp = await fetch(`${base}/user?email=${encodeURIComponent(user.email)}`);
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
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [questionTimes, setQuestionTimes] = useState<Record<number, number>>({});
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
      const response = await quizApi.getQuestions(quizId);
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
  const currentQuestion: QuizQuestion | undefined = questions[currentQuestionIndex];
  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;

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
          .updateuserGamificationPoints({ userId: mongoUserId, actionType: "COMPLETE_QUIZ" } as any)
          .catch(() => { });
      }
    } catch {
      // ignore submit errors, still show local results
    } finally {
      const answersParam = encodeURIComponent(JSON.stringify(answersPayload.map((a) => a.selectedAnswer)));
      router.replace(`/results/${quizId}?answers=${answersParam}&timeTaken=${totalTimeSpent}`);
    }
  }, [quizId, quiz, user, quizStartTime, questions, selectedAnswers, questionTimes, router]);

  const selectAnswer = (answerIndex: number) => {
    if (!quiz || !currentQuestion) return;
    if (gameState !== "playing") return;

    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
    setQuestionTimes((prev) => ({ ...prev, [currentQuestionIndex]: timeSpent }));
    setSelectedAnswers((prev) => ({ ...prev, [currentQuestionIndex]: answerIndex }));

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      void submitQuiz();
    }
  };

  if (gameState === "loading") {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-gray-300">Loading quiz...</div>
      </div>
    );
  }

  if (gameState === "submitting") {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-center">
          <div className="text-white font-semibold">Submitting quiz...</div>
          <div className="text-gray-400 text-sm mt-2">Please wait while we process your results</div>
        </div>
      </div>
    );
  }

  if (!quiz || !currentQuestion) return null;

  const selectedAnswer = selectedAnswers[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[#0A0A0A]/90 backdrop-blur border-b border-gray-800">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.push("/dashboard/quizzes")}
            className="flex items-center gap-2 text-gray-300 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <div className="text-right">
            <div className="text-sm text-gray-400">Progress</div>
            <div className="text-xs text-gray-500">
              Question {currentQuestionIndex + 1} of {questions.length}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Quiz Title */}
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-white">{quiz.categoryName}</h1>
          <p className="text-gray-400 mt-2">{quiz.categoryDescription}</p>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#FF5757] transition-all"
              style={{ width: `${Math.round(progress)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>{Math.round(progress)}% complete</span>
            <span>{quiz.categoryIcon}</span>
          </div>
        </div>

        {/* Question */}
        <div className="border border-gray-800 rounded-xl bg-[#0F0F0F]">
          <div className="p-6 border-b border-gray-800">
            <div className="text-white text-lg leading-relaxed">
              <CodeRenderer content={currentQuestion.question} theme="dark" className="max-w-none" />
            </div>
          </div>

          {/* Options */}
          <div className="p-4 space-y-2">
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => selectAnswer(index)}
                  className={[
                    "w-full text-left px-1 py-1 rounded-lg border transition-all flex items-center",
                    isSelected
                      ? "border-[#FF5757] bg-[#FF5757]/10"
                      : "border-gray-800 hover:border-[#FF5757] hover:bg-[#FF5757]/5",
                  ].join(" ")}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={[
                        " w-7 h-7 rounded-full border flex items-center justify-center text-sm font-semibold flex-shrink-0",
                        isSelected ? "border-[#FF5757] bg-[#FF5757] text-white" : "border-gray-700 text-gray-300",
                      ].join(" ")}
                    >
                      {String.fromCharCode(65 + index)}
                    </div>
                    <div className="ml-3 flex-1 text-primary flex items-center">
                      <CodeRenderer content={option} theme="dark" className="max-w-none" />
                    </div>
                    {isSelected && <CheckCircle2 className="w-5 h-5 text-[#FF5757] ml-3 flex-shrink-0" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-gray-500">
          Selecting an option will auto-advance to the next question.
        </div>

        <div className="mt-6 flex justify-center">
          <Button
            variant="OUTLINE"
            className="border-gray-700 text-white hover:bg-gray-800"
            text="Restart Quiz"
            onClick={() => router.replace(`/quiz/${quizId}`)}
          />
        </div>
      </div>
    </div>
  );
}

