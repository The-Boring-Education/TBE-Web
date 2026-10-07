import { useAuth } from '@tbe/auth';
import { BarChart3, BookOpen, Brain, History, Trophy } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';

interface QuizzesNavProps {
  activeTab?: 'dashboard' | 'history' | 'leaderboard' | 'stats';
}

export const QuizzesNav: React.FC<QuizzesNavProps> = ({ activeTab }) => {
  const router = useRouter();
  useAuth();
  const currentPath = router.pathname;

  const isCurrent = (tab: string, pathPatterns: string[]) => {
    if (activeTab === tab) return true;
    return pathPatterns.some((pattern) => currentPath.includes(pattern));
  };

  const navItems = [
    {
      id: 'dashboard',
      label: 'All Quizzes',
      href: '/quizzes/dashboard',
      icon: BookOpen,
      isActive:
        isCurrent('dashboard', ['/quizzes/dashboard']) &&
        !currentPath.includes('/history') &&
        !currentPath.includes('/leaderboard') &&
        !currentPath.includes('/stats'),
    },
    {
      id: 'history',
      label: 'My History',
      href: '/quizzes/dashboard/history',
      icon: History,
      isActive: isCurrent('history', [
        '/quizzes/dashboard/history',
        '/quizzes/history',
      ]),
    },
    {
      id: 'leaderboard',
      label: 'Leaderboard',
      href: '/quizzes/dashboard/leaderboard',
      icon: Trophy,
      isActive: isCurrent('leaderboard', [
        '/quizzes/dashboard/leaderboard',
        '/quizzes/leaderboard',
      ]),
    },
    {
      id: 'stats',
      label: 'Performance',
      href: '/quizzes/dashboard/stats',
      icon: BarChart3,
      isActive: isCurrent('stats', [
        '/quizzes/dashboard/stats',
        '/quizzes/performance',
      ]),
    },
  ];

  return (
    <div className='w-full bg-white border-b border-gray-200 sticky top-16 z-40 shadow-xs'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex items-center justify-between py-3'>
          {/* Logo / Title */}
          <Link
            href='/quizzes'
            className='flex items-center gap-2.5 text-gray-900 hover:text-primary transition-colors group no-underline'
          >
            <div className='w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors'>
              <Brain className='w-4 h-4' />
            </div>
            <div>
              <span className='font-bold text-base leading-tight block'>
                Tech Quizzes
              </span>
              <span className='text-[10px] text-gray-500 block -mt-0.5'>
                Practice &amp; Learn
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className='flex items-center gap-1 sm:gap-2'>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all no-underline ${
                    item.isActive
                      ? 'bg-primary text-white shadow-xs'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className='w-4 h-4' />
                  <span className='hidden sm:inline'>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
