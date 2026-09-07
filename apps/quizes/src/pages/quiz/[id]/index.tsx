import { useAuth } from "@tbe/auth";
import { LoadingSpinner } from "@tbe/components";
import { Card, CardContent, CardHeader } from "@tbe/components/quizes";
import { Progress } from "@tbe/components/quizes";
import { Layout } from "@tbe/components/quizes";
import { ProtectedRoute } from "@tbe/components/quizes";
import { CodeRenderer } from "@tbe/components/quizes";
import { useGamification } from "@tbe/hooks";
import { gamificationApi, quizApi } from "@tbe/services";
import type { QuizQuestion } from "@tbe/types";
import { cleanOptionText } from "@tbe/utils";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";

interface QuizCategory {
  _id: string;
  categoryName: string;
  categoryDescription: string;
  categoryIcon: string;
  questions: QuizQuestion[];
}

function QuizContent() {
  const router = useRouter();
  const { user } = useAuth();
  const quizId = router.query.id as string;
  const gamifiedAction = useGamification();

  const [quiz, setQuiz] = useState<QuizCategory | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{
    [key: number]: number;
  }>({});
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [questionTimes, setQuestionTimes] = useState<{
    [key: number]: number;
  }>({});
  const [gameState, setGameState] = useState<
    "loading" | "playing" | "completed" | "submitting"
  >("loading");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quizStartTime] = useState(Date.now());
  const [resolvedUserId, setResolvedUserId] = useState<string | null>(null);

  // Helper: Mongo ObjectId check
  const isMongoObjectId = (val?: string): boolean => {
    if (!val) return false;
    return /^[a-fA-F0-9]{24}$/.test(val);
  };

  // Helper: Resolve Google ID to MongoDB user ID
  const resolveGoogleIdToMongoId = async (
    googleId: string,
    email: string,
    sessionData?: any,
  ): Promise<string | null> => {
    try {
      // First try to get user by email
      const base = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
      const response = await fetch(
        `${base}/user?email=${encodeURIComponent(email)}`,
        { credentials: "include" },
      );
      const data = await response.json();

      if (data?.success && data?.data?._id && isMongoObjectId(data.data._id)) {
        return data.data._id;
      }

      // If not found by email, try to create user or get by Google ID
      const createResponse = await fetch(`${base}/user`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: sessionData?.user?.name || "User",
          email,
          googleId,
          image: sessionData?.user?.image || "",
        }),
      });

      const createData = await createResponse.json();

      if (
        createData?.success &&
        createData?.data?._id &&
        isMongoObjectId(createData.data._id)
      ) {
        return createData.data._id;
      }

      return null;
    } catch (error) {
      return null;
    }
  };

  // Resolve MongoDB userId once
  useEffect(() => {
    const resolveUserId = async () => {
      if (!user?.email && !user?.id) return;
      try {
        if (isMongoObjectId(user?.id)) {
          setResolvedUserId(user!.id);
          return;
        }
        // Fallback: fetch by email to get _id
        const base = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
        const resp = await fetch(
          `${base}/user?email=${encodeURIComponent(user!.email!)}`,
          { credentials: "include" },
        );
        const json = await resp.json();
        const dbId = json?.data?._id;
        if (isMongoObjectId(dbId)) {
          setResolvedUserId(dbId);
        }
      } catch (_e) {
        // ignore
      }
    };

    if (user && !resolvedUserId) {
      void resolveUserId();
    }
  }, [user?.id, user?.email]); // Remove resolvedUserId from dependencies

  const loadQuiz = useCallback(async () => {
    try {
      const response = await quizApi.getQuestions(quizId);

      if (response.success) {
        setQuiz(response.data);
        setGameState("playing");
      } else {
        throw new Error(response.message || "Failed to load quiz");
      }
    } catch (error) {
      alert("Failed to load quiz. Please try again.");
    }
  }, [quizId]);

  useEffect(() => {
    loadQuiz();
  }, [quizId, loadQuiz]);

  useEffect(() => {
    if (gameState === "playing") {
      setQuestionStartTime(Date.now());
    }
  }, [currentQuestionIndex, gameState]);

  const selectAnswer = (answerIndex: number) => {
    // Record time spent on current question
    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
    setQuestionTimes((prev) => ({
      ...prev,
      [currentQuestionIndex]: timeSpent,
    }));

    // Save the selected answer
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: answerIndex,
    }));

    // Auto-navigate to next question or complete quiz

    if (
      isSubmitting ||
      gameState === "submitting" ||
      gameState === "completed"
    ) {
      return;
    }

    if (currentQuestionIndex < (quiz?.questions.length || 0) - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      completeQuiz();
    }
  };

  const completeQuiz = async () => {
    // Prevent duplicate submissions
    if (
      isSubmitting ||
      gameState === "submitting" ||
      gameState === "completed"
    ) {
      return;
    }

    // Set submitting state immediately
    setIsSubmitting(true);
    setGameState("submitting");

    // Try to get user ID from multiple sources
    const effectiveUserId = user?.id || (user as any)?._id || resolvedUserId;

    if (!quiz || !effectiveUserId) {
      // Try to get user data from session directly as fallback
      try {
        const sessionResponse = await fetch("/api/auth/session");
        const sessionData = await sessionResponse.json();

        if (sessionData?.user?.id) {
          // Check if it's already a MongoDB ID or needs resolution
          if (isMongoObjectId(sessionData.user.id)) {
            await submitQuizWithUserId(sessionData.user.id);
            return;
          } else {
            // Resolve Google ID to MongoDB user ID
            const mongoUserId = await resolveGoogleIdToMongoId(
              sessionData.user.id,
              sessionData.user.email,
              sessionData,
            );
            if (mongoUserId) {
              await submitQuizWithUserId(mongoUserId);
              return;
            }
          }
        }
      } catch (error) {}

      // Reset state on error
      setIsSubmitting(false);
      setGameState("playing");
      return;
    }

    await submitQuizWithUserId(effectiveUserId);
  };

  const submitQuizWithUserId = async (userId: string) => {
    try {
      const totalTimeSpent = Math.floor((Date.now() - quizStartTime) / 1000);

      const answers = quiz!.questions.map((question, index) => {
        const selectedAnswer = selectedAnswers[index] ?? -1;
        const isCorrect = selectedAnswer === question.correctAnswer;
        const timeSpent = questionTimes[index] || 0;

        return {
          questionIndex: index,
          selectedAnswer,
          isCorrect,
          timeSpent,
        };
      });

      // Check if userId is a valid Mongo ObjectId
      if (!isMongoObjectId(userId)) {
      }

      const submission = {
        userId,
        answers,
        totalTimeSpent,
      };

      const response = await quizApi.submitQuiz(quizId, submission);

      // Type guard to check if response has the expected structure
      if (
        response &&
        typeof response === "object" &&
        "success" in response &&
        response.success &&
        "data" in response
      ) {
        // Trigger gamification action for completing quiz (don't await to speed up)
        gamificationApi
          .updateuserGamificationPoints({
            userId,
            actionType: "COMPLETE_QUIZ",
          })
          .catch(() => {}); // Ignore errors

        // Redirect immediately using window.location for instant navigation
        const answersParam = JSON.stringify(
          answers.map((a) => a.selectedAnswer),
        );
        const timeTakenParam = totalTimeSpent.toString();

        window.location.href = `/results/${quizId}?answers=${encodeURIComponent(answersParam)}&timeTaken=${timeTakenParam}`;
      } else {
        const message =
          response &&
          typeof response === "object" &&
          "message" in response &&
          typeof response.message === "string"
            ? response.message
            : "Failed to submit quiz";
        throw new Error(message);
      }
    } catch (error) {
      // Even on error, redirect to results with local data immediately

      const fallbackAnswers = quiz!.questions.map((question, index) => {
        const selectedAnswer = selectedAnswers[index] ?? -1;
        return selectedAnswer;
      });
      const fallbackTimeSpent = Math.floor((Date.now() - quizStartTime) / 1000);

      const answersParam = JSON.stringify(fallbackAnswers);
      const timeTakenParam = fallbackTimeSpent.toString();

      // Use window.location for instant redirect
      window.location.href = `/results/${quizId}?answers=${encodeURIComponent(answersParam)}&timeTaken=${timeTakenParam}`;
    }
  };

  if (gameState === "loading") {
    return (
      <Layout showNavbar>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <LoadingSpinner label="Loading quiz..." />
        </div>
      </Layout>
    );
  }

  if (gameState === "submitting") {
    return (
      <Layout showNavbar>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <LoadingSpinner label="Submitting quiz..." />
        </div>
      </Layout>
    );
  }

  if (!quiz || gameState !== "playing") {
    return null;
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const selectedAnswer = selectedAnswers[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  return (
    <Layout showNavbar={gameState !== "playing"}>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Quiz Header */}
          <div className="max-w-4xl mx-auto mb-8">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-gray-900">
                {quiz.categoryName}
              </h1>
              <p className="text-lg text-gray-600">
                Question {currentQuestionIndex + 1} of {quiz.questions.length}
              </p>
            </div>

            {/* Progress */}
            <div className="mb-8">
              <Progress value={progress} className="h-3" />
              <div className="flex justify-between text-sm text-gray-500 mt-2">
                <span>{Math.round(progress)}% Complete</span>
                <span>{quiz.categoryName}</span>
              </div>
            </div>
          </div>

          {/* Question Card */}
          <div className="max-w-4xl mx-auto">
            <Card className="shadow-lg">
              <CardHeader className="bg-white">
                <div className="text-2xl leading-relaxed text-gray-900">
                  <CodeRenderer content={currentQuestion.question} />
                </div>
              </CardHeader>

              <CardContent className="bg-white p-8 space-y-6">
                {/* Options */}
                {currentQuestion.options.map((option, index) => (
                  <div
                    key={index}
                    onClick={() => selectAnswer(index)}
                    className={`p-6 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                      selectedAnswer === index
                        ? "border-[#ef4444] bg-[#ef4444]/10"
                        : "border-gray-200 hover:border-[#ef4444]/50 hover:bg-[#ef4444]/5"
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-lg font-medium ${
                          selectedAnswer === index
                            ? "border-[#ef4444] bg-[#ef4444] text-white"
                            : "border-gray-300 text-gray-500"
                        }`}
                      >
                        {String.fromCharCode(65 + index)}
                      </div>

                      <div className="flex-1 text-lg min-w-0 overflow-hidden">
                        <CodeRenderer content={cleanOptionText(option)} />
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default function QuizPage() {
  return (
    <ProtectedRoute>
      <QuizContent />
    </ProtectedRoute>
  );
}

// Disable static generation for this dynamic route
export async function getStaticPaths() {
  return {
    paths: [],
    fallback: "blocking",
  };
}

export async function getStaticProps() {
  return {
    props: {},
    revalidate: 1, // ISR: revalidate every second
  };
}
