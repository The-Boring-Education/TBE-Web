import React from 'react';

import { FlexContainer, Image, Text } from '@/components';
import type { PlaylistCardProps } from '@/interfaces';

const PlaylistCard = ({
  title,
  description,
  thumbnail,
  isStartedLearningFromPlaylist,
  videoId,
}: PlaylistCardProps) => (
    <FlexContainer className='gap-4 w-full items-baseline' direction='col'>
      <div className='w-full border-1 border-black rounded-md overflow-hidden'>
        {!isStartedLearningFromPlaylist ? (
          <Image
            alt={title}
            className='aspect-image rounded-sm'
            fullHeight={false}
            fullWidth={false}
            src={thumbnail}
          />
        ) : (
          <iframe
            allowFullScreen
            allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
            className='w-full aspect-video rounded-sm'
            frame-Border='0'
            src={`https://www.youtube.com/embed/${videoId}`}
            title='YouTube Video'
           />
        )}
      </div>
      <FlexContainer className='w-full gap-1 items-baseline' direction='col'>
        <Text className='heading-4 font-bold' level='h4'>
          {title}
        </Text>
        <Text className=' w-full line-clamp-2 text-grey' level='p'>
          {description}
        </Text>
      </FlexContainer>
    </FlexContainer>
  );

export default PlaylistCard;
