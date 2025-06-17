import { useEffect, useState } from 'react';

import { routes } from '@/constant';
import { useApi } from '@/hooks';
import type { PlaylistSkillCardProps } from '@/interfaces';

const useSkillPlaylist = (q: string) => {
  const { makeRequest, loading } = useApi('fetchPlaylists');
  const [playlists, setPlaylists] = useState<PlaylistSkillCardProps[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!q) return; // Skip fetching if q is empty

    const fetchPlaylists = async () => {
      try {
        const response = await makeRequest({
          method: 'GET',
          url: `${routes.api.youfocusExplore}?q=${encodeURIComponent(q)}`,
        });

        if (!response.data || response.data.length === 0) {
          setErrorMessage('No playlists found for this skill.');
          setPlaylists([]);
        } else {
          setPlaylists(response.data);
        }
      } catch (error) {
        setErrorMessage('Failed to fetch playlists. Please try again.');
        setPlaylists([]);
      }
    };

    fetchPlaylists();
  }, [q]);

  return { playlists, loading, errorMessage };
};

export default useSkillPlaylist;
