import { useAuth } from "@tbe/auth";
import { MarkdownRenderer } from "@tbe/components/quizes";
import { config } from "@tbe/config/quizes";
import { quizApi } from "@tbe/services";
import type { QuizQuestion,QuizQuestionsData } from "@tbe/types";
import { cleanOptionText } from "@tbe/utils";
import { ArrowLeft, Clock, Target, Trophy } from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useMemo, useRef, useState } from "react";

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

export default function ResultsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  const quizId = router.query.id as string | undefined;
  const answersParam = router.query.answers as string | undefined;
  const timeTakenParam = router.query.timeTaken as string | undefined;

  const [quiz, setQuiz] = useState<QuizQuestionsData | null>(null);
  const [loadingQuiz, setLoadingQuiz] = useState(true);

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
        const response = await quizApi.getQuestions(quizId);
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

  // Submit attempt once (best-effort)
  const hasSubmittedRef = useRef(false);
  useEffect(() => {
    const submitAttempt = async () => {
      if (hasSubmittedRef.current) return;
      if (!quizId || answers.length === 0) return;
      const mongoUserId = await resolveUserIdToMongoId(user);
      if (!mongoUserId) return;

      hasSubmittedRef.current = true;
      try {
        await quizApi.submitAttempt(quizId, {
          userId: mongoUserId,
          answers,
          timeTaken,
        });
      } catch {
        hasSubmittedRef.current = false; // allow retry on refresh
      }
    };

    void submitAttempt();
  }, [quizId, answers, timeTaken, user]);

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
    <div className="min-h-screen bg-[#0A0A0A]">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[#0A0A0A]/90 backdrop-blur border-b border-gray-800">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <button
            type="button"
            onClick={() => router.push("/dashboard/quizzes")}
            className="flex items-center gap-2 text-gray-300 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Quizes
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Summary */}
        <div className="bg-[#0F0F0F] border border-gray-800 rounded-xl p-6 md:p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Quiz Complete!</h1>
            <p className="text-gray-400">
              {quiz.categoryIcon} {quiz.categoryName}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-lg border border-gray-800 bg-[#0A0A0A] p-5 text-center">
              <div className="flex items-center justify-center mb-3">
                <Trophy className="w-7 h-7 text-[#FF5757]" />
              </div>
              <div className="text-3xl font-bold text-white">{percentage}%</div>
              <div className="text-sm text-gray-400">Score</div>
            </div>

            <div className="rounded-lg border border-gray-800 bg-[#0A0A0A] p-5 text-center">
              <div className="flex items-center justify-center mb-3">
                <Target className="w-7 h-7 text-[#FF5757]" />
              </div>
              <div className="text-3xl font-bold text-white">
                {score}/{totalQuestions}
              </div>
              <div className="text-sm text-gray-400">Correct Answers</div>
            </div>

            <div className="rounded-lg border border-gray-800 bg-[#0A0A0A] p-5 text-center">
              <div className="flex items-center justify-center mb-3">
                <Clock className="w-7 h-7 text-[#FF5757]" />
              </div>
              <div className="text-3xl font-bold text-white">
                {Math.floor(timeTaken / 60)}:{String(timeTaken % 60).padStart(2, "0")}
              </div>
              <div className="text-sm text-gray-400">Time Taken</div>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => router.push(`/quiz/${quizId}`)}
              className="flex-1 bg-[#FF5757] text-white py-3 px-6 rounded-lg font-semibold hover:bg-[#FF5757]/90 transition-colors"
            >
              Try Again
            </button>
            <button
              type="button"
              onClick={() => router.push("/dashboard/quizzes")}
              className="flex-1 border border-[#FF5757] text-[#FF5757] py-3 px-6 rounded-lg font-semibold hover:bg-[#FF5757]/10 transition-colors"
            >
              Back to Quizes
            </button>
          </div>
        </div>

        {/* Review */}
        <div className="bg-[#0F0F0F] border border-gray-800 rounded-xl p-6 md:p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Question Review</h2>

          <div className="space-y-6">
            {questions.map((question, index) => {
              const userAnswer = answers[index];
              const isCorrect = userAnswer === question.correctAnswer;

              return (
                <div
                  key={question._id || index}
                  className={[
                    "border rounded-xl p-5",
                    isCorrect ? "border-green-700/50 bg-green-900/10" : "border-red-700/50 bg-red-900/10",
                  ].join(" ")}
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <h3 className="text-white font-semibold">Question {index + 1}</h3>
                    <span
                      className={[
                        "px-3 py-1 rounded-full text-xs font-semibold",
                        isCorrect ? "bg-green-900/30 text-green-300" : "bg-red-900/30 text-red-300",
                      ].join(" ")}
                    >
                      {isCorrect ? "Correct" : "Incorrect"}
                    </span>
                  </div>

                  <div className="mb-4">
                    <MarkdownRenderer content={question.question} theme="dark" className="text-gray-100" />
                  </div>

                  <div className="space-y-2 mb-4">
                    {question.options.map((option, optionIndex) => {
                      const isAnswerCorrect = optionIndex === question.correctAnswer;
                      const isUserPicked = optionIndex === userAnswer;

                      const style =
                        isAnswerCorrect
                          ? "border-green-600/60 bg-green-900/20"
                          : isUserPicked && !isCorrect
                            ? "border-red-600/60 bg-red-900/20"
                            : "border-gray-800 bg-[#0A0A0A]";

                      return (
                        <div key={optionIndex} className={`p-3 rounded-lg border ${style}`}>
                          <div className="flex items-start gap-2">
                            <span className="font-semibold text-gray-200 mt-0.5">
                              {String.fromCharCode(65 + optionIndex)}.
                            </span>
                            <div className="flex-1">
                              <MarkdownRenderer content={cleanOptionText(option)} theme="dark" className="text-gray-100" />
                            </div>
                          </div>

                          {isAnswerCorrect && (
                            <div className="mt-2 text-green-300 text-sm font-semibold">✓ Correct Answer</div>
                          )}
                          {isUserPicked && !isCorrect && (
                            <div className="mt-2 text-red-300 text-sm font-semibold">✗ Your Answer</div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="rounded-lg border border-gray-800 bg-[#0A0A0A] p-4">
                    <h4 className="text-white font-semibold mb-2">Explanation</h4>
                    <MarkdownRenderer content={question.explanation} theme="dark" className="text-gray-100" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

