import { ArrowLeftIcon, PauseIcon, PlayIcon } from '@heroicons/react/20/solid';
import { FlexContainer, Text } from '@tbe/components';
import { routes } from '@tbe/constants';
import { useApi } from '@tbe/hooks';
import type { PlaylistVideoTimeCard as PlaylistVideoTimeCardProps } from '@tbe/interface';
import { convertSecondsToMinutes } from '@tbe/utils';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';

const PlaylistVideoTimeCard = ({
  usertime = 0,
  playlistId,
  userId,
}: PlaylistVideoTimeCardProps) => {
  const [time, setTime] = useState(usertime * 60);
  const [isRunning, setIsRunning] = useState(false);
  const router = useRouter();

  const { makeRequest } = useApi('update-user-learning-time');

  const updateLearningTime = useCallback(() => {
    const minutes = Math.floor(time / 60);

    makeRequest({
      url: `${routes.api.youfocusUserPlaylistById(playlistId, userId)}`,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ learningTime: minutes }),
    }).catch((error) => error);
  }, [time, makeRequest, playlistId, userId]);

  useEffect(() => {
    if (!isRunning) return;

    // Timer for UI
    const timer = setInterval(() => {
      setTime((prevTime) => prevTime + 1);
    }, 1000);

    // Timer for updating learning time every 5 minutes
    const interval = setInterval(() => {
      updateLearningTime();
    }, 120000);

    return () => {
      clearInterval(timer);
      clearInterval(interval);
    };
  }, [isRunning, updateLearningTime]);

  const toggleTimer = useCallback(() => {
    setIsRunning((isRunning) => {
      if (isRunning) updateLearningTime();
      return !isRunning;
    });
  }, [updateLearningTime]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      updateLearningTime();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [updateLearningTime]);

  const handleBackButton = () => {
    router.push(routes.user.dashboard);
  };

  return (
    <FlexContainer
      className='gap-2 w-full justify-between p-2 bg-dark text-white rounded-lg shadow-md'
      direction='row'
    >
      <button
        aria-label='Go back'
        className='w-10 h-10 flex items-center justify-center bg-white text-white rounded-full hover:bg-gray-200'
        onClick={handleBackButton}
      >
        <ArrowLeftIcon
          aria-hidden='true'
          className='w-5 h-5 p-[4px] text-gray-700'
        />
      </button>

      <Text className='strong-text text-contentDark' level='span'>
        {convertSecondsToMinutes(time)}
      </Text>

      <button
        aria-label={isRunning ? 'Pause' : 'Play'}
        className='w-12 h-12 flex items-center justify-center bg-white text-white rounded-full hover:bg-gray-200'
        onClick={toggleTimer}
      >
        {isRunning ? (
          <PauseIcon
            aria-hidden='true'
            className='w-5 h-5 p-[4px] text-gray-700'
          />
        ) : (
          <PlayIcon
            aria-hidden='true'
            className='w-5 h-5 p-[4px] text-gray-700'
          />
        )}
      </button>
    </FlexContainer>
  );
};

export default PlaylistVideoTimeCard;
