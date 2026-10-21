import { ProtectedRoute, useAuth } from '@tbe/auth';
import { Button, LoadingSpinner } from '@tbe/components';
import { useQuizData } from '@tbe/hooks';
import { gamificationApi } from '@tbe/services';
import { Flame } from 'lucide-react';
import { useRouter } from 'next/router';
import React, { useEffect, useMemo, useRef, useState } from 'react';

import type { QuizCardData } from '@/components/quizzes/QuizCard';
import { QuizCard } from '@/components/quizzes/QuizCard';
import { QuizHeroBanner } from '@/components/quizzes/QuizHeroBanner';
import { QuizLayout } from '@/components/quizzes/QuizLayout';
import { getTechMeta } from '@/components/quizzes/QuizTechIcon';

const FILTER_TABS = [
  'All',
  'Web Development',
  'Programming',
  'Databases',
  'Core Subjects',
] as const;
type FilterTab = (typeof FILTER_TABS)[number];

// Default mock/reference quizzes from the design mockups
const POPULAR_QUIZZES_REFERENCE: QuizCardData[] = [
  {
    id: 'nodejs-challenge',
    title: 'Node.js Challenge',
    description: 'Test your knowledge and skills with our Node.js Challenge!',
    categoryBadge: 'Backend',
    categoryColor: 'bg-[#E7F8EE] text-[#0F9548]',
    questionsCount: 20,
    durationMinutes: 20,
    popularity: '1.2K',
  },
  {
    id: 'cpp-mastery-quiz',
    title: 'C++ Mastery Quiz',
    description: 'Test your C++ skills with this concise quiz!',
    categoryBadge: 'Programming',
    categoryColor: 'bg-[#EAF3FF] text-[#2F80ED]',
    questionsCount: 25,
    durationMinutes: 25,
    popularity: '890',
  },
  {
    id: 'sql-mastery-quiz',
    title: 'SQL Mastery Quiz',
    description: 'Test your SQL skills with our engaging SQL Mastery Quiz!',
    categoryBadge: 'Database',
    categoryColor: 'bg-[#F3EAFF] text-[#8C3BE2]',
    questionsCount: 20,
    durationMinutes: 20,
    popularity: '1.1K',
  },
  {
    id: 'javascript-quiz',
    title: 'JavaScript Quiz',
    description: 'Test your JavaScript skills with this engaging quiz!',
    categoryBadge: 'Frontend',
    categoryColor: 'bg-[#FFF6E5] text-[#D9822B]',
    questionsCount: 25,
    durationMinutes: 25,
    popularity: '1.5K',
  },
  {
    id: 'reactjs-quiz',
    title: 'React.js Quiz',
    description: 'Test your React.js skills with this concise quiz!',
    categoryBadge: 'Frontend',
    categoryColor: 'bg-[#FFF6E5] text-[#D9822B]',
    questionsCount: 20,
    durationMinutes: 20,
    popularity: '980',
  },
  {
    id: 'java-mastery-quiz',
    title: 'Java Mastery Quiz',
    description: 'Test your Java skills with this concise quiz!',
    categoryBadge: 'Programming',
    categoryColor: 'bg-[#EAF3FF] text-[#2F80ED]',
    questionsCount: 25,
    durationMinutes: 25,
    popularity: '1.3K',
  },
  {
    id: 'python-quiz',
    title: 'Python Quiz',
    description: 'Test your Python skills with this engaging quiz!',
    categoryBadge: 'Programming',
    categoryColor: 'bg-[#EAF3FF] text-[#2F80ED]',
    questionsCount: 20,
    durationMinutes: 20,
    popularity: '1.2K',
  },
  {
    id: 'git-github-quiz',
    title: 'Git & GitHub Quiz',
    description: 'Test your Git and GitHub skills with this concise quiz!',
    categoryBadge: 'Tools',
    categoryColor: 'bg-[#FEEAEA] text-[#EB5757]',
    questionsCount: 20,
    durationMinutes: 20,
    popularity: '1.0K',
  },
];

// Canonical tech key for deduplication across DB categories and reference quizzes
const getCanonicalTechKey = (nameOrIcon: string = ''): string => {
  const meta = getTechMeta(nameOrIcon);
  if (meta.type && meta.type !== 'generic') {
    return meta.type;
  }
  return nameOrIcon
    .toLowerCase()
    .replace(/quiz|mastery|challenge|questions|assessment|test/gi, '')
    .trim();
};

function DashboardContent() {
  const { user } = useAuth();
  const router = useRouter();
  const { categories, loading, error, refetch } = useQuizData();
  const [selectedFilter, setSelectedFilter] = useState<FilterTab>('All');
  const popularSectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const effectiveUserId = (user as any)?._id || user?.id;
    if (!effectiveUserId) return;

    gamificationApi
      .getuserGamificationPoints(effectiveUserId)
      .catch((err: any) => {
        console.error('Failed to load gamification points:', err);
      });
  }, [user]);

  // Merge real DB categories with reference quiz metadata and strictly deduplicate by tech key
  const allQuizzes: QuizCardData[] = useMemo(() => {
    if (!categories || categories.length === 0) {
      return POPULAR_QUIZZES_REFERENCE;
    }

    // Map DB categories to QuizCardData
    const mappedDbQuizzes: QuizCardData[] = categories.map((cat) => {
      const meta = getTechMeta(cat.categoryName || cat.categoryIcon || '');
      const techKey = getCanonicalTechKey(
        cat.categoryName || cat.categoryIcon || '',
      );
      const matchingRef = POPULAR_QUIZZES_REFERENCE.find(
        (ref) => getCanonicalTechKey(ref.title || ref.icon || '') === techKey,
      );

      return {
        id: cat._id,
        title: matchingRef?.title || cat.categoryName,
        description:
          (cat.categoryDescription && cat.categoryDescription.trim().length > 0
            ? cat.categoryDescription
            : matchingRef?.description) ||
          `Test your ${cat.categoryName} skills with this concise quiz!`,
        icon: cat.categoryIcon || matchingRef?.icon,
        categoryBadge: meta.category,
        categoryColor: meta.categoryColor,
        questionsCount:
          (cat as any).questionCount ||
          matchingRef?.questionsCount ||
          meta.defaultQuestions,
        durationMinutes: matchingRef?.durationMinutes || meta.defaultMinutes,
        popularity: matchingRef?.popularity || meta.defaultPopularity,
      };
    });

    // Track already seen tech keys to prevent any duplicate cards (e.g. Python appearing twice)
    const seenTechKeys = new Set<string>();
    const deduplicatedDbQuizzes: QuizCardData[] = [];
    for (const q of mappedDbQuizzes) {
      const key = getCanonicalTechKey(q.title || q.icon || '');
      if (!seenTechKeys.has(key)) {
        seenTechKeys.add(key);
        deduplicatedDbQuizzes.push(q);
      }
    }

    // Only add reference quizzes whose tech key was NOT already provided by DB
    const complementaryQuizzes = POPULAR_QUIZZES_REFERENCE.filter((ref) => {
      const key = getCanonicalTechKey(ref.title || ref.icon || '');
      if (seenTechKeys.has(key)) {
        return false;
      }
      seenTechKeys.add(key);
      return true;
    });

    return [...deduplicatedDbQuizzes, ...complementaryQuizzes];
  }, [categories]);

  // Filter quizzes based on selected category tab
  const filteredQuizzes = useMemo(() => {
    if (selectedFilter === 'All') return allQuizzes;
    return allQuizzes.filter((quiz) => {
      const meta = getTechMeta(quiz.title || quiz.icon || '');
      return meta.filterTab === selectedFilter;
    });
  }, [allQuizzes, selectedFilter]);

  const startQuiz = (quizId: string) => {
    // 1. Exact ID match
    const byId = categories?.find((c) => c._id === quizId);
    if (byId) {
      router.push(`/quizzes/${byId._id}`);
      return;
    }

    // 2. Tech key match with real DB category
    const quizTechKey = getCanonicalTechKey(quizId);
    const byTechKey = categories?.find(
      (c) =>
        getCanonicalTechKey(c.categoryName || c.categoryIcon || '') ===
        quizTechKey,
    );
    if (byTechKey) {
      router.push(`/quizzes/${byTechKey._id}`);
      return;
    }

    // 3. Substring match
    const byName = categories?.find((c) =>
      c.categoryName
        .toLowerCase()
        .includes(quizId.replace(/-/g, ' ').toLowerCase()),
    );
    if (byName) {
      router.push(`/quizzes/${byName._id}`);
      return;
    }

    router.push(`/quizzes/${quizId}`);
  };

  const handleStartPracticing = () => {
    if (popularSectionRef.current) {
      popularSectionRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    } else if (filteredQuizzes.length > 0) {
      startQuiz(filteredQuizzes[0].id);
    }
  };

  if (loading) {
    return (
      <QuizLayout activeTab='dashboard'>
        <div className='flex items-center justify-center min-h-[50vh] p-8'>
          <LoadingSpinner label='Loading quizzes...' />
        </div>
      </QuizLayout>
    );
  }

  if (error) {
    return (
      <QuizLayout activeTab='dashboard'>
        <div className='flex items-center justify-center min-h-[50vh] p-8'>
          <div className='text-center bg-white p-8 rounded-3xl border border-gray-200/90 shadow-xs max-w-md'>
            <p className='text-red-600 mb-4 font-semibold'>{error}</p>
            <Button onClick={refetch} variant='OUTLINE'>
              Try Again
            </Button>
          </div>
        </div>
      </QuizLayout>
    );
  }

  return (
    <QuizLayout activeTab='dashboard'>
      <div className='w-full'>
        {/* ========================================================= */}
        {/* 1. Hero Mascot Banner                                    */}
        {/* ========================================================= */}
        <QuizHeroBanner onStartPracticing={handleStartPracticing} />

        {/* ========================================================= */}
        {/* 2. Popular Quizzes Section Header & Category Filters     */}
        {/* ========================================================= */}
        <div
          ref={popularSectionRef}
          className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-5 scroll-mt-20'
        >
          <div>
            <h2 className='text-xl sm:text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2'>
              <Flame className='w-5 h-5 text-[#EF4444] fill-[#EF4444]' />
              <span>Popular Quizzes</span>
            </h2>
            <p className='text-xs sm:text-[13px] text-gray-500 mt-0.5 font-medium'>
              Choose a topic and start your timed assessment.
            </p>
          </div>

          {/* Category Filter Pills on the right */}
          <div className='flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-1'>
            {FILTER_TABS.map((tab) => {
              const isSelected = selectedFilter === tab;
              return (
                <button
                  key={tab}
                  type='button'
                  onClick={() => setSelectedFilter(tab)}
                  className={`px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                    isSelected
                      ? 'bg-[#EF4444] text-white shadow-2xs font-semibold'
                      : 'bg-white text-gray-600 hover:text-gray-900 border border-gray-200/80 hover:border-gray-300'
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>
        </div>

        {/* ========================================================= */}
        {/* 3. Quiz Cards Grid (Equal height & spacing, no cropping) */}
        {/* ========================================================= */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
          {filteredQuizzes.map((quiz) => (
            <QuizCard key={quiz.id} quiz={quiz} onStart={startQuiz} />
          ))}
        </div>
      </div>
    </QuizLayout>
  );
}

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
