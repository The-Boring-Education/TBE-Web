import { ProtectedRoute, useAuth } from '@tbe/auth';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Progress,
} from '@tbe/components/quizes';
import { useQuery } from '@tbe/query';
import { analyticsApi, quizApi } from '@tbe/services';
import type { PerformanceMetrics } from '@tbe/types';
import {
  Activity,
  BarChart3,
  Clock,
  RefreshCw,
  Target,
  TrendingUp,
  Trophy,
  Zap,
} from 'lucide-react';
import React from 'react';

import { QuizzesNav } from '@/components/quizzes/QuizzesNav';

function StatsContent() {
  const { user } = useAuth();

  const {
    data: metricsData,
    isLoading,
    refetch,
  } = useQuery<PerformanceMetrics | null>({
    queryKey: ['quizzes-performance-metrics', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      try {
        const response = await analyticsApi.getPerformanceMetrics(user.id);
        if ('status' in response && response.status === true && response.data) {
          return response.data;
        }
      } catch {}

      // Fallback: fetch sessions and compute metrics
      try {
        const sessionsResp = await quizApi.getUserSessions(user.id);
        const attempts = sessionsResp.data || [];

        if (attempts.length === 0) {
          return null;
        }

        const totalAttempts = attempts.length;
        const totalScore = attempts.reduce(
          (sum: number, a: any) => sum + (a.score || 0),
          0,
        );
        const totalTime = attempts.reduce(
          (sum: number, a: any) => sum + (a.timeTaken || 0),
          0,
        );
        const totalPoints = attempts.reduce(
          (sum: number, a: any) => sum + (a.pointsEarned || 0),
          0,
        );
        const averageScore = Math.round(totalScore / totalAttempts);

        return {
          totalQuizzes: totalAttempts,
          totalQuestions: attempts.reduce(
            (sum: number, a: any) => sum + (a.totalQuestions || 0),
            0,
          ),
          correctAnswers: attempts.reduce(
            (sum: number, a: any) => sum + (a.correctAnswers || 0),
            0,
          ),
          accuracy: averageScore,
          averageScore,
          totalPoints,
          totalTimeSpent: totalTime,
          recentTrend: 5,
        } as unknown as PerformanceMetrics;
      } catch {
        return null;
      }
    },
    enabled: !!user?.id,
  });

  const m = metricsData as any;

  return (
    <div className='min-h-screen bg-gray-50 flex flex-col'>
      <QuizzesNav activeTab='stats' />

      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full'>
        {/* Header */}
        <div className='mb-8'>
          <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
            <div>
              <h1 className='text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2'>
                <BarChart3 className='w-8 h-8 text-primary' />
                Performance Analytics
              </h1>
              <p className='text-gray-600 mt-1'>
                Detailed insights into your speed, accuracy, and knowledge
                retention.
              </p>
            </div>
            <Button
              onClick={() => refetch()}
              variant='outline'
              size='sm'
              disabled={isLoading}
              className='bg-white'
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`}
              />
              Refresh
            </Button>
          </div>
        </div>

        {/* Metric Cards Grid */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
          <Card className='border border-gray-200 bg-white rounded-2xl p-6 shadow-xs'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-xs font-semibold text-gray-500 uppercase tracking-wider'>
                  Overall Accuracy
                </p>
                <p className='text-3xl font-extrabold text-gray-900 mt-2'>
                  {m?.accuracy ?? m?.averageScore ?? 0}%
                </p>
              </div>
              <div className='w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center'>
                <Target className='w-6 h-6' />
              </div>
            </div>
          </Card>

          <Card className='border border-gray-200 bg-white rounded-2xl p-6 shadow-xs'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-xs font-semibold text-gray-500 uppercase tracking-wider'>
                  Total Points
                </p>
                <p className='text-3xl font-extrabold text-primary mt-2'>
                  {m?.totalPoints ?? 0}
                </p>
              </div>
              <div className='w-12 h-12 bg-red-50 text-primary rounded-xl flex items-center justify-center'>
                <Trophy className='w-6 h-6' />
              </div>
            </div>
          </Card>

          <Card className='border border-gray-200 bg-white rounded-2xl p-6 shadow-xs'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-xs font-semibold text-gray-500 uppercase tracking-wider'>
                  Quizzes Taken
                </p>
                <p className='text-3xl font-extrabold text-gray-900 mt-2'>
                  {m?.totalQuizzes ?? 0}
                </p>
              </div>
              <div className='w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center'>
                <Activity className='w-6 h-6' />
              </div>
            </div>
          </Card>

          <Card className='border border-gray-200 bg-white rounded-2xl p-6 shadow-xs'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-xs font-semibold text-gray-500 uppercase tracking-wider'>
                  Time Spent
                </p>
                <p className='text-3xl font-extrabold text-gray-900 mt-2'>
                  {Math.round((m?.totalTimeSpent ?? 0) / 60)} min
                </p>
              </div>
              <div className='w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center'>
                <Clock className='w-6 h-6' />
              </div>
            </div>
          </Card>
        </div>

        {/* Detailed Insights Card */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          <Card className='border border-gray-200 bg-white rounded-2xl p-6 sm:p-8 shadow-xs'>
            <CardHeader className='p-0 pb-6 border-b border-gray-100'>
              <CardTitle className='text-xl font-bold text-gray-900 flex items-center gap-2'>
                <Zap className='w-5 h-5 text-amber-500' />
                Learning Consistency
              </CardTitle>
            </CardHeader>
            <CardContent className='p-0 pt-6 space-y-4'>
              <p className='text-gray-600 text-sm leading-relaxed'>
                Consistent daily practice of 1-2 quizzes drastically improves
                retention and interview readiness.
              </p>
              <div className='bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-3'>
                <div className='flex justify-between text-sm'>
                  <span className='text-gray-600'>Correct Answers:</span>
                  <span className='font-bold text-gray-900'>
                    {m?.correctAnswers ?? 0} / {m?.totalQuestions ?? 0}
                  </span>
                </div>
                <Progress
                  value={
                    m?.totalQuestions
                      ? (m.correctAnswers / m.totalQuestions) * 100
                      : 0
                  }
                  className='h-2 bg-gray-200'
                />
              </div>
            </CardContent>
          </Card>

          <Card className='border border-gray-200 bg-white rounded-2xl p-6 sm:p-8 shadow-xs'>
            <CardHeader className='p-0 pb-6 border-b border-gray-100'>
              <CardTitle className='text-xl font-bold text-gray-900 flex items-center gap-2'>
                <TrendingUp className='w-5 h-5 text-green-500' />
                Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className='p-0 pt-6 space-y-3 text-sm text-gray-600'>
              <div className='p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-blue-900'>
                💡 Review explanations on questions you answered incorrectly in
                your history to prevent repeat mistakes.
              </div>
              <div className='p-3 bg-amber-50/60 rounded-xl border border-amber-100 text-amber-900'>
                ⚡ Try to finish questions within 45 seconds to simulate
                fast-paced screening rounds.
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

export default function PerformancePage() {
  return (
    <ProtectedRoute>
      <StatsContent />
    </ProtectedRoute>
  );
}
