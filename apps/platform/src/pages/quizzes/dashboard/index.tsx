import { ProtectedRoute, useAuth } from '@tbe/auth';
import { Button, LoadingSpinner } from '@tbe/components';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@tbe/components/quizes';
import { useQuizData } from '@tbe/hooks';
import { gamificationApi } from '@tbe/services';
import { BookOpen, Play, Sparkles } from 'lucide-react';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';

import { QuizzesNav } from '@/components/quizzes/QuizzesNav';

function DashboardContent() {
  const { user } = useAuth();
  const router = useRouter();
  const { categories, loading, error, refetch } = useQuizData();

  const startQuiz = (categoryId: string) => {
    router.push(`/quizzes/${categoryId}`);
  };

  useEffect(() => {
    const effectiveUserId = (user as any)?._id || user?.id;
    if (!effectiveUserId) return;

    gamificationApi
      .getuserGamificationPoints(effectiveUserId)
      .then(() => {})
      .catch((err: any) => {
        console.error('Failed to load gamification points:', err);
      });
  }, [user?.id]);

  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50 flex flex-col'>
        <QuizzesNav activeTab='dashboard' />
        <div className='flex-1 flex items-center justify-center p-8'>
          <LoadingSpinner label='Loading available quizzes...' />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='min-h-screen bg-gray-50 flex flex-col'>
        <QuizzesNav activeTab='dashboard' />
        <div className='flex-1 flex items-center justify-center p-8'>
          <div className='text-center bg-white p-8 rounded-2xl border border-gray-200 shadow-xs max-w-md'>
            <p className='text-red-600 mb-4 font-medium'>{error}</p>
            <Button onClick={refetch} variant='OUTLINE'>
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const firstName =
    user?.name?.trim().split(/\s+/).filter(Boolean)[0] || 'there';

  return (
    <div className='min-h-screen bg-gray-50 flex flex-col'>
      <QuizzesNav activeTab='dashboard' />

      <main className='flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12'>
        {/* Welcome Header */}
        <div className='mb-8 sm:mb-12'>
          <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
            <div>
              <div className='inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-2'>
                <Sparkles className='w-3.5 h-3.5' />
                Practice &amp; Assessment
              </div>
              <h1 className='text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight'>
                Welcome back, {firstName}! 👋
              </h1>
              <p className='text-base sm:text-lg text-gray-600 mt-1'>
                Choose a topic below to test your technical depth and earn
                points.
              </p>
            </div>
          </div>
        </div>

        {/* Quiz Categories */}
        <div className='max-w-6xl mx-auto'>
          <Card className='shadow-xs border border-gray-200 bg-white rounded-2xl'>
            <CardHeader className='border-b border-gray-100 p-6 sm:p-8'>
              <CardTitle className='flex items-center space-x-3 text-2xl text-gray-900 font-bold'>
                <div className='w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary'>
                  <BookOpen className='h-5 w-5' />
                </div>
                <span>Available Quizzes</span>
              </CardTitle>
              <CardDescription className='text-base text-gray-500 mt-1'>
                Pick a category to begin your timed assessment
              </CardDescription>
            </CardHeader>

            <CardContent className='p-6 sm:p-8'>
              {categories.length === 0 ? (
                <div className='text-center py-16'>
                  <BookOpen className='h-16 w-16 text-gray-300 mx-auto mb-4' />
                  <p className='text-gray-500 text-lg mb-6'>
                    No quizzes currently available. Check back soon!
                  </p>
                  <Button onClick={refetch} variant='OUTLINE' size='LARGE'>
                    Refresh
                  </Button>
                </div>
              ) : (
                <div className='grid sm:grid-cols-2 lg:grid-cols-3 gap-6'>
                  {categories.map((category) => (
                    <Card
                      key={category._id}
                      className='cursor-pointer hover:shadow-md transition-all duration-200 hover:-translate-y-1 border border-gray-200 hover:border-primary/40 bg-white rounded-xl overflow-hidden flex flex-col justify-between'
                      onClick={() => startQuiz(category._id)}
                    >
                      <CardContent className='p-6 flex flex-col flex-1 justify-between'>
                        <div>
                          <div className='text-4xl mb-4 p-2 w-14 h-14 rounded-xl bg-gray-50 flex items-center justify-center'>
                            {category.categoryIcon || '💡'}
                          </div>
                          <h3 className='font-bold text-lg mb-2 text-gray-900'>
                            {category.categoryName}
                          </h3>
                          <p className='text-gray-600 text-sm mb-6 line-clamp-3'>
                            {category.categoryDescription}
                          </p>
                        </div>
                        <Button
                          className='w-full rounded-lg text-white'
                          variant='PRIMARY'
                          icon={<Play className='h-4 w-4 mr-2' />}
                          text='Start Quiz'
                        />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
