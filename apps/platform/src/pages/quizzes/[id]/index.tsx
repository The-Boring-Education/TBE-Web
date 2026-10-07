import { ProtectedRoute, useAuth } from '@tbe/auth';
import { LoadingSpinner } from '@tbe/components';
import {
  Card,
  CardContent,
  CardHeader,
  CodeRenderer,
  Progress,
} from '@tbe/components/quizes';
import { quizApi } from '@tbe/services';
import type { QuizQuestion } from '@tbe/types';
import { cleanOptionText } from '@tbe/utils';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

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
    'loading' | 'playing' | 'completed' | 'submitting'
  >('loading');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quizStartTime] = useState(Date.now());
  const [resolvedUserId, setResolvedUserId] = useState<string | null>(null);

  const isMongoObjectId = (val?: string): boolean => {
    if (!val) return false;
    return /^[a-fA-F0-9]{24}$/.test(val);
  };

  const resolveGoogleIdToMongoId = async (
    googleId: string,
    email: string,
    sessionData?: any,
  ): Promise<string | null> => {
    try {
      const response = await fetch(
        `/api/proxy/user?email=${encodeURIComponent(email)}`,
      );
      const data = await response.json();

      if (data?.success && data?.data?._id && isMongoObjectId(data.data._id)) {
        return data.data._id;
      }

      const createResponse = await fetch(`/api/proxy/user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: sessionData?.user?.name || 'User',
          email,
          googleId,
          image: sessionData?.user?.image || '',
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
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const resolveUserId = async () => {
      if (user?.id && isMongoObjectId(user.id)) {
        setResolvedUserId(user.id);
        return;
      }

      const effectiveId = user?.id || (user as any)?._id;
      if (effectiveId && isMongoObjectId(effectiveId)) {
        setResolvedUserId(effectiveId);
        return;
      }

      if (user?.id && user?.email && !isMongoObjectId(user.id)) {
        const mongoId = await resolveGoogleIdToMongoId(user.id, user.email);
        if (mongoId) {
          setResolvedUserId(mongoId);
        }
      }
    };

    if (user) {
      resolveUserId();
    }
  }, [user]);

  // Load quiz data
  useEffect(() => {
    const loadQuiz = async () => {
      if (!quizId) return;

      try {
        setGameState('loading');
        const response = await quizApi.getQuestions(quizId);

        if (response.success && response.data) {
          const quizData: QuizCategory = {
            _id: response.data._id || quizId,
            categoryName: response.data.categoryName || 'Technical Assessment',
            categoryDescription: response.data.categoryDescription || '',
            categoryIcon: response.data.categoryIcon || '💡',
            questions: response.data.questions || [],
          };

          setQuiz(quizData);
          setGameState('playing');
          setQuestionStartTime(Date.now());
        } else {
          router.push('/quizzes/dashboard');
        }
      } catch (error) {
        console.error('Failed to load quiz questions:', error);
        router.push('/quizzes/dashboard');
      }
    };

    loadQuiz();
  }, [quizId, router]);

  const selectAnswer = (answerIndex: number) => {
    if (selectedAnswer !== undefined || isSubmitting) return;

    const timeSpentOnQuestion = Math.round(
      (Date.now() - questionStartTime) / 1000,
    );
    setQuestionTimes((prev) => ({
      ...prev,
      [currentQuestionIndex]: timeSpentOnQuestion,
    }));

    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: answerIndex,
    }));

    setTimeout(() => {
      if (quiz && currentQuestionIndex < quiz.questions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
        setQuestionStartTime(Date.now());
      } else {
        completeQuiz();
      }
    }, 800);
  };

  const completeQuiz = async () => {
    if (
      isSubmitting ||
      gameState === 'submitting' ||
      gameState === 'completed'
    ) {
      return;
    }

    setIsSubmitting(true);
    setGameState('submitting');

    const effectiveUserId = user?.id || (user as any)?._id || resolvedUserId;

    if (!quiz || !effectiveUserId) {
      try {
        const sessionResponse = await fetch('/api/auth/session');
        const sessionData = await sessionResponse.json();

        if (sessionData?.user?.id) {
          if (isMongoObjectId(sessionData.user.id)) {
            await submitQuizWithUserId(sessionData.user.id);
            return;
          } else {
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
      } catch {}

      setIsSubmitting(false);
      setGameState('playing');
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

      const submission = {
        userId,
        answers,
        totalTimeSpent,
      };

      const response = await quizApi.submitQuiz(quizId, submission);

      if (
        response &&
        typeof response === 'object' &&
        'success' in response &&
        response.success &&
        'data' in response
      ) {
        const answersParam = JSON.stringify(
          answers.map((a) => a.selectedAnswer),
        );
        const timeTakenParam = totalTimeSpent.toString();

        router.push(
          `/quizzes/results/${quizId}?answers=${encodeURIComponent(
            answersParam,
          )}&timeTaken=${timeTakenParam}`,
        );
      } else {
        // Fallback redirection to results even if submit error
        const answersParam = JSON.stringify(
          answers.map((a) => a.selectedAnswer),
        );
        const timeTakenParam = totalTimeSpent.toString();
        router.push(
          `/quizzes/results/${quizId}?answers=${encodeURIComponent(
            answersParam,
          )}&timeTaken=${timeTakenParam}`,
        );
      }
    } catch (error) {
      console.error('Submission error:', error);
      const totalTimeSpent = Math.floor((Date.now() - quizStartTime) / 1000);
      const answersParam = JSON.stringify(
        quiz!.questions.map((_, index) => selectedAnswers[index] ?? -1),
      );
      router.push(
        `/quizzes/results/${quizId}?answers=${encodeURIComponent(
          answersParam,
        )}&timeTaken=${totalTimeSpent}`,
      );
    }
  };

  if (gameState === 'loading' || !quiz) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <LoadingSpinner label='Preparing your quiz questions...' />
      </div>
    );
  }

  if (gameState === 'submitting' || isSubmitting) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <LoadingSpinner label='Submitting your answers and computing results...' />
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  if (!currentQuestion) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <p className='text-gray-600 mb-4'>No questions found in this quiz.</p>
          <button
            onClick={() => router.push('/quizzes/dashboard')}
            className='px-6 py-2.5 bg-primary text-white rounded-lg font-medium'
          >
            Back to Quizzes
          </button>
        </div>
      </div>
    );
  }

  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;
  const selectedAnswer = selectedAnswers[currentQuestionIndex];

  return (
    <div className='min-h-screen bg-gray-50 py-8'>
      <div className='container mx-auto px-4 sm:px-6 max-w-4xl'>
        {/* Navigation back */}
        <div className='mb-4'>
          <button
            onClick={() => router.push('/quizzes/dashboard')}
            className='inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors cursor-pointer text-sm font-medium'
          >
            <ArrowLeft className='w-4 h-4' />
            <span>Back to Quizzes</span>
          </button>
        </div>

        {/* Header with Title and Progress */}
        <div className='mb-6'>
          <div className='flex items-center justify-between mb-3'>
            <h1 className='text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2'>
              <span>{quiz.categoryIcon}</span>
              <span>{quiz.categoryName}</span>
            </h1>
            <span className='text-sm font-semibold text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200'>
              Question {currentQuestionIndex + 1} of {quiz.questions.length}
            </span>
          </div>

          {/* Progress Bar */}
          <div className='space-y-1'>
            <Progress value={progress} className='h-2.5 bg-gray-200' />
            <div className='flex justify-between text-xs text-gray-500'>
              <span>{Math.round(progress)}% Complete</span>
              <span>Keep going!</span>
            </div>
          </div>
        </div>

        {/* Question Card */}
        <Card className='shadow-sm border border-gray-200 bg-white rounded-2xl overflow-hidden mb-6'>
          <CardHeader className='bg-white border-b border-gray-100 p-6 sm:p-8'>
            <div className='text-lg sm:text-xl leading-relaxed text-gray-900 font-medium'>
              <CodeRenderer content={currentQuestion.question} />
            </div>
          </CardHeader>

          <CardContent className='bg-white p-6 sm:p-8 space-y-4'>
            {/* Options */}
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              return (
                <div
                  key={index}
                  onClick={() => selectAnswer(index)}
                  className={`p-5 rounded-xl border-2 cursor-pointer transition-all duration-150 ${
                    isSelected
                      ? 'border-primary bg-primary/5 text-gray-900 shadow-xs'
                      : 'border-gray-200 hover:border-primary/40 hover:bg-gray-50 text-gray-800'
                  }`}
                >
                  <div className='flex items-center space-x-4'>
                    <div
                      className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center text-sm font-bold shrink-0 transition-colors ${
                        isSelected
                          ? 'border-primary bg-primary text-white'
                          : 'border-gray-300 text-gray-600 bg-white'
                      }`}
                    >
                      {String.fromCharCode(65 + index)}
                    </div>

                    <div className='flex-1 text-base min-w-0 overflow-hidden font-normal'>
                      <CodeRenderer content={cleanOptionText(option)} />
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function QuizPage() {
  return (
    <ProtectedRoute>
      <QuizContent />
    </ProtectedRoute>
  );
}

// Disable static generation for dynamic quiz IDs
export async function getStaticPaths() {
  return {
    paths: [],
    fallback: 'blocking',
  };
}

export async function getStaticProps() {
  return {
    props: {},
    revalidate: 1,
  };
}
