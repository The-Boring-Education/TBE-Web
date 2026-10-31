import {
  BarChart3,
  BookOpen,
  Brain,
  Flame,
  History,
  Trophy,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { type ReactNode } from 'react';

export type QuizTabId = 'dashboard' | 'history' | 'leaderboard' | 'stats';

interface QuizLayoutProps {
  children: ReactNode;
  activeTab: QuizTabId;
}

export const QuizLayout: React.FC<QuizLayoutProps> = ({
  children,
  activeTab,
}) => {
  const router = useRouter();
  const currentPath = router.pathname;

  const isCurrent = (tab: QuizTabId, pathPatterns: string[]) => {
    if (activeTab === tab) return true;
    return pathPatterns.some((pattern) => currentPath.includes(pattern));
  };

  const navItems = [
    {
      id: 'dashboard' as QuizTabId,
      label: 'All Quizzes',
      shortLabel: 'Quizzes',
      href: '/quizzes/dashboard',
      icon: BookOpen,
      isActive:
        isCurrent('dashboard', ['/quizzes/dashboard']) &&
        !currentPath.includes('/history') &&
        !currentPath.includes('/leaderboard') &&
        !currentPath.includes('/stats'),
    },
    {
      id: 'history' as QuizTabId,
      label: 'My History',
      shortLabel: 'History',
      href: '/quizzes/dashboard/history',
      icon: History,
      isActive: isCurrent('history', [
        '/quizzes/dashboard/history',
        '/quizzes/history',
      ]),
    },
    {
      id: 'leaderboard' as QuizTabId,
      label: 'Leaderboard',
      shortLabel: 'Leaderboard',
      href: '/quizzes/dashboard/leaderboard',
      icon: Trophy,
      isActive: isCurrent('leaderboard', [
        '/quizzes/dashboard/leaderboard',
        '/quizzes/leaderboard',
      ]),
    },
    {
      id: 'stats' as QuizTabId,
      label: 'Performance',
      shortLabel: 'Stats',
      href: '/quizzes/dashboard/stats',
      icon: BarChart3,
      isActive: isCurrent('stats', [
        '/quizzes/dashboard/stats',
        '/quizzes/performance',
      ]),
    },
  ];

  return (
    <div className='min-h-screen bg-gray-50/50 flex flex-col'>
      <div className='flex flex-1 w-full'>
        {/* ========================================================= */}
        {/* Desktop Sidebar Navigation (Hidden on Mobile)             */}
        {/* ========================================================= */}
        <aside className='hidden md:flex md:w-64 flex-col justify-between shrink-0 bg-white border-r border-gray-150/80 sticky top-20 h-[calc(100vh-5rem)] p-4 z-20'>
          <div>
            {/* Header: Tech Quizzes / Practice & Learn */}
            <Link
              href='/quizzes'
              className='flex items-center gap-2.5 p-2 rounded-xl hover:bg-gray-50 transition-colors group no-underline mb-4'
            >
              <div className='w-8 h-8 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center text-[#EF4444] group-hover:bg-[#EF4444] group-hover:text-white transition-all shadow-2xs shrink-0'>
                <Brain className='w-4 h-4' />
              </div>
              <div className='flex flex-col'>
                <span className='font-bold text-sm text-gray-900 group-hover:text-[#EF4444] transition-colors leading-tight'>
                  Tech Quizzes
                </span>
                <span className='text-[10px] text-gray-400 font-medium'>
                  Practice &amp; Learn
                </span>
              </div>
            </Link>

            {/* Sidebar Navigation Items */}
            <nav className='flex flex-col gap-1' aria-label='Quiz navigation'>
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = item.isActive;
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all no-underline ${
                      active
                        ? 'bg-[#FFF5F5] text-[#EF4444] font-bold border border-red-100/90 shadow-2xs'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 border border-transparent'
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 transition-colors shrink-0 ${
                        active ? 'text-[#EF4444]' : 'text-gray-400'
                      }`}
                    />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Sidebar Footer: Daily Practice Motivation Box (No mascot image as requested) */}
          <div className='rounded-2xl bg-gradient-to-b from-[#FFF7F6] to-[#FFF1EF] border border-[#FFE8E4] p-3.5 shadow-2xs'>
            <div className='flex items-center gap-2 mb-1'>
              <div className='w-6 h-6 rounded-lg bg-[#FFE6E2] flex items-center justify-center text-[#EF4444] shrink-0'>
                <Flame className='w-3.5 h-3.5 fill-[#EF4444]' />
              </div>
              <span className='text-xs font-bold text-gray-900'>
                Daily Consistency
              </span>
            </div>
            <p className='text-[11px] text-gray-500 leading-relaxed'>
              1 short quiz every day compounds to mastery in technical interview
              rounds.
            </p>
          </div>
        </aside>

        {/* ========================================================= */}
        {/* Main Content Area (Expansive Full Space)                  */}
        {/* ========================================================= */}
        <main className='flex-1 min-w-0 w-full p-3.5 sm:p-4 md:p-4 lg:p-4 pb-20 md:pb-8'>
          {children}
        </main>
      </div>

      {/* ========================================================= */}
      {/* Mobile Bottom Navigation Bar (Hidden on Desktop)          */}
      {/* ========================================================= */}
      <nav
        className='md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-gray-200/80 shadow-sm px-2 py-1.5 flex items-center justify-around'
        aria-label='Mobile quiz navigation'
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.isActive;
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-3 transition-colors no-underline ${
                active ? 'text-[#EF4444]' : 'text-gray-400 hover:text-gray-700'
              }`}
            >
              <Icon
                className={`w-4 h-4 transition-colors ${
                  active ? 'text-[#EF4444]' : 'text-gray-400'
                }`}
              />
              <span
                className={`text-[10px] mt-1 tracking-tight ${
                  active
                    ? 'font-bold text-[#EF4444]'
                    : 'font-medium text-gray-500'
                }`}
              >
                {item.shortLabel}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};
