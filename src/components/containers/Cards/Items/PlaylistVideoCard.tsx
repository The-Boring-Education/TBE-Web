import React from 'react';
import { FlexContainer, Image, Text } from '@/components';
import { PlaylistVideoCardProps } from '@/interfaces';

const PlaylistVideoCard = ({
  title,
  image,
  imageAltText,
  href,
  onClick,
}: PlaylistVideoCardProps) => {
  return (
    <FlexContainer
      direction='row'
      className='w-full hover:bg-slate-200 rounded-md'
    >
      {href ? (
        <div onClick={onClick} className='w-full flex flex-row cursor-pointer'>
          <div className='w-32 h-20 md:w-40 md:h-28 flex-shrink-0 relative'>
            <Image
              src={image}
              alt={imageAltText}
              className='object-cover w-full h-full rounded-md'
            />
          </div>
          <div className='p-2'>
            <Text
              level='h5'
              className='heading-5 font-primary text-[1rem] md:text-[1.1rem] line-clamp-2'
            >
              {title.substring(0, 30)}
            </Text>
          </div>
        </div>
      ) : (
        <FlexContainer direction='row' className='w-full'>
          <div className='w-32 h-20 md:w-40 md:h-28 flex-shrink-0'>
            <Image
              src={image}
              alt={imageAltText}
              className='object-cover rounded'
            />
          </div>
          <FlexContainer
            direction='row'
            justifyCenter={false}
            className='w-full flex-1 pl-2'
          >
            <Text
              level='h6'
              className='heading-5 font-primary text-[1rem] md:text-[1.1rem] line-clamp-2'
            >
              {title}
            </Text>
          </FlexContainer>
        </FlexContainer>
      )}
    </FlexContainer>
  );
};

export default PlaylistVideoCard;
