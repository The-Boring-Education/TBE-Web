import { signIn } from 'next-auth/react';
import React, { useState } from 'react';

import { Button, FlexContainer } from '@/components';
import { PlaylistCard, PlaylistVideoCard } from '@/components';
import { useUser } from '@/hooks';
import type { PlaylistCantainerCardProps } from '@/interfaces';

import PlaylistRecommend from '../../Cards/Items/PlaylistRecommend';
import PlaylistVideoTimeCard from '../../Cards/Items/PlaylistVideoTimeCard';

const PlaylistContainer = ({
  id,
  playlistName,
  description,
  thumbnail,
  videos = [],
  learningTime = 0,
  isRecommended,
}: PlaylistCantainerCardProps) => {
  const [isStartedLearningFromPlaylist, setIsStartedLearningFromPlaylist] =
    useState(false);
  const [selectedVideo, setSelectedVideo] = useState({
    videoId: videos?.[0]?.videoId,
    title: videos?.[0]?.title,
  });

  const { user, isAuth, loading } = useUser();
  const userId = user?.id;

  const handleStartLearning = () => {
    if (loading) return;
    if (!isAuth) {
      signIn('google');
      return;
    }
    setIsStartedLearningFromPlaylist(true);
  };

  return (
    <div className='py-2'>
      <FlexContainer
        className='border w-full md:border-grey gap-4 rounded-md md:p-2 p-1 items-start'
        itemCenter={false}
      >
        <FlexContainer className='flex-1 max-w-full gap-2 md:sticky md:top-2 z-10'>
          {isStartedLearningFromPlaylist && userId && (
            <div className='w-full flex justify-center'>
              <PlaylistVideoTimeCard
                playlistId={id}
                userId={userId}
                usertime={learningTime}
              />
            </div>
          )}

          <PlaylistCard
            description={description}
            isStartedLearningFromPlaylist={isStartedLearningFromPlaylist}
            thumbnail={thumbnail}
            title={selectedVideo.title || playlistName}
            videoId={selectedVideo.videoId}
          />

          {!isStartedLearningFromPlaylist && (
            <Button
              className='w-full mx-auto'
              text='Start Learning'
              variant='PRIMARY'
              onClick={handleStartLearning}
            />
          )}
        </FlexContainer>
        <FlexContainer className='flex-1 max-w-full gap-2' direction='col'>
          {videos?.map(({ videoId, title, thumbnail }) => {
            const commonProps = {
              key: videoId,
              title,
              image: thumbnail,
              imageAltText: `${title} thumbnail | ${playlistName} | YouFocus`,
              href: videoId,
            };

            return (
              <PlaylistVideoCard
                {...commonProps}
                key={title}
                onClick={() => {
                  handleStartLearning();
                  scrollTo(0, 0);
                  setSelectedVideo({
                    videoId: videoId,
                    title: title,
                  });
                }}
              />
            );
          })}
        </FlexContainer>
      </FlexContainer>

      {userId && (
        <div className='w-full flex justify-center'>
          <PlaylistRecommend
            playlistId={id}
            recommend={isRecommended}
            userId={userId}
          />
        </div>
      )}
    </div>
  );
};

export default PlaylistContainer;
