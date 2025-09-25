import React from 'react';

import { FlexContainer, Image, Text } from '@tbe/components';
import type { PlaylistVideoCardProps } from '@tbe/interface';

const PlaylistVideoCard = ({
  title,
  image,
  imageAltText,
  href,
  onClick,
}: PlaylistVideoCardProps) => (
  <FlexContainer
    className='w-full hover:bg-slate-200 rounded-md'
    direction='row'
  >
    {href ? (
      <div className='w-full flex flex-row cursor-pointer' onClick={onClick}>
        <div className='w-32 h-20 md:w-40 md:h-28 flex-shrink-0 relative'>
          <Image
            alt={imageAltText}
            className='object-cover w-full h-full rounded-md'
            src={image}
          />
        </div>
        <div className='p-2'>
          <Text className='paragraph line-clamp-2' level='p'>
            {title}
          </Text>
        </div>
      </div>
    ) : (
      <FlexContainer className='w-full' direction='row'>
        <div className='w-32 h-20 md:w-40 md:h-28 flex-shrink-0'>
          <Image
            alt={imageAltText}
            className='object-cover rounded'
            src={image}
          />
        </div>
        <FlexContainer
          className='w-full flex-1 pl-2'
          direction='row'
          justifyCenter={false}
        >
          <Text
            className='heading-5 font-primary text-[1rem] md:text-[1.1rem] line-clamp-2'
            level='h6'
          >
            {title}
          </Text>
        </FlexContainer>
      </FlexContainer>
    )}
  </FlexContainer>
);

export default PlaylistVideoCard;
