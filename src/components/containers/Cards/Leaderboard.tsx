'use client';

import { AnimatePresence,motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import {FiUser } from 'react-icons/fi';

import { FlexContainer, Section,Text } from '@/components';
import { LEADERBOARD_TABS } from '@/constant';
import { useLeaderboard, useUser } from '@/hooks';
import type { LeaderboardType } from '@/interfaces';

const rankCircleStyles: Record<number, string> = {
  1: 'bg-yellow-500 text-white shadow-sm',
  2: 'bg-gray-500 text-white shadow-sm',
  3: 'bg-orange-500 text-white shadow-sm',
};

const Leaderboard = () => {
  const { user } = useUser();
  const [selectedTab, setSelectedTab] = useState<LeaderboardType>('DAILY');
  const { data: entries, loading } = useLeaderboard(selectedTab);
  const [userRank, setUserRank] = useState<number | null>(null);

  useEffect(() => {
    if (!user || !entries) return;
    const index = entries.findIndex((e: any) => e.userId._id === user.id);
    setUserRank(index >= 0 ? index + 1 : null);
  }, [entries, user]);

  const renderRank = (rank: number) => {
    if (rank <= 3) {
      return (
        <motion.div
          className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-xs ${rankCircleStyles[rank]} relative`}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          {rank}
        </motion.div>
      );
    }

    return (
      <div className='w-5 h-5 flex items-center justify-center'>
        <span className='text-xs font-medium text-gray-600'>#{rank}</span>
      </div>
    );
  };

  const ProfileImage = ({
    src,
    name,
    isTopThree,
  }: {
    src?: string;
    name: string;
    isTopThree: boolean;
  }) => {
    const [imageError, setImageError] = useState(false);
    const initial = name[0]?.toUpperCase() || '?';

    if (!src || imageError) {
      return (
        <div
          className={`w-7 h-7 rounded-full flex items-center justify-center font-medium text-white text-xs transition-all duration-200 ${
            isTopThree ? 'bg-purple-500 shadow-sm' : 'bg-gray-400'
          }`}
        >
          {initial}
        </div>
      );
    }

    return (
      <div className='relative'>
        <img
          src={src || '/placeholder.svg'}
          alt={name}
          className={`w-7 h-7 rounded-full object-cover transition-all duration-200 ${
            isTopThree ? 'ring-1 ring-gray-300 shadow-sm' : 'shadow-sm'
          }`}
          onError={() => setImageError(true)}
          loading='lazy'
        />
      </div>
    );
  };

  const renderEntries = () => {
    if (!entries?.length) {
      return (
        <motion.div
          className='flex flex-col items-center justify-center py-16 px-4'
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className='w-12 h-12 text-gray-300 mb-4' />
          <Text level='h2' className='text-center text-gray-500 text-lg'>
            Waiting for Leaderboard to be Generated
          </Text>
          <Text level='p' className='text-center text-gray-400 text-sm mt-2'>
            Check back soon to see the rankings!
          </Text>
        </motion.div>
      );
    }

    return (
      <AnimatePresence mode='wait'>
        <div className='divide-y divide-gray-100'>
          {entries.slice(0, 10).map((entry: any, idx: number) => {
            const isTopThree = idx < 3;
            const isUser = user?.id === entry.userId._id;
            const name = entry.userId.name || 'Unknown User';

            let bgClass = 'bg-white hover:bg-gray-50';
            if (isTopThree) {
              bgClass =
                idx === 0
                  ? 'bg-yellow-25 hover:bg-yellow-50' // Much lighter yellow
                  : idx === 1
                  ? 'bg-gray-25 hover:bg-gray-50' // Very light gray
                  : 'bg-orange-25 hover:bg-orange-50'; // Much lighter orange
            } else if (isUser) {
              bgClass = 'bg-blue-25 hover:bg-blue-50 ring-1 ring-blue-100';
            }

            const nameStyle = isTopThree
              ? 'text-gray-900 font-bold'
              : isUser
              ? 'text-blue-900 font-semibold'
              : 'text-gray-800 font-medium';
            const pointsStyle = isTopThree
              ? 'text-gray-900 font-bold text-lg'
              : isUser
              ? 'text-blue-700 font-bold'
              : 'text-gray-600 font-semibold';

            return (
              <motion.div
                key={entry.userId._id}
                className={`flex items-center justify-between px-3 py-2 transition-all duration-200 ${bgClass}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.03 }}
              >
                <FlexContainer className='flex items-center gap-3'>
                  {renderRank(idx + 1)}
                  <ProfileImage
                    src={entry.userId.image}
                    name={name}
                    isTopThree={isTopThree}
                  />
                  <div className='flex flex-col'>
                    <Text level='p' className={`${nameStyle} leading-tight`}>
                      {name}
                    </Text>
                    {isUser && (
                      <span className='text-xs text-blue-600 font-medium'>
                        You
                      </span>
                    )}
                  </div>
                </FlexContainer>

                <div className='flex items-center gap-2'>
                  <Text level='p' className={pointsStyle}>
                    {entry.points}
                  </Text>
                  <span
                    className={`text-sm ${
                      isTopThree ? 'text-gray-600 font-medium' : 'text-gray-500'
                    }`}
                  >
                    pts
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </AnimatePresence>
    );
  };

  const renderUserRank = () => {
    if (!user || userRank === null || userRank <= 10) return null;

    const entry = entries.find((e: any) => e.userId._id === user.id);
    if (!entry) return null;

    return (
      <motion.div
        className='mt-4 mx-4 mb-4 px-6 py-4 border-t-2 border-dashed border-gray-200 bg-blue-50 rounded-lg'
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className='flex items-center justify-center gap-2 text-gray-700'>
          <FiUser className='w-4 h-4 text-blue-600' />
          <span>You're ranked</span>
          <span className='font-bold text-blue-700 bg-blue-100 px-2 py-1 rounded-full text-sm'>
            #{userRank}
          </span>
          <span>with</span>
          <span className='font-bold text-blue-700 bg-blue-100 px-2 py-1 rounded-full text-sm'>
            {entry.points} pts
          </span>
        </div>
      </motion.div>
    );
  };

  return (
    <Section className='w-full max-w-3xl mx-auto mt-8 bg-white border border-gray-200 shadow-xl rounded-2xl overflow-hidden'>
      {/* Title */}
      <div className='px-6 py-4 border-b border-gray-100'>
        <Text
          level='h1'
          className='text-2xl font-bold text-gray-900 text-center'
        >
          Leaderboard
        </Text>
      </div>
      {/* Tab Navigation */}
      <div className='bg-gray-50 border-b border-gray-200'>
        <FlexContainer className='relative'>
          {LEADERBOARD_TABS.map((tab, index) => (
            <motion.button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`relative flex-1 py-3 px-4 text-sm font-semibold transition-all duration-200 ${
                selectedTab === tab
                  ? 'text-blue-700 bg-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
              whileHover={{ y: -1 }}
              whileTap={{ y: 0 }}
            >
              {tab}
              {selectedTab === tab && (
                <motion.div
                  className='absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600'
                  layoutId='activeTab'
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </motion.button>
          ))}
        </FlexContainer>
      </div>

      <div className='min-h-[400px]'>
        {loading ? (
          <motion.div
            className='flex flex-col items-center justify-center py-16'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Text level='h2' className='text-center text-gray-600 text-lg'>
              Loading Leaderboard...
            </Text>
          </motion.div>
        ) : (
          renderEntries()
        )}
      </div>

      {renderUserRank()}
    </Section>
  );
};

export default Leaderboard;
