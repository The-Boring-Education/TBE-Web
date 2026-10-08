import { ProtectedRoute, useAuth } from '@tbe/auth';
import {
  Button,
  Card,
  CardContent,
  Input,
  useToast,
} from '@tbe/components/quizes';
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
  Search,
  Target,
  TrendingUp,
} from 'lucide-react';
import React, { useState } from 'react';

import { QuizzesNav } from '@/components/quizzes/QuizzesNav';

interface FilterBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  selectedTimeRange: string;
  setSelectedTimeRange: (range: string) => void;
  categories: string[];
}

function FilterBar({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  selectedTimeRange,
  setSelectedTimeRange,
  categories,
}: FilterBarProps) {
  return (
    <div className='flex flex-col sm:flex-row gap-4 mb-6'>
      <div className='relative flex-1'>
        <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
        <Input
          placeholder='Search attempts by category or quiz ID...'
          value={searchTerm}
          onChange={(e: { target: { value: string } }) =>
            setSearchTerm(e.target.value)
          }
          className='pl-10 bg-white border-gray-200'
        />
      </div>

      <select
        value={selectedCategory}
        onChange={(e) => setSelectedCategory(e.target.value)}
        className='px-3 py-2 border border-gray-200 rounded-lg bg-white text-gray-800 text-sm'
      >
        <option value=''>All Categories</option>
        {categories.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>

      <select
        value={selectedTimeRange}
        onChange={(e) => setSelectedTimeRange(e.target.value)}
        className='px-3 py-2 border border-gray-200 rounded-lg bg-white text-gray-800 text-sm'
      >
        <option value='7'>Last 7 days</option>
        <option value='30'>Last 30 days</option>
        <option value='90'>Last 90 days</option>
        <option value='365'>Last year</option>
        <option value='all'>All time</option>
      </select>
    </div>
  );
}

function AttemptCard({
  attempt,
  showDetails,
}: {
  attempt: QuizAttempt;
  showDetails: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800 border-green-200';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  return (
    <Card className='hover:shadow-md transition-all duration-200 border border-gray-200 bg-white rounded-xl mb-4'>
      <CardContent className='p-6'>
        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
          <div className='flex items-start gap-4'>
            <div className='w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-2xl shrink-0'>
              {attempt.categoryIcon || '💡'}
            </div>
            <div>
              <h3 className='font-bold text-lg text-gray-900 mb-1'>
                {attempt.categoryName}
              </h3>
              <div className='flex flex-wrap items-center gap-3 text-xs text-gray-500'>
                <span className='flex items-center gap-1'>
                  <Calendar className='w-3.5 h-3.5' />
                  {formatDate({ dateAndTime: attempt.completedAt }).date}
                </span>
                <span>•</span>
                <span className='flex items-center gap-1'>
                  <Clock className='w-3.5 h-3.5' />
                  {attempt.timeTaken}s
                </span>
                <span>•</span>
                <span className='flex items-center gap-1 text-primary font-medium'>
                  <Award className='w-3.5 h-3.5' />+{attempt.pointsEarned} pts
                </span>
              </div>
            </div>
          </div>

          <div className='flex items-center gap-4'>
            <div className='text-right'>
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-bold border ${getScoreBadge(
                  attempt.score,
                )}`}
              >
                {attempt.score}%
              </span>
              <p className='text-xs text-gray-500 mt-1'>
                {attempt.correctAnswers}/{attempt.totalQuestions} correct
              </p>
            </div>

            {showDetails && (
              <Button
                variant='ghost'
                size='sm'
                onClick={() => setExpanded(!expanded)}
                className='text-gray-500'
              >
                <Eye className='w-4 h-4 mr-1' />
                {expanded ? 'Hide' : 'Details'}
              </Button>
            )}
          </div>
        </div>

        {expanded && showDetails && (
          <div className='mt-4 pt-4 border-t border-gray-100 text-sm'>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <p className='text-xs font-semibold text-gray-500 uppercase'>
                  Accuracy
                </p>
                <p className={`font-bold ${getScoreColor(attempt.score)}`}>
                  {(
                    (attempt.correctAnswers / attempt.totalQuestions) *
                    100
                  ).toFixed(1)}
                  %
                </p>
              </div>
              <div>
                <p className='text-xs font-semibold text-gray-500 uppercase'>
                  Pace
                </p>
                <p className='font-bold text-gray-800'>
                  {Math.round(
                    (attempt.pointsEarned / (attempt.timeTaken || 1)) * 60,
                  )}{' '}
                  pts/min
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function HistoryContent() {
  const { user } = useAuth();
  useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTimeRange, setSelectedTimeRange] = useState('30');
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

  const categories = Array.from(
    new Set(attempts.map((attempt) => attempt.categoryName).filter(Boolean)),
  );

  const filteredAttempts = attempts.filter((attempt) => {
    const matchesSearch =
      searchTerm === '' ||
      attempt.categoryName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      attempt.quizId?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === '' || attempt.categoryName === selectedCategory;

    const matchesTimeRange =
      selectedTimeRange === 'all' ||
      new Date(attempt.completedAt).getTime() >=
        Date.now() - Number(selectedTimeRange) * 24 * 60 * 60 * 1000;

    return matchesSearch && matchesCategory && matchesTimeRange;
  });

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
    <div className='min-h-screen bg-gray-50 flex flex-col'>
      <QuizzesNav activeTab='history' />

      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full'>
        {/* Header */}
        <div className='mb-8'>
          <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
            <div>
              <h1 className='text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2'>
                <History className='w-8 h-8 text-primary' />
                Performance History
              </h1>
              <p className='text-gray-600 mt-1'>
                Review your quiz attempts, accuracy trends, and points earned.
              </p>
            </div>
            <Button
              onClick={() => refetchAttempts()}
              variant='outline'
              size='sm'
              disabled={attemptsLoading}
              className='bg-white'
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${
                  attemptsLoading ? 'animate-spin' : ''
                }`}
              />
              Refresh
            </Button>
          </div>
        </div>

        {/* Summary Metric Cards */}
        <div className='grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8'>
          <Card className='border border-gray-200 bg-white rounded-xl shadow-xs'>
            <CardContent className='p-5'>
              <div className='flex items-center space-x-3'>
                <div className='w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center shrink-0'>
                  <Target className='w-5 h-5' />
                </div>
                <div>
                  <p className='text-xs text-gray-500 font-medium'>
                    Total Attempts
                  </p>
                  <p className='text-2xl font-bold text-gray-900'>
                    {totalAttempts}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className='border border-gray-200 bg-white rounded-xl shadow-xs'>
            <CardContent className='p-5'>
              <div className='flex items-center space-x-3'>
                <div className='w-10 h-10 bg-green-50 text-green-600 rounded-lg flex items-center justify-center shrink-0'>
                  <TrendingUp className='w-5 h-5' />
                </div>
                <div>
                  <p className='text-xs text-gray-500 font-medium'>
                    Average Score
                  </p>
                  <p className='text-2xl font-bold text-gray-900'>
                    {averageScore}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className='border border-gray-200 bg-white rounded-xl shadow-xs'>
            <CardContent className='p-5'>
              <div className='flex items-center space-x-3'>
                <div className='w-10 h-10 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center shrink-0'>
                  <Clock className='w-5 h-5' />
                </div>
                <div>
                  <p className='text-xs text-gray-500 font-medium'>
                    Total Time
                  </p>
                  <p className='text-2xl font-bold text-gray-900'>
                    {Math.round(totalTimeSpent / 60)} min
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className='border border-gray-200 bg-white rounded-xl shadow-xs'>
            <CardContent className='p-5'>
              <div className='flex items-center space-x-3'>
                <div className='w-10 h-10 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center shrink-0'>
                  <Award className='w-5 h-5' />
                </div>
                <div>
                  <p className='text-xs text-gray-500 font-medium'>
                    Points Earned
                  </p>
                  <p className='text-2xl font-bold text-gray-900'>
                    {totalPoints}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <FilterBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedTimeRange={selectedTimeRange}
          setSelectedTimeRange={setSelectedTimeRange}
          categories={categories}
        />

        {/* List of Attempts */}
        {attemptsLoading ? (
          <div className='text-center py-12'>
            <RefreshCw className='w-8 h-8 animate-spin mx-auto text-primary mb-2' />
            <p className='text-gray-500 text-sm'>Loading quiz history...</p>
          </div>
        ) : filteredAttempts.length === 0 ? (
          <Card className='border border-gray-200 bg-white rounded-xl p-12 text-center'>
            <History className='w-12 h-12 text-gray-300 mx-auto mb-3' />
            <h3 className='text-lg font-bold text-gray-900 mb-1'>
              No Quiz Attempts Found
            </h3>
            <p className='text-gray-500 text-sm mb-6 max-w-md mx-auto'>
              You haven't completed any quizzes matching the current filter.
            </p>
            <Button
              variant='default'
              onClick={() => (window.location.href = '/quizzes/dashboard')}
            >
              Take Your First Quiz
            </Button>
          </Card>
        ) : (
          <div>
            {filteredAttempts.map((attempt) => (
              <AttemptCard
                key={attempt._id || Math.random().toString()}
                attempt={attempt}
                showDetails={showDetails}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default function HistoryPage() {
  return (
    <ProtectedRoute>
      <HistoryContent />
    </ProtectedRoute>
  );
}
