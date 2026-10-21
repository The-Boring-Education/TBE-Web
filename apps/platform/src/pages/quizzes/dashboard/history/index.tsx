import { ProtectedRoute, useAuth } from '@tbe/auth';
import { useQuery } from '@tbe/query';
import { quizApi } from '@tbe/services';
import type { QuizAttempt } from '@tbe/types';
import { formatDate } from '@tbe/utils';
import {
  Award,
  Calendar,
  Clock,
  Eye,
  History,
  RefreshCw,
  Target,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';
import React, { useState } from 'react';

import { QuizLayout } from '@/components/quizzes/QuizLayout';
import { QuizTechIcon } from '@/components/quizzes/QuizTechIcon';

function AttemptCard({
  attempt,
  showDetails,
}: {
  attempt: QuizAttempt;
  showDetails: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600';
    if (score >= 60) return 'text-amber-600';
    return 'text-rose-600';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (score >= 60) return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-rose-50 text-rose-700 border-rose-200';
  };

  return (
    <div className='bg-white rounded-2xl border border-gray-200/80 hover:border-red-200/80 transition-all p-6 sm:p-7 mb-5 shadow-2xs hover:shadow-md'>
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
        <div className='flex items-center gap-4'>
          {/* Authentic Tech Icon */}
          <div className='w-13 h-13 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center p-2.5 shadow-2xs shrink-0'>
            <QuizTechIcon
              nameOrIcon={attempt.categoryName || attempt.categoryIcon || ''}
              className='w-8 h-8'
            />
          </div>

          <div>
            <h3 className='font-bold text-base sm:text-lg text-gray-900 mb-1.5'>
              {attempt.categoryName}
            </h3>
            <div className='flex flex-wrap items-center gap-3 text-xs sm:text-sm text-gray-500 font-medium'>
              <span className='flex items-center gap-1.5 text-gray-400'>
                <Calendar className='w-3.5 h-3.5' />
                {formatDate({ dateAndTime: attempt.completedAt }).date}
              </span>
              <span>&bull;</span>
              <span className='flex items-center gap-1.5 text-gray-400'>
                <Clock className='w-3.5 h-3.5' />
                {attempt.timeTaken}s
              </span>
              <span>&bull;</span>
              <span className='flex items-center gap-1.5 text-[#EF4444] font-bold'>
                <Award className='w-3.5 h-3.5' />+{attempt.pointsEarned} pts
              </span>
            </div>
          </div>
        </div>

        <div className='flex items-center justify-between sm:justify-end gap-5'>
          <div className='text-left sm:text-right'>
            <span
              className={`inline-block px-3.5 py-1 rounded-full text-xs font-bold border ${getScoreBadge(
                attempt.score,
              )}`}
            >
              {attempt.score}%
            </span>
            <p className='text-xs text-gray-400 mt-1 font-medium'>
              {attempt.correctAnswers}/{attempt.totalQuestions} correct
            </p>
          </div>

          {showDetails && (
            <button
              type='button'
              onClick={() => setExpanded(!expanded)}
              className='inline-flex items-center gap-1 text-xs font-semibold text-gray-600 hover:text-gray-950 bg-gray-50 hover:bg-gray-100 px-3.5 py-2 rounded-xl transition-colors cursor-pointer border border-gray-200/60'
            >
              <Eye className='w-3.5 h-3.5' />
              <span>{expanded ? 'Hide' : 'Details'}</span>
            </button>
          )}
        </div>
      </div>

      {expanded && showDetails && (
        <div className='mt-5 pt-5 border-t border-gray-100 text-xs sm:text-sm'>
          <div className='grid grid-cols-2 sm:grid-cols-3 gap-4 bg-gray-50/70 rounded-2xl p-4 sm:p-5 border border-gray-100'>
            <div>
              <p className='text-[10px] font-bold text-gray-400 uppercase tracking-wider'>
                Accuracy
              </p>
              <p
                className={`font-black text-lg mt-0.5 ${getScoreColor(attempt.score)}`}
              >
                {(
                  (attempt.correctAnswers / (attempt.totalQuestions || 1)) *
                  100
                ).toFixed(1)}
                %
              </p>
            </div>
            <div>
              <p className='text-[10px] font-bold text-gray-400 uppercase tracking-wider'>
                Pace
              </p>
              <p className='font-black text-lg text-gray-900 mt-0.5'>
                {Math.round(
                  (attempt.pointsEarned / (attempt.timeTaken || 1)) * 60,
                )}{' '}
                <span className='text-xs font-semibold text-gray-500'>
                  pts/min
                </span>
              </p>
            </div>
            <div>
              <p className='text-[10px] font-bold text-gray-400 uppercase tracking-wider'>
                Result
              </p>
              <p className='font-bold text-xs sm:text-sm mt-1 text-gray-800'>
                {attempt.score >= 80
                  ? 'Mastered 🔥'
                  : attempt.score >= 60
                    ? 'Good Effort 👍'
                    : 'Needs Practice 📚'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function HistoryContent() {
  const { user } = useAuth();
  const [showDetails] = useState(true);

  const {
    data: attemptsData,
    isLoading: attemptsLoading,
    refetch: refetchAttempts,
  } = useQuery<QuizAttempt[]>({
    queryKey: ['quiz-attempts', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const response = await quizApi.getUserAttempts(user.id, 50);
      return response.data || [];
    },
    enabled: !!user?.id,
  });

  const attempts = attemptsData || [];

  const totalAttempts = attempts.length;
  const averageScore =
    attempts.length > 0
      ? Math.round(
          attempts.reduce((sum, attempt) => sum + (attempt.score || 0), 0) /
            attempts.length,
        )
      : 0;
  const totalTimeSpent = attempts.reduce(
    (sum, attempt) => sum + (attempt.timeTaken || 0),
    0,
  );
  const totalPoints = attempts.reduce(
    (sum, attempt) => sum + (attempt.pointsEarned || 0),
    0,
  );

  return (
    <QuizLayout activeTab='history'>
      <div className='w-full'>
        {/* ========================================================= */}
        {/* Header                                                    */}
        {/* ========================================================= */}
        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8'>
          <div>
            <div className='flex items-center gap-2.5 mb-1'>
              <div className='w-9 h-9 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-[#EF4444] shadow-2xs'>
                <History className='w-5 h-5' />
              </div>
              <h1 className='text-2xl sm:text-3xl font-black text-gray-900 tracking-tight'>
                Performance History
              </h1>
            </div>
            <p className='text-xs sm:text-sm text-gray-500 font-medium ml-11'>
              Review your quiz attempts, accuracy trends, and points earned.
            </p>
          </div>

          <button
            type='button'
            onClick={() => refetchAttempts()}
            disabled={attemptsLoading}
            className='inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 active:bg-gray-100 border border-gray-200/90 text-gray-700 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-2xs cursor-pointer disabled:opacity-60 self-start sm:self-auto'
          >
            <RefreshCw
              className={`w-3.5 h-3.5 text-gray-500 ${
                attemptsLoading ? 'animate-spin' : ''
              }`}
            />
            <span>Refresh</span>
          </button>
        </div>

        {/* ========================================================= */}
        {/* Summary Metric Cards                                      */}
        {/* ========================================================= */}
        <div className='grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8'>
          <div className='bg-white rounded-2xl border border-gray-200/90 p-5 sm:p-6 shadow-2xs flex items-center gap-4'>
            <div className='w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0 shadow-2xs'>
              <Target className='w-6 h-6' />
            </div>
            <div>
              <p className='text-[11px] text-gray-400 font-bold uppercase tracking-wider'>
                Total Attempts
              </p>
              <p className='text-2xl sm:text-3xl font-black text-gray-900 mt-0.5'>
                {totalAttempts}
              </p>
            </div>
          </div>

          <div className='bg-white rounded-2xl border border-gray-200/90 p-5 sm:p-6 shadow-2xs flex items-center gap-4'>
            <div className='w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0 shadow-2xs'>
              <TrendingUp className='w-6 h-6' />
            </div>
            <div>
              <p className='text-[11px] text-gray-400 font-bold uppercase tracking-wider'>
                Average Score
              </p>
              <p className='text-2xl sm:text-3xl font-black text-gray-900 mt-0.5'>
                {averageScore}%
              </p>
            </div>
          </div>

          <div className='bg-white rounded-2xl border border-gray-200/90 p-5 sm:p-6 shadow-2xs flex items-center gap-4'>
            <div className='w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center shrink-0 shadow-2xs'>
              <Clock className='w-6 h-6' />
            </div>
            <div>
              <p className='text-[11px] text-gray-400 font-bold uppercase tracking-wider'>
                Total Time
              </p>
              <p className='text-2xl sm:text-3xl font-black text-gray-900 mt-0.5'>
                {Math.round(totalTimeSpent / 60)} min
              </p>
            </div>
          </div>

          <div className='bg-white rounded-2xl border border-gray-200/90 p-5 sm:p-6 shadow-2xs flex items-center gap-4'>
            <div className='w-12 h-12 bg-red-50 text-[#EF4444] rounded-xl flex items-center justify-center shrink-0 shadow-2xs'>
              <Award className='w-6 h-6' />
            </div>
            <div>
              <p className='text-[11px] text-gray-400 font-bold uppercase tracking-wider'>
                Points Earned
              </p>
              <p className='text-2xl sm:text-3xl font-black text-[#EF4444] mt-0.5'>
                {totalPoints}
              </p>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* Attempts List                                             */}
        {/* ========================================================= */}
        {attemptsLoading ? (
          <div className='text-center py-16 bg-white rounded-3xl border border-gray-200/90 shadow-2xs'>
            <RefreshCw className='w-8 h-8 animate-spin mx-auto text-[#EF4444] mb-2' />
            <p className='text-gray-500 text-xs sm:text-sm font-medium'>
              Loading quiz attempt history...
            </p>
          </div>
        ) : attempts.length === 0 ? (
          <div className='bg-white rounded-3xl border border-gray-200/90 p-12 text-center max-w-lg mx-auto shadow-2xs'>
            <div className='w-14 h-14 rounded-2xl bg-red-50 text-[#EF4444] flex items-center justify-center mx-auto mb-3'>
              <History className='w-7 h-7' />
            </div>
            <h3 className='text-base font-bold text-gray-900 mb-1'>
              No Quiz Attempts Found
            </h3>
            <p className='text-xs sm:text-sm text-gray-500 mb-6'>
              You haven't completed any quizzes yet.
            </p>
            <Link
              href='/quizzes/dashboard'
              className='inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#EF4444] hover:bg-[#DC2626] text-white text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-xs'
            >
              Take Your First Quiz
            </Link>
          </div>
        ) : (
          <div>
            {attempts.map((attempt) => (
              <AttemptCard
                key={attempt._id || Math.random().toString()}
                attempt={attempt}
                showDetails={showDetails}
              />
            ))}
          </div>
        )}
      </div>
    </QuizLayout>
  );
}

export default function HistoryPage() {
  return (
    <ProtectedRoute>
      <HistoryContent />
    </ProtectedRoute>
  );
}
