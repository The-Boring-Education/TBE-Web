import React, { useState } from 'react';
import { Button, FlexContainer } from '@/components';
import { PlaylistVideoCard, PlaylistCard } from '@/components';
import { PlaylistCantainerCardProps } from '@/interfaces';
import PlaylistVideoTimeCard from '../../Cards/Items/PlaylistVideoTimeCard';
import PlaylistRecommend from '../../Cards/Items/PlaylistRecommend';
import { useUser } from '@/hooks';
import { signIn } from 'next-auth/react';

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
                usertime={learningTime}
                userId={userId}
                playlistId={id}
              />
            </div>
          )}

          <PlaylistCard
            title={selectedVideo.title || playlistName}
            description={description}
            thumbnail={thumbnail}
            videoId={selectedVideo.videoId}
            isStartedLearningFromPlaylist={isStartedLearningFromPlaylist}
          />

          {!isStartedLearningFromPlaylist && (
            <Button
              variant='PRIMARY'
              className='w-full mx-auto'
              text='Start Learning'
              onClick={handleStartLearning}
            />
          )}
        </FlexContainer>
        <FlexContainer direction='col' className='flex-1 max-w-full gap-2'>
          {videos?.map(({ videoId, title, thumbnail }) => {
            const commonProps = {
              key: videoId,
              title: title,
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
            userId={userId}
            playlistId={id}
            recommend={isRecommended}
          />
        </div>
      )}
    </div>
  );
};

export default PlaylistContainer;
