import { ProtectedRoute, useAuth } from '@tbe/auth';
import { useQuery } from '@tbe/query';
import { analyticsApi, quizApi } from '@tbe/services';
import type { PerformanceMetrics, QuizAttempt } from '@tbe/types';
import {
  Activity,
  BarChart3,
  CheckCircle2,
  Clock,
  Lightbulb,
  RefreshCw,
  Target,
  TrendingUp,
  Trophy,
  Zap,
} from 'lucide-react';
import React from 'react';

import { QuizLayout } from '@/components/quizzes/QuizLayout';

interface NormalizedMetrics {
  totalQuizzes: number;
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;
  averageScore: number;
  totalPoints: number;
  totalTimeSpent: number;
}

function StatsContent() {
  const { user } = useAuth();

  const {
    data: metricsData,
    isLoading,
    refetch,
  } = useQuery<NormalizedMetrics | null>({
    queryKey: ['quizzes-performance-metrics', user?.id],
    queryFn: async (): Promise<NormalizedMetrics | null> => {
      if (!user?.id) return null;

      // 1. Fetch completed attempts to compute aggregates
      let attempts: QuizAttempt[] = [];
      try {
        const attemptsResp = await quizApi.getUserAttempts(user.id, 100);
        attempts = (attemptsResp.data || []) as QuizAttempt[];
      } catch (err) {
        console.error('Failed to fetch user attempts for stats:', err);
      }

      const totalAttempts = attempts.length;
      const totalPoints = attempts.reduce(
        (sum, a) => sum + (a.pointsEarned || 0),
        0,
      );
      const totalQuestions = attempts.reduce(
        (sum, a) => sum + (a.totalQuestions || 0),
        0,
      );
      const correctAnswers = attempts.reduce(
        (sum, a) => sum + (a.correctAnswers || 0),
        0,
      );
      const attemptsTotalTime = attempts.reduce(
        (sum, a) => sum + (a.timeTaken || 0),
        0,
      );
      const attemptsAvgScore =
        totalAttempts > 0
          ? Math.round(
              attempts.reduce((sum, a) => sum + (a.score || 0), 0) /
                totalAttempts,
            )
          : 0;

      // 2. Fetch primary performance metrics if available
      let perfData: PerformanceMetrics | null = null;
      try {
        const response = await analyticsApi.getPerformanceMetrics(user.id);
        if ('status' in response && response.status === true && response.data) {
          perfData = response.data;
        } else if (
          'success' in response &&
          response.success === true &&
          response.data
        ) {
          perfData = response.data;
        }
      } catch {}

      if (totalAttempts === 0 && !perfData) {
        return null;
      }

      const totalQuizzes =
        perfData?.totalQuizzes ?? perfData?.totalAttempts ?? totalAttempts;
      const averageScore = perfData?.averageScore ?? attemptsAvgScore;
      const accuracy =
        totalQuestions > 0
          ? Math.round((correctAnswers / totalQuestions) * 100)
          : averageScore;
      const totalTimeSpent = perfData?.totalTimeSpent ?? attemptsTotalTime;

      return {
        totalQuizzes,
        totalQuestions,
        correctAnswers,
        accuracy,
        averageScore,
        totalPoints,
        totalTimeSpent,
      };
    },
    enabled: !!user?.id,
  });

  const m = metricsData;

  return (
    <QuizLayout activeTab='stats'>
      <div className='w-full'>
        {/* ========================================================= */}
        {/* Header                                                    */}
        {/* ========================================================= */}
        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8'>
          <div>
            <div className='flex items-center gap-2.5 mb-1'>
              <div className='w-9 h-9 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-[#EF4444] shadow-2xs'>
                <BarChart3 className='w-5 h-5' />
              </div>
              <h1 className='text-2xl sm:text-3xl font-black text-gray-900 tracking-tight'>
                Performance Analytics
              </h1>
            </div>
            <p className='text-xs sm:text-sm text-gray-500 font-medium ml-11'>
              Detailed insights into your speed, accuracy, and knowledge
              retention.
            </p>
          </div>

          <button
            type='button'
            onClick={() => refetch()}
            disabled={isLoading}
            className='inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 active:bg-gray-100 border border-gray-200/90 text-gray-700 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-2xs cursor-pointer disabled:opacity-60 self-start sm:self-auto'
          >
            <RefreshCw
              className={`w-3.5 h-3.5 text-gray-500 ${
                isLoading ? 'animate-spin' : ''
              }`}
            />
            <span>Refresh</span>
          </button>
        </div>

        {/* ========================================================= */}
        {/* 4 Metric Cards Grid (Spacious coverage)                   */}
        {/* ========================================================= */}
        <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8'>
          {/* Accuracy */}
          <div className='bg-white rounded-3xl border border-gray-200/90 p-6 shadow-2xs flex items-center justify-between hover:shadow-md transition-shadow'>
            <div>
              <p className='text-[11px] font-bold text-gray-400 uppercase tracking-wider'>
                Overall Accuracy
              </p>
              <p className='text-3xl font-black text-gray-950 mt-2'>
                {m?.accuracy ?? m?.averageScore ?? 0}%
              </p>
              <p className='text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1'>
                <CheckCircle2 className='w-3 h-3' />
                <span>Across all attempts</span>
              </p>
            </div>
            <div className='w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shadow-2xs'>
              <Target className='w-6 h-6' />
            </div>
          </div>

          {/* Points */}
          <div className='bg-white rounded-3xl border border-gray-200/90 p-6 shadow-2xs flex items-center justify-between hover:shadow-md transition-shadow'>
            <div>
              <p className='text-[11px] font-bold text-gray-400 uppercase tracking-wider'>
                Total Points
              </p>
              <p className='text-3xl font-black text-[#EF4444] mt-2'>
                {m?.totalPoints ?? 0}
              </p>
              <p className='text-xs text-gray-400 font-medium mt-1'>
                Earned from tests
              </p>
            </div>
            <div className='w-12 h-12 bg-red-50 text-[#EF4444] rounded-2xl flex items-center justify-center shadow-2xs'>
              <Trophy className='w-6 h-6' />
            </div>
          </div>

          {/* Quizzes Taken */}
          <div className='bg-white rounded-3xl border border-gray-200/90 p-6 shadow-2xs flex items-center justify-between hover:shadow-md transition-shadow'>
            <div>
              <p className='text-[11px] font-bold text-gray-400 uppercase tracking-wider'>
                Quizzes Taken
              </p>
              <p className='text-3xl font-black text-gray-950 mt-2'>
                {m?.totalQuizzes ?? 0}
              </p>
              <p className='text-xs text-blue-600 font-medium mt-1 flex items-center gap-1'>
                <TrendingUp className='w-3 h-3' />
                <span>Completed assessments</span>
              </p>
            </div>
            <div className='w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-2xs'>
              <Activity className='w-6 h-6' />
            </div>
          </div>

          {/* Time Spent */}
          <div className='bg-white rounded-3xl border border-gray-200/90 p-6 shadow-2xs flex items-center justify-between hover:shadow-md transition-shadow'>
            <div>
              <p className='text-[11px] font-bold text-gray-400 uppercase tracking-wider'>
                Time Spent
              </p>
              <p className='text-3xl font-black text-gray-950 mt-2'>
                {Math.round((m?.totalTimeSpent ?? 0) / 60)} min
              </p>
              <p className='text-xs text-purple-600 font-medium mt-1 flex items-center gap-1'>
                <Clock className='w-3 h-3' />
                <span>Total active time</span>
              </p>
            </div>
            <div className='w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center shadow-2xs'>
              <Clock className='w-6 h-6' />
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* Detailed Insights & Consistency Cards                     */}
        {/* ========================================================= */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8'>
          {/* Learning Consistency */}
          <div className='bg-white rounded-3xl border border-gray-200/90 p-6 sm:p-8 shadow-2xs'>
            <div className='flex items-center gap-2.5 pb-5 border-b border-gray-100'>
              <div className='w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center'>
                <Zap className='w-4 h-4' />
              </div>
              <h2 className='text-lg font-bold text-gray-900'>
                Learning Consistency &amp; Retention
              </h2>
            </div>

            <div className='pt-6 space-y-4'>
              <p className='text-xs sm:text-sm text-gray-600 leading-relaxed'>
                Consistent daily practice of 1-2 quizzes drastically improves
                retention and interview readiness.
              </p>

              <div className='bg-gray-50/80 rounded-2xl p-4 sm:p-5 border border-gray-100 space-y-3'>
                <div className='flex justify-between text-xs sm:text-sm font-semibold'>
                  <span className='text-gray-600'>Correct Answers:</span>
                  <span className='text-gray-950 font-black'>
                    {m?.correctAnswers ?? 0} / {m?.totalQuestions ?? 0}
                  </span>
                </div>

                <div className='w-full bg-gray-200/80 rounded-full h-3 overflow-hidden'>
                  <div
                    className='bg-[#EF4444] h-3 rounded-full transition-all duration-500'
                    style={{
                      width: `${
                        m?.totalQuestions
                          ? Math.min(
                              100,
                              Math.round(
                                (m.correctAnswers / m.totalQuestions) * 100,
                              ),
                            )
                          : 0
                      }%`,
                    }}
                  />
                </div>

                <div className='flex justify-between text-[11px] text-gray-400 font-medium'>
                  <span>Accuracy progress</span>
                  <span className='text-[#EF4444] font-bold'>
                    {m?.totalQuestions
                      ? Math.round((m.correctAnswers / m.totalQuestions) * 100)
                      : 0}
                    %
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Actionable Recommendations */}
          <div className='bg-white rounded-3xl border border-gray-200/90 p-6 sm:p-8 shadow-2xs'>
            <div className='flex items-center gap-2.5 pb-5 border-b border-gray-100'>
              <div className='w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center'>
                <Lightbulb className='w-4 h-4' />
              </div>
              <h2 className='text-lg font-bold text-gray-900'>
                Personalized Recommendations
              </h2>
            </div>

            <div className='pt-6 space-y-3.5 text-xs sm:text-sm text-gray-700'>
              <div className='p-4 bg-blue-50/50 rounded-2xl border border-blue-100/80 flex items-start gap-3'>
                <span className='text-base'>💡</span>
                <p className='leading-relaxed'>
                  Review explanations on questions you answered incorrectly in
                  your history to prevent repeat mistakes in interview screening
                  rounds.
                </p>
              </div>

              <div className='p-4 bg-amber-50/50 rounded-2xl border border-amber-100/80 flex items-start gap-3'>
                <span className='text-base'>⚡</span>
                <p className='leading-relaxed'>
                  Aim to complete questions within 45 seconds to simulate
                  fast-paced company OA (Online Assessment) timing constraints.
                </p>
              </div>

              <div className='p-4 bg-rose-50/50 rounded-2xl border border-rose-100/80 flex items-start gap-3'>
                <span className='text-base'>🎯</span>
                <p className='leading-relaxed'>
                  Maintain an accuracy above 80% to ensure top ranking and high
                  mastery badges across all languages.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </QuizLayout>
  );
}

export default function PerformancePage() {
  return (
    <ProtectedRoute>
      <StatsContent />
    </ProtectedRoute>
  );
}
