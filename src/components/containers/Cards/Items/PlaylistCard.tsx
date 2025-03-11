import React from 'react';
import { Image, Text, FlexContainer } from '@/components';
import { PlaylistCardProps } from '@/interfaces';

const PlaylistCard = ({
  title,
  description,
  thumbnail,
  isStartedLearningFromPlaylist,
  videoId,
}: PlaylistCardProps) => {
  return (
    <FlexContainer direction='col' className='gap-4 w-full items-baseline'>
      <div className='w-full border-1 border-black rounded-md overflow-hidden'>
        {!isStartedLearningFromPlaylist ? (
          <Image
            src={thumbnail}
            alt={title}
            fullHeight={false}
            fullWidth={false}
            className='aspect-image rounded-sm'
          />
        ) : (
          <iframe
            className='w-full aspect-video rounded-sm'
            src={`https://www.youtube.com/embed/${videoId}`}
            title='YouTube Video'
            frame-Border='0'
            allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
            allowFullScreen
          ></iframe>
        )}
      </div>
      <FlexContainer direction='col' className='w-full gap-1 items-baseline'>
        <Text level='h4' className='heading-4 font-bold'>
          {title}
        </Text>
        <Text level='p' className=' w-full line-clamp-2 text-grey'>
          {description}
        </Text>
      </FlexContainer>
    </FlexContainer>
  );
};

export default PlaylistCard;
