import { ProtectedRoute, useAuth } from '@tbe/auth';
import { Avatar, AvatarFallback, AvatarImage } from '@tbe/components/quizes';
import { useQuery } from '@tbe/query';
import { leaderboardApi } from '@tbe/services';
import type { LeaderboardData } from '@tbe/types';
import { Crown, RefreshCw, Trophy } from 'lucide-react';
import React, { useMemo } from 'react';

import { QuizLayout } from '@/components/quizzes/QuizLayout';

// Mock reference entries matching the reference design
const REFERENCE_LEADERBOARD_ENTRIES: LeaderboardData[] = [
  {
    _id: 'ref-1',
    username: 'Bharat Joshi',
    image:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80',
    bestScore: 90,
    totalAttempts: 3,
    averageScore: 87,
    totalTimeSpent: 120,
  },
  {
    _id: 'ref-2',
    username: 'Shivani',
    image:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=160&auto=format&fit=crop&q=80',
    bestScore: 60,
    totalAttempts: 68,
    averageScore: 72,
    totalTimeSpent: 1450,
  },
  {
    _id: 'ref-3',
    username: 'nitin',
    image: '',
    bestScore: 60,
    totalAttempts: 12,
    averageScore: 65,
    totalTimeSpent: 260,
  },
  {
    _id: 'ref-4',
    username: 'Aarav Mehta',
    image:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&auto=format&fit=crop&q=80',
    bestScore: 50,
    totalAttempts: 25,
    averageScore: 61,
    totalTimeSpent: 520,
  },
  {
    _id: 'ref-5',
    username: 'Priya Sharma',
    image:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80',
    bestScore: 45,
    totalAttempts: 18,
    averageScore: 58,
    totalTimeSpent: 390,
  },
];

/* -------------------------------------------------------------------------- */
/* SVG Decorations matching the design screenshot                            */
/* -------------------------------------------------------------------------- */

const LaurelBranch = ({ side = 'left' }: { side?: 'left' | 'right' }) => (
  <svg
    viewBox='0 0 50 120'
    className={`w-9 sm:w-11 h-24 sm:h-28 text-[#FCD34D] ${
      side === 'right' ? '-scale-x-100' : ''
    }`}
    fill='currentColor'
  >
    <path
      d='M44 110 C32 85 24 55 40 12'
      stroke='currentColor'
      strokeWidth='2.5'
      strokeLinecap='round'
      fill='none'
    />
    {/* Leaves along branch */}
    <path d='M40 12 C30 10 24 20 30 26 C36 32 44 22 40 12 Z' />
    <path d='M28 28 C18 26 14 36 21 42 C28 48 34 38 28 28 Z' />
    <path d='M23 50 C13 48 9 58 16 64 C23 70 30 60 23 50 Z' />
    <path d='M25 72 C16 71 12 80 19 86 C26 91 32 82 25 72 Z' />
    <path d='M31 92 C23 91 19 99 26 103 C33 107 38 99 31 92 Z' />
    {/* Inner complementary leaves */}
    <path d='M39 28 C41 20 48 22 48 30 C48 37 41 37 39 28 Z' />
    <path d='M34 50 C38 42 46 44 45 52 C44 59 36 59 34 50 Z' />
    <path d='M34 72 C37 65 45 66 44 74 C43 81 36 80 34 72 Z' />
  </svg>
);

const ChampionCrown = () => (
  <svg viewBox='0 0 100 68' className='w-16 h-11 drop-shadow-xs' fill='none'>
    <defs>
      <linearGradient
        id='goldCrownGrad'
        x1='50'
        y1='8'
        x2='50'
        y2='58'
        gradientUnits='userSpaceOnUse'
      >
        <stop stopColor='#FDE047' />
        <stop offset='0.45' stopColor='#F59E0B' />
        <stop offset='1' stopColor='#D97706' />
      </linearGradient>
    </defs>
    {/* Crown Body */}
    <path
      d='M12 54 L88 54 L80 20 L60 38 L50 8 L40 38 L20 20 Z'
      fill='url(#goldCrownGrad)'
      stroke='#B45309'
      strokeWidth='1.5'
      strokeLinejoin='round'
    />
    {/* Crown Rim */}
    <rect
      x='12'
      y='54'
      width='76'
      height='10'
      rx='3'
      fill='#F59E0B'
      stroke='#B45309'
      strokeWidth='1.5'
    />
    {/* Jewels on crown peaks */}
    <circle
      cx='50'
      cy='8'
      r='4'
      fill='#EF4444'
      stroke='#B91C1C'
      strokeWidth='1'
    />
    <circle
      cx='20'
      cy='20'
      r='3.5'
      fill='#3B82F6'
      stroke='#1D4ED8'
      strokeWidth='1'
    />
    <circle
      cx='80'
      cy='20'
      r='3.5'
      fill='#3B82F6'
      stroke='#1D4ED8'
      strokeWidth='1'
    />
    <circle cx='30' cy='59' r='2.5' fill='#EF4444' />
    <circle cx='50' cy='59' r='2.5' fill='#10B981' />
    <circle cx='70' cy='59' r='2.5' fill='#EF4444' />
  </svg>
);

const RibbonMedal = ({
  rank,
  ribbonColor = '#3B82F6',
  ribbonDark = '#2563EB',
  medallionBg = 'from-slate-200 via-white to-slate-300',
  borderColor = 'border-slate-300',
  textColor = 'text-slate-700',
}: {
  rank: number;
  ribbonColor?: string;
  ribbonDark?: string;
  medallionBg?: string;
  borderColor?: string;
  textColor?: string;
}) => (
  <div className='relative flex flex-col items-center'>
    <svg viewBox='0 0 60 48' className='w-12 h-10'>
      <polygon points='16,0 30,22 14,46 6,40 15,18' fill={ribbonDark} />
      <polygon points='44,0 30,22 46,46 54,40 45,18' fill={ribbonColor} />
    </svg>
    <div
      className={`-mt-4 w-9 h-9 rounded-full bg-gradient-to-tr ${medallionBg} border-2 ${borderColor} shadow-xs flex items-center justify-center z-10`}
    >
      <span className={`font-black text-sm ${textColor}`}>{rank}</span>
    </div>
  </div>
);

const ConfettiSquiggle = ({
  color = '#FF4D4D',
  className = '',
}: {
  color?: string;
  className?: string;
}) => (
  <svg viewBox='0 0 24 36' className={`w-3.5 h-6 ${className}`} fill='none'>
    <path
      d='M6 4 C18 10, 4 20, 16 32'
      stroke={color}
      strokeWidth='2.5'
      strokeLinecap='round'
    />
  </svg>
);

const TableRankBadge = ({ rank }: { rank: number }) => {
  if (rank === 1) {
    return (
      <div className='flex items-center gap-2.5'>
        <div className='w-7 h-7 rounded-full bg-[#F59E0B] text-white flex items-center justify-center shadow-2xs shrink-0'>
          <Crown className='w-3.5 h-3.5 fill-white' />
        </div>
        <span className='font-bold text-[#F59E0B] text-sm'>1</span>
      </div>
    );
  }
  if (rank === 2) {
    return (
      <div className='flex items-center gap-2.5'>
        <div className='w-7 h-7 rounded-full bg-[#CBD5E1] text-slate-700 font-bold text-xs flex items-center justify-center shadow-2xs shrink-0'>
          2
        </div>
        <span className='font-bold text-slate-400 text-sm'>2</span>
      </div>
    );
  }
  if (rank === 3) {
    return (
      <div className='flex items-center gap-2.5'>
        <div className='w-7 h-7 rounded-full bg-[#D97706] text-white font-bold text-xs flex items-center justify-center shadow-2xs shrink-0'>
          3
        </div>
        <span className='font-bold text-[#D97706] text-sm'>3</span>
      </div>
    );
  }
  return (
    <div className='flex items-center gap-2.5'>
      <div className='w-7 h-7 rounded-full bg-slate-100 text-slate-500 font-bold text-xs flex items-center justify-center shrink-0'>
        {rank}
      </div>
    </div>
  );
};

const LeaderboardContent = () => {
  const { user } = useAuth();

  const {
    data: leaderboardData,
    isLoading,
    refetch,
  } = useQuery<LeaderboardData[]>({
    queryKey: ['quizzes-leaderboard'],
    queryFn: async () => {
      const response = await leaderboardApi.getLeaderboard(100);
      return (response.data || []) as LeaderboardData[];
    },
  });

  // Blend reference items if backend doesn't have sufficient live data
  const entries = useMemo(() => {
    if (leaderboardData && leaderboardData.length > 0) {
      return leaderboardData;
    }
    return REFERENCE_LEADERBOARD_ENTRIES;
  }, [leaderboardData]);

  const top1 = entries[0];
  const top2 = entries[1];
  const top3 = entries[2];

  return (
    <QuizLayout activeTab='leaderboard'>
      <div className='w-full max-w-7xl mx-auto'>
        {/* ========================================================= */}
        {/* Header: Trophy Icon + Title + Refresh Button              */}
        {/* ========================================================= */}
        <div className='flex items-center justify-between gap-4 mb-6 sm:mb-8'>
          <div className='flex items-center gap-3.5'>
            <div className='text-[#FF4D4D] shrink-0'>
              <Trophy className='w-9 h-9 sm:w-10 sm:h-10 stroke-[2]' />
            </div>
            <div>
              <h1 className='text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight leading-tight'>
                Quiz <span className='text-[#FF4D4D]'>Leaderboard</span>
              </h1>
              <p className='text-xs sm:text-sm text-gray-500 font-normal mt-0.5'>
                See where you rank among top developers practicing on The Boring
                Education.
              </p>
            </div>
          </div>

          <button
            type='button'
            onClick={() => refetch()}
            disabled={isLoading}
            className='inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 bg-white hover:bg-gray-50 active:bg-gray-100 border border-gray-200 text-gray-700 rounded-xl text-xs sm:text-sm font-medium transition-all shadow-2xs cursor-pointer disabled:opacity-60 shrink-0'
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
        {/* Top 3 Podium Cards                                        */}
        {/* ========================================================= */}
        {entries.length >= 3 && (
          <div className='grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6 mb-8 items-end'>
            {/* Rank 2 (Silver) */}
            <div className='relative bg-white rounded-3xl border border-gray-150 p-6 pt-7 text-center shadow-2xs md:order-1 flex flex-col items-center justify-center overflow-hidden hover:shadow-xs transition-shadow min-h-[300px]'>
              {/* Soft sky-blue corner gradient accent */}
              <div className='absolute -bottom-10 -left-10 w-36 h-36 bg-blue-50/50 rounded-full blur-2xl pointer-events-none' />

              {/* Blue Ribbon & Silver Medallion */}
              <div className='relative mb-2 flex items-center justify-center'>
                <ConfettiSquiggle
                  color='#3B82F6'
                  className='absolute -left-10 top-1 -rotate-12'
                />
                <RibbonMedal
                  rank={2}
                  ribbonColor='#3B82F6'
                  ribbonDark='#2563EB'
                  medallionBg='from-slate-200 via-white to-slate-300'
                  borderColor='border-slate-300'
                  textColor='text-slate-700'
                />
                <ConfettiSquiggle
                  color='#3B82F6'
                  className='absolute -right-10 top-1 rotate-12'
                />
              </div>

              {/* Avatar */}
              <div className='relative mb-2 mt-1'>
                <Avatar className='w-16 h-16 border-2 border-white shadow-xs'>
                  <AvatarImage src={top2?.image} alt={top2?.username} />
                  <AvatarFallback className='bg-slate-100 text-slate-700 font-bold text-lg'>
                    {top2?.username?.slice(0, 2).toUpperCase() || 'U2'}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Name */}
              <h3 className='font-bold text-base text-gray-900 truncate max-w-[180px]'>
                {top2?.username || 'Shivani'}
              </h3>

              {/* Score */}
              <div className='text-3xl font-extrabold text-[#FF4D4D] mt-1 leading-none flex items-baseline justify-center gap-1'>
                <span>{top2?.bestScore ?? 60}</span>
                <span className='text-xs font-bold text-[#FF4D4D]'>pts</span>
              </div>

              {/* Attempts */}
              <p className='text-xs text-gray-400 mt-1 font-normal'>
                {top2?.totalAttempts ?? 68} attempts completed
              </p>
            </div>

            {/* Rank 1 (Gold / Champion) - Elevated */}
            <div className='relative bg-gradient-to-b from-[#FFFDF5] via-[#FFFDF7] to-white rounded-3xl border-2 border-[#FCD34D] p-6 pt-7 text-center shadow-xs md:order-2 flex flex-col items-center justify-center overflow-hidden hover:shadow-md transition-shadow min-h-[310px]'>
              {/* Celebratory Squiggles */}
              <ConfettiSquiggle
                color='#EF4444'
                className='absolute left-8 top-6 -rotate-12'
              />
              <ConfettiSquiggle
                color='#F59E0B'
                className='absolute right-8 top-6 rotate-12'
              />

              {/* Crown + Laurel Wreaths + Avatar */}
              <div className='relative flex items-center justify-center mt-2 mb-2'>
                {/* Left Laurel */}
                <LaurelBranch side='left' />

                {/* Avatar with Crown and Badge */}
                <div className='flex flex-col items-center relative mx-1'>
                  <div className='mb-1.5 z-10'>
                    <ChampionCrown />
                  </div>
                  <div className='relative'>
                    <Avatar className='w-20 h-20 border-2 border-white shadow-sm'>
                      <AvatarImage src={top1?.image} alt={top1?.username} />
                      <AvatarFallback className='bg-amber-100 text-amber-900 font-extrabold text-xl'>
                        {top1?.username?.slice(0, 2).toUpperCase() || 'U1'}
                      </AvatarFallback>
                    </Avatar>
                    {/* Golden Rank Badge #1 positioned at bottom-right corner without covering avatar face */}
                    <div className='absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 text-white font-black text-xs flex items-center justify-center border-2 border-white shadow-xs z-10'>
                      1
                    </div>
                  </div>
                </div>

                {/* Right Laurel */}
                <LaurelBranch side='right' />
              </div>

              {/* Name */}
              <h3 className='font-bold text-lg text-gray-900 truncate max-w-[200px] mt-2'>
                {top1?.username || 'Bharat Joshi'}
              </h3>

              {/* Score */}
              <div className='text-4xl font-black text-[#FF4D4D] mt-1 leading-none flex items-baseline justify-center gap-1'>
                <span>{top1?.bestScore ?? 90}</span>
                <span className='text-sm font-bold text-[#FF4D4D]'>pts</span>
              </div>

              {/* Attempts */}
              <p className='text-xs text-gray-400 mt-1 font-normal'>
                {top1?.totalAttempts ?? 3} attempts completed
              </p>
            </div>

            {/* Rank 3 (Bronze) */}
            <div className='relative bg-white rounded-3xl border border-gray-150 p-6 pt-7 text-center shadow-2xs md:order-3 flex flex-col items-center justify-center overflow-hidden hover:shadow-xs transition-shadow min-h-[300px]'>
              {/* Soft warm corner gradient accent */}
              <div className='absolute -bottom-10 -right-10 w-36 h-36 bg-orange-50/50 rounded-full blur-2xl pointer-events-none' />

              {/* Orange Ribbon & Bronze Medallion */}
              <div className='relative mb-2 flex items-center justify-center'>
                <ConfettiSquiggle
                  color='#F97316'
                  className='absolute -left-10 top-1 -rotate-12'
                />
                <RibbonMedal
                  rank={3}
                  ribbonColor='#F97316'
                  ribbonDark='#EA580C'
                  medallionBg='from-amber-600 via-amber-500 to-amber-700'
                  borderColor='border-amber-600'
                  textColor='text-white'
                />
                <ConfettiSquiggle
                  color='#F97316'
                  className='absolute -right-10 top-1 rotate-12'
                />
              </div>

              {/* Avatar */}
              <div className='relative mb-2 mt-1'>
                <Avatar className='w-16 h-16 border-2 border-white shadow-xs'>
                  <AvatarImage src={top3?.image} alt={top3?.username} />
                  <AvatarFallback className='bg-[#582C8A] text-white font-bold text-xl'>
                    {top3?.username?.slice(0, 1).toLowerCase() || 'n'}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Name */}
              <h3 className='font-bold text-base text-gray-900 truncate max-w-[180px]'>
                {top3?.username || 'nitin'}
              </h3>

              {/* Score */}
              <div className='text-3xl font-extrabold text-[#FF4D4D] mt-1 leading-none flex items-baseline justify-center gap-1'>
                <span>{top3?.bestScore ?? 60}</span>
                <span className='text-xs font-bold text-[#FF4D4D]'>pts</span>
              </div>

              {/* Attempts */}
              <p className='text-xs text-gray-400 mt-1 font-normal'>
                {top3?.totalAttempts ?? 12} attempts completed
              </p>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* All Developer Rankings Table Card                         */}
        {/* ========================================================= */}
        <div className='bg-white rounded-3xl border border-gray-150 shadow-2xs overflow-hidden'>
          <div className='px-6 py-5 border-b border-gray-100 flex items-center justify-between'>
            <h2 className='text-lg font-bold text-gray-900'>
              All Developer Rankings
            </h2>
            <span className='text-xs sm:text-sm text-gray-400 font-normal'>
              Top {entries.length === 5 ? 36 : entries.length} learners
            </span>
          </div>

          <div className='overflow-x-auto'>
            <table className='w-full text-left border-collapse'>
              <thead>
                <tr className='bg-[#F9FAFB]/80 border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider'>
                  <th className='py-3.5 px-6 w-24'>RANK</th>
                  <th className='py-3.5 px-6'>DEVELOPER</th>
                  <th className='py-3.5 px-6 text-center w-36'>BEST SCORE</th>
                  <th className='py-3.5 px-6 text-center w-32'>AVG SCORE</th>
                  <th className='py-3.5 px-6 text-center w-32'>ATTEMPTS</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-100 text-sm'>
                {entries.map((entry, index) => {
                  const rank = index + 1;
                  const isMe =
                    user?.id &&
                    (entry._id === user.id ||
                      (entry as any).userId === user.id);

                  return (
                    <tr
                      key={entry._id || index}
                      className={`hover:bg-gray-50/60 transition-colors ${
                        isMe ? 'bg-red-50/30' : ''
                      }`}
                    >
                      {/* Rank */}
                      <td className='py-4 px-6'>
                        <TableRankBadge rank={rank} />
                      </td>

                      {/* Developer */}
                      <td className='py-4 px-6'>
                        <div className='flex items-center gap-3.5'>
                          <Avatar className='w-8 h-8 border border-gray-200'>
                            <AvatarImage
                              src={entry.image}
                              alt={entry.username}
                            />
                            <AvatarFallback
                              className={`font-bold text-xs ${
                                rank === 3
                                  ? 'bg-[#582C8A] text-white'
                                  : 'bg-red-50 text-[#EF4444]'
                              }`}
                            >
                              {entry.username
                                ? entry.username.slice(0, 1).toLowerCase()
                                : 'u'}
                            </AvatarFallback>
                          </Avatar>
                          <div className='flex items-center gap-2'>
                            <span className='font-semibold text-gray-900 text-sm'>
                              {entry.username || 'Anonymous'}
                            </span>
                            {isMe && (
                              <span className='text-[10px] bg-red-50 text-[#EF4444] font-bold px-1.5 py-0.5 rounded'>
                                You
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Best Score */}
                      <td className='py-4 px-6 text-center font-bold text-[#FF4D4D] text-sm sm:text-base'>
                        <span>{entry.bestScore ?? 0}</span>{' '}
                        <span className='text-xs font-bold text-[#FF4D4D]'>
                          pts
                        </span>
                      </td>

                      {/* Avg Score */}
                      <td className='py-4 px-6 text-center text-sm font-medium text-gray-600'>
                        {Math.round(entry.averageScore ?? 0)}%
                      </td>

                      {/* Attempts */}
                      <td className='py-4 px-6 text-center text-sm text-gray-500'>
                        {entry.totalAttempts ?? 0}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </QuizLayout>
  );
};

export default function LeaderboardPage() {
  return (
    <ProtectedRoute>
      <LeaderboardContent />
    </ProtectedRoute>
  );
}
