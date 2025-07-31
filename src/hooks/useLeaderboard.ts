import { useState, useEffect } from 'react';
import {useApi} from '@/hooks';
import { LeaderboardType } from '@/interfaces';
import { routes } from '@/constant';

const useLeaderboard = (tab: LeaderboardType) => {
  const { response, makeRequest, loading } = useApi(`leaderboard-${tab}`, {
    method: 'GET',
    url: `${routes.api.leaderboard}?type=${tab}`,
  });

  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    makeRequest({
      method: 'GET',
      url: `${routes.api.leaderboard}?type=${tab}`,
    });
  }, [tab]);

  useEffect(() => {
    if (response?.data?.entries) {
      setData(response.data.entries);
    }
  }, [response]);

  return { data, loading };
};

export default useLeaderboard;
