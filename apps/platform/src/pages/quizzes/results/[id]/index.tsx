import { ProtectedRoute, useAuth } from '@tbe/auth';
import { ContentFeedbackWidget, LoadingSpinner } from '@tbe/components';
import { MarkdownRenderer } from '@tbe/components/quizes';
import { ANALYTICS_EVENTS } from '@tbe/constants';
import { useQuery } from '@tbe/query';
import { quizApi } from '@tbe/services';
import type { Question } from '@tbe/types';
import { cleanOptionText, trackEvent } from '@tbe/utils';
import {
  AlertCircle,
  ArrowLeft,
  Clock,
  RotateCcw,
  Target,
  Trophy,
} from 'lucide-react';
import { useRouter } from 'next/router';
import React, { useEffect, useMemo } from 'react';

interface QuizQuestion {
  _id?: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  detailedExplanation?: string;
  difficulty?: string;
}

function ResultsContent() {
  const router = useRouter();
  const { user } = useAuth();

  const id = router.query.id as string;
  const answersParam = router.query.answers as string;
  const timeTakenParam = router.query.timeTaken as string;

  const answers: (number | null)[] = useMemo(
    () => (answersParam ? JSON.parse(answersParam) : []),
    [answersParam],
  );
  const timeTaken = timeTakenParam ? parseInt(timeTakenParam, 10) : 0;

  const {
    data: quizData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['quiz', id],
    queryFn: () => quizApi.getQuestions(id!),
    enabled: !!id,
    staleTime: 0,
    gcTime: 0,
  });

  const questions: Question[] =
    quizData?.data?.questions?.map((q: QuizQuestion) => ({
      id: q._id || Math.random(),
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      detailedExplanation: q.detailedExplanation || q.explanation,
      category: quizData?.data?.categoryName || '',
      difficulty: (q.difficulty || 'medium') as 'easy' | 'medium' | 'hard',
    })) || [];

  useEffect(() => {
    try {
      trackEvent(ANALYTICS_EVENTS.QUIZ_RESULTS_VIEW, {
        category: 'quiz',
        quizId: id,
        timeTaken,
        answeredCount: answers.filter((a) => a !== null).length,
      });
    } catch {}
  }, [id, timeTaken, answers]);

  if (!router.isReady || isLoading || !id) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <LoadingSpinner label='Loading quiz results...' />
      </div>
    );
  }

  if (error || !quizData?.data || questions.length === 0) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4'>
        <div className='bg-white rounded-2xl shadow-xs border border-gray-200 p-8 max-w-md w-full text-center'>
          <div className='w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4'>
            <AlertCircle className='w-6 h-6' />
          </div>
          <h2 className='text-2xl font-bold text-gray-900 mb-2'>
            Failed to load quiz results
          </h2>
          <p className='text-gray-600 mb-6 text-sm'>
            We couldn't retrieve the questions for this quiz assessment. Please
            try again.
          </p>
          <div className='flex justify-center gap-3'>
            <button
              onClick={() => router.push('/quizzes/dashboard')}
              className='inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer'
            >
              Back to Dashboard
            </button>
            <button
              onClick={() => router.reload()}
              className='inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 cursor-pointer'
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const score = answers.reduce((acc: number, answer, index) => {
    return acc + (answer === questions[index]?.correctAnswer ? 1 : 0);
  }, 0);

  const totalQuestions = questions.length;
  const percentage =
    totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

  return (
    <div className='min-h-screen bg-gray-50 py-8 sm:py-12'>
      {/* Header Navigation */}
      <div className='container mx-auto px-4 max-w-4xl mb-6'>
        <button
          onClick={() => router.push('/quizzes/dashboard')}
          className='inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors cursor-pointer text-sm font-medium'
        >
          <ArrowLeft className='w-4 h-4' />
          <span>Back to Quizzes</span>
        </button>
      </div>

      {/* Main Results Container */}
      <div className='container mx-auto px-4 max-w-4xl'>
        {/* Score Card Summary */}
        <div className='bg-white rounded-2xl shadow-xs border border-gray-200 p-6 sm:p-8 mb-8'>
          <div className='text-center mb-8'>
            <div className='w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 text-primary'>
              <Trophy className='w-8 h-8' />
            </div>
            <h1 className='text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-2'>
              Quiz Completed!
            </h1>
            <p className='text-base text-gray-600'>
              {percentage >= 80
                ? "Outstanding job! You've mastered this topic."
                : percentage >= 50
                  ? 'Good effort! Review the explanations below to strengthen your understanding.'
                  : 'Keep practicing! Check out the detailed answers to level up.'}
            </p>
          </div>

          {/* Metric Cards */}
          <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8'>
            <div className='text-center p-5 bg-blue-50/60 rounded-xl border border-blue-100'>
              <div className='flex items-center justify-center mb-2'>
                <Trophy className='w-6 h-6 text-blue-600' />
              </div>
              <div className='text-3xl font-bold text-blue-600 mb-1'>
                {percentage}%
              </div>
              <div className='text-xs font-semibold text-gray-600 uppercase tracking-wider'>
                Overall Score
              </div>
            </div>

            <div className='text-center p-5 bg-green-50/60 rounded-xl border border-green-100'>
              <div className='flex items-center justify-center mb-2'>
                <Target className='w-6 h-6 text-green-600' />
              </div>
              <div className='text-3xl font-bold text-green-600 mb-1'>
                {score}/{totalQuestions}
              </div>
              <div className='text-xs font-semibold text-gray-600 uppercase tracking-wider'>
                Correct Answers
              </div>
            </div>

            <div className='text-center p-5 bg-purple-50/60 rounded-xl border border-purple-100'>
              <div className='flex items-center justify-center mb-2'>
                <Clock className='w-6 h-6 text-purple-600' />
              </div>
              <div className='text-3xl font-bold text-purple-600 mb-1'>
                {Math.floor(timeTaken / 60)}:
                {String(timeTaken % 60).padStart(2, '0')}
              </div>
              <div className='text-xs font-semibold text-gray-600 uppercase tracking-wider'>
                Time Taken
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className='flex flex-col sm:flex-row gap-3'>
            <button
              onClick={() => router.push(`/quizzes/${id}`)}
              className='flex-1 inline-flex items-center justify-center bg-primary text-white py-3 px-6 rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-xs cursor-pointer'
            >
              <RotateCcw className='w-4 h-4 mr-2' />
              Retake Quiz
            </button>
            <button
              onClick={() => router.push('/quizzes/dashboard')}
              className='flex-1 inline-flex items-center justify-center border-2 border-gray-300 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-50 transition-all cursor-pointer'
            >
              Browse Other Quizzes
            </button>
          </div>
        </div>

        {/* Detailed Review Section */}
        {questions.length > 0 && (
          <div className='bg-white rounded-2xl shadow-xs border border-gray-200 p-6 sm:p-8 mb-8'>
            <h2 className='text-2xl font-bold text-gray-900 mb-6'>
              Question Review &amp; Explanations
            </h2>

            <div className='space-y-6'>
              {questions.map((question, index) => {
                const userAnswer = answers[index];
                const isCorrect = userAnswer === question.correctAnswer;
                const isAnswered =
                  userAnswer !== null &&
                  userAnswer !== undefined &&
                  userAnswer !== -1;

                return (
                  <div
                    key={index}
                    className={`p-6 rounded-xl border-2 transition-all ${
                      isCorrect
                        ? 'border-green-200 bg-green-50/20'
                        : 'border-red-200 bg-red-50/20'
                    }`}
                  >
                    <div className='flex items-start justify-between gap-4 mb-4'>
                      <div className='flex items-start gap-2 flex-1 text-gray-900'>
                        <span className='font-bold text-gray-500 shrink-0 text-base mt-0.5'>
                          #{index + 1}
                        </span>
                        <div className='flex-1 min-w-0'>
                          <MarkdownRenderer
                            content={question.question}
                            className='font-semibold text-base text-gray-900 leading-relaxed'
                          />
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 ${
                          isCorrect
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {isCorrect ? 'Correct' : 'Incorrect'}
                      </span>
                    </div>

                    <div className='space-y-2 mb-4'>
                      {question.options.map((option, optIdx) => {
                        const isUserChoice = userAnswer === optIdx;
                        const isCorrectChoice =
                          question.correctAnswer === optIdx;

                        let optClass = 'border-gray-200 bg-white text-gray-700';
                        if (isCorrectChoice) {
                          optClass =
                            'border-green-500 bg-green-50 font-semibold text-green-900';
                        } else if (isUserChoice && !isCorrect) {
                          optClass =
                            'border-red-500 bg-red-50 font-semibold text-red-900';
                        }

                        return (
                          <div
                            key={optIdx}
                            className={`p-3 rounded-lg border text-sm flex items-start sm:items-center gap-3 ${optClass}`}
                          >
                            <span className='w-6 h-6 rounded-md border flex items-center justify-center text-xs font-bold shrink-0 bg-white mt-0.5 sm:mt-0'>
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <div className='flex-1 min-w-0'>
                              <MarkdownRenderer
                                content={cleanOptionText(option)}
                                className='text-sm leading-relaxed'
                              />
                            </div>
                            {isCorrectChoice && (
                              <span className='text-xs text-green-600 font-bold shrink-0'>
                                Correct Answer
                              </span>
                            )}
                            {isUserChoice && !isCorrect && (
                              <span className='text-xs text-red-600 font-bold shrink-0'>
                                Your Choice
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {question.explanation && (
                      <div className='mt-4 pt-4 border-t border-gray-200/60 bg-gray-50/80 p-4 rounded-lg'>
                        <h4 className='font-bold text-xs uppercase tracking-wider text-gray-500 mb-2'>
                          Explanation
                        </h4>
                        <MarkdownRenderer
                          content={question.explanation}
                          className='text-sm text-gray-800 leading-relaxed'
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Feedback Widget */}
        {id && (
          <div className='mt-8'>
            <ContentFeedbackWidget
              contentType='QUIZ'
              contentId={id}
              title='Rate this assessment'
              meta={{
                quizId: id,
                quizName:
                  (quizData?.data as any)?.categoryName ||
                  (quizData?.data as any)?.title ||
                  id,
              }}
              theme='light'
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default function Results() {
  return (
    <ProtectedRoute>
      <ResultsContent />
    </ProtectedRoute>
  );
}

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
