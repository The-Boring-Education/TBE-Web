import { ProtectedRoute, useAuth } from '@tbe/auth';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@tbe/components/quizes';
import { useQuery } from '@tbe/query';
import { leaderboardApi } from '@tbe/services';
import type { LeaderboardData } from '@tbe/types';
import { Crown, Medal, RefreshCw, Trophy } from 'lucide-react';
import React from 'react';

import { QuizzesNav } from '@/components/quizzes/QuizzesNav';

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <div className='flex items-center justify-center w-8 h-8 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full shadow-xs text-white'>
        <Crown className='w-4 h-4' />
      </div>
    );
  }
  if (rank === 2) {
    return (
      <div className='flex items-center justify-center w-8 h-8 bg-gradient-to-r from-gray-300 to-gray-400 rounded-full shadow-xs text-white'>
        <Medal className='w-4 h-4' />
      </div>
    );
  }
  if (rank === 3) {
    return (
      <div className='flex items-center justify-center w-8 h-8 bg-gradient-to-r from-amber-600 to-amber-700 rounded-full shadow-xs text-white'>
        <Trophy className='w-4 h-4' />
      </div>
    );
  }
  return (
    <div className='flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full text-xs font-bold text-gray-700'>
      #{rank}
    </div>
  );
}

function LeaderboardContent() {
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

  const entries = leaderboardData || [];

  return (
    <div className='min-h-screen bg-gray-50 flex flex-col'>
      <QuizzesNav activeTab='leaderboard' />

      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full'>
        {/* Header */}
        <div className='mb-8'>
          <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
            <div>
              <h1 className='text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2'>
                <Trophy className='w-8 h-8 text-primary' />
                Quiz Leaderboard
              </h1>
              <p className='text-gray-600 mt-1'>
                See where you rank among top developers practicing on The Boring
                Education.
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

        {/* Top 3 Podium Cards */}
        {entries.length >= 3 && (
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
            {/* Rank 2 */}
            <Card className='border border-gray-200 bg-white rounded-2xl p-6 text-center shadow-xs md:order-1'>
              <div className='w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3 text-2xl font-bold'>
                🥈
              </div>
              <h3 className='font-bold text-lg text-gray-900 truncate'>
                {entries[1]?.username || 'Anonymous'}
              </h3>
              <p className='text-primary font-bold text-2xl mt-1'>
                {entries[1]?.bestScore ?? 0} pts
              </p>
              <p className='text-xs text-gray-500 mt-1'>
                {entries[1]?.totalAttempts ?? 0} attempts completed
              </p>
            </Card>

            {/* Rank 1 */}
            <Card className='border-2 border-amber-300 bg-gradient-to-b from-amber-50/50 to-white rounded-2xl p-6 text-center shadow-md md:order-2 md:-translate-y-2'>
              <div className='w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-3 text-3xl font-bold'>
                👑
              </div>
              <Badge className='bg-amber-500 text-white mb-2' variant='default'>
                Champion
              </Badge>
              <h3 className='font-extrabold text-xl text-gray-900 truncate'>
                {entries[0]?.username || 'Anonymous'}
              </h3>
              <p className='text-primary font-extrabold text-3xl mt-1'>
                {entries[0]?.bestScore ?? 0} pts
              </p>
              <p className='text-xs text-gray-500 mt-1'>
                {entries[0]?.totalAttempts ?? 0} attempts completed
              </p>
            </Card>

            {/* Rank 3 */}
            <Card className='border border-gray-200 bg-white rounded-2xl p-6 text-center shadow-xs md:order-3'>
              <div className='w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3 text-2xl font-bold'>
                🥉
              </div>
              <h3 className='font-bold text-lg text-gray-900 truncate'>
                {entries[2]?.username || 'Anonymous'}
              </h3>
              <p className='text-primary font-bold text-2xl mt-1'>
                {entries[2]?.bestScore ?? 0} pts
              </p>
              <p className='text-xs text-gray-500 mt-1'>
                {entries[2]?.totalAttempts ?? 0} attempts completed
              </p>
            </Card>
          </div>
        )}

        {/* Leaderboard Table Card */}
        <Card className='border border-gray-200 bg-white rounded-2xl shadow-xs overflow-hidden'>
          <CardHeader className='border-b border-gray-100 p-6'>
            <CardTitle className='text-xl font-bold text-gray-900'>
              Rankings
            </CardTitle>
          </CardHeader>

          <CardContent className='p-0'>
            {isLoading ? (
              <div className='text-center py-16'>
                <RefreshCw className='w-8 h-8 animate-spin mx-auto text-primary mb-2' />
                <p className='text-gray-500 text-sm'>Loading leaderboard...</p>
              </div>
            ) : entries.length === 0 ? (
              <div className='text-center py-16'>
                <Trophy className='w-12 h-12 text-gray-300 mx-auto mb-3' />
                <h3 className='text-lg font-bold text-gray-900 mb-1'>
                  No Leaderboard Entries Yet
                </h3>
                <p className='text-gray-500 text-sm'>
                  Complete quizzes to claim the #1 spot on the leaderboard!
                </p>
              </div>
            ) : (
              <div className='overflow-x-auto'>
                <table className='w-full text-left border-collapse'>
                  <thead>
                    <tr className='bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider'>
                      <th className='py-3.5 px-6'>Rank</th>
                      <th className='py-3.5 px-6'>Developer</th>
                      <th className='py-3.5 px-6 text-right'>Best Score</th>
                      <th className='py-3.5 px-6 text-right'>Avg Score</th>
                      <th className='py-3.5 px-6 text-right'>Attempts</th>
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-gray-100 text-sm'>
                    {entries.map((entry: any, index) => {
                      const rank = index + 1;
                      const isMe =
                        user?.id &&
                        (entry._id === user.id || entry.userId === user.id);

                      return (
                        <tr
                          key={entry._id || index}
                          className={`hover:bg-gray-50/80 transition-colors ${
                            isMe ? 'bg-primary/5 font-semibold' : ''
                          }`}
                        >
                          <td className='py-4 px-6'>
                            <RankBadge rank={rank} />
                          </td>
                          <td className='py-4 px-6'>
                            <div className='flex items-center space-x-3'>
                              <Avatar className='w-9 h-9 border border-gray-200'>
                                <AvatarImage src={entry.image} />
                                <AvatarFallback className='bg-primary/10 text-primary font-bold text-xs'>
                                  {entry.username
                                    ? entry.username.slice(0, 2).toUpperCase()
                                    : 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <span className='font-bold text-gray-900 block'>
                                  {entry.username || 'Anonymous'}
                                  {isMe && (
                                    <span className='ml-2 text-xs text-primary font-bold'>
                                      (You)
                                    </span>
                                  )}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className='py-4 px-6 text-right font-extrabold text-primary'>
                            {entry.bestScore ?? 0} pts
                          </td>
                          <td className='py-4 px-6 text-right text-gray-600 font-medium'>
                            {Math.round(entry.averageScore ?? 0)}%
                          </td>
                          <td className='py-4 px-6 text-right text-gray-500'>
                            {entry.totalAttempts ?? 0}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default function LeaderboardPage() {
  return (
    <ProtectedRoute>
      <LeaderboardContent />
    </ProtectedRoute>
  );
}
