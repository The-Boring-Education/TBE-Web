import {
  Button,
  FlexContainer,
  SectionHeaderContainer,
  Toast,
} from '@tbe/components';
import { routes } from '@tbe/constants';
import {useApi} from '@tbe/hooks';
import type { PlaylistRecommendProps } from '@tbe/interface';
import React, { useState } from 'react';

const PlaylistRecommend = ({
  playlistId,
  userId,
  recommend,
}: PlaylistRecommendProps) => {
  const [isRecommended, setIsRecommended] = useState(recommend);
  const [copied, setCopied] = useState(false);
  const [thankYouMessage, setThankYouMessage] = useState(false);

  const { makeRequest, loading } = useApi('updateRecommendation');

  const copyCurrentPageUrl = () => {
    const currentUrl = window.location.href;
    navigator.clipboard
      .writeText(currentUrl)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => console.error('Failed to copy URL:', err));
  };

  const handleRecommendPlaylist = async () => {
    try {
      await makeRequest({
        url: `${routes.api.youfocusUserPlaylistById(playlistId, userId)}`,
        method: 'PATCH',
        body: JSON.stringify({ isRecommended: !isRecommended }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      setIsRecommended((prev) => !prev);
      if (!isRecommended) {
        setThankYouMessage(true);
      }

      setTimeout(() => setThankYouMessage(false), 3000);
    } catch (error) {
      console.error('Error recommending playlist:', error);
    }
  };

  return (
    <FlexContainer className='relative rounded-lg mt-2 md:mt-4' direction='col'>
      <div className='w-full max-w-md'>
        <SectionHeaderContainer
          focusText='Playlist'
          heading='Recommend'
          headingLevel={3}
          subtext='Share it With Your Friend and Learn Together'
        />
      </div>

      <div className='mt-2 md:mt-4 flex justify-center gap-2'>
        <Button
          className={`text-nowrap rounded-s-md ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          } ${!isRecommended ? 'text-white' : 'text-black'}`}
          text={
            loading
              ? 'Updating...'
              : isRecommended
              ? 'Unrecommend'
              : 'Recommend'
          }
          variant={isRecommended ? 'GHOST' : 'PRIMARY'}
          onClick={handleRecommendPlaylist}
        />

        <Button
          className='text-nowrap rounded-s-md'
          text='Copy Link'
          variant='OUTLINE'
          onClick={copyCurrentPageUrl}
        />
      </div>

      {thankYouMessage && (
        <Toast message='✅ Thank you for your recommendation! 😊' />
      )}
      {copied && <Toast message='✅ Playlist URL copied!' />}
    </FlexContainer>
  );
};

export default PlaylistRecommend;
