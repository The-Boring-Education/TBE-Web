'use client';

import { useEffect, useState } from 'react';
import { useLeaderboard, useUser } from '@/hooks';
import { LeaderboardType } from "@/interfaces";
import { LEADERBOARD_TABS } from '@/constant';
import { FlexContainer, Text, Section } from '@/components';

const rankCircleStyles: Record<number, string> = {
  1: 'bg-yellow-500 text-white',
  2: 'bg-gray-400 text-white',
  3: 'bg-orange-400 text-white',
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

  const renderRank = (rank: number) =>
    rank <= 3 ? (
      <div className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-xs ${rankCircleStyles[rank]}`}>
        {rank}
      </div>
    ) : (
      <span className="w-8 text-sm font-medium text-gray-500 text-center">#{rank}</span>
    );

  const renderEntries = () => {
    if (!entries?.length)
      return <Text level="h2" className="text-center text-gray-500 py-8">Waiting for Leaderboard to be Generated</Text>;

    return entries.slice(0, 10).map((entry: any, idx: number) => {
      const isTopThree = idx < 3;
      const isUser = user?.id === entry.userId._id;
      const bg = isTopThree ? 'bg-yellow-50' : isUser ? 'bg-blue-50' : 'bg-white';
      const nameStyle = isTopThree ? 'text-black font-semibold' : 'text-gray-800';
      const pointsStyle = isTopThree ? 'text-black font-bold' : 'text-gray-600 font-semibold';
      const name = entry.userId.name || 'Unknown';
      const initial = name[0]?.toUpperCase() || '?';

      return (
        <Section key={entry.userId._id} className={`flex items-center justify-between px-4 py-3 border-b ${bg}`}>
          <FlexContainer className="flex items-center gap-3">
            {renderRank(idx + 1)}
            {entry.userId.image ? (
              <img
                src={entry.userId.image}
                alt={name}
                className="w-10 h-10 rounded-full object-cover"
                onError={e => (e.currentTarget.src = '')}
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-semibold">
                {initial}
              </div>
            )}
            <Text level="p" className={nameStyle}>{name}</Text>
          </FlexContainer>
          <Text level="p" className={pointsStyle}>{entry.points} pts</Text>
        </Section>
      );
    });
  };

  const renderUserRank = () => {
    if (!user || userRank === null || userRank <= 10) return null;
    const entry = entries.find((e: any) => e.userId._id === user.id);
    if (!entry) return null;

    return (
      <Section className="mt-4 px-4 py-3 border-t text-center bg-blue-50 text-gray-700">
        You're ranked <span className="font-bold text-blue-600">#{userRank}</span> with{' '}
        <span className="font-bold text-blue-600">{entry.points}</span> points
      </Section>
    );
  };

  return (
    <Section className="w-full max-w-2xl mx-auto mt-8 bg-white border shadow rounded-lg">
      <FlexContainer className="border-b bg-gray-100 rounded-t-lg">
        {LEADERBOARD_TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setSelectedTab(tab)}
            className={`flex-1 py-2 text-sm font-medium transition ${
              selectedTab === tab
                ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </FlexContainer>

      {loading ? (
        <Text level="h2" className="text-center text-gray-500 py-8">Loading...</Text>
      ) : (
        renderEntries()
      )}

      {renderUserRank()}
    </Section>
  );
};

export default Leaderboard;
