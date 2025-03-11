import React from 'react';
import { Image, Text, FlexContainer } from '@/components';
import { routes } from '@/constant';
import { PlaylistSkillCardProps } from '@/interfaces';
import { useRouter } from 'next/navigation';

const SkillCard = ({
  thumbnail,
  playlistName,
  referrerBy,
  noOfVideos,
  _id,
}: PlaylistSkillCardProps) => {
  const router = useRouter();

  return (
    <FlexContainer className='rounded-md hover:scale-105 transition-transform duration-300 md:w-fit w-full relative border border-black p-[6px]'>
      <div
        onClick={() => router.push(`${routes.youfocusPlaylistPageById(_id)}`)}
        className='cursor-pointer relative md:w-fit w-full'
      >
        <Image
          src={thumbnail}
          alt={playlistName}
          className='w-full object-cover rounded-md'
        />

        {referrerBy > 0 && (
          <div className='absolute bottom-2 left-2 bg-white text-primary shadow-md px-1 md:px-3 py-1 rounded-full flex items-center justify-center'>
            <Text level='p' className='text-xs font-semibold text-center'>
              {referrerBy} Learners Suggested
            </Text>
          </div>
        )}

        {noOfVideos > 0 && (
          <div className='absolute bottom-2 right-2 bg-primary text-white shadow-md px-1 md:px-3 py-1 rounded-full flex items-center justify-center'>
            <Text level='p' className='text-xs font-semibold text-center'>
              {noOfVideos} Videos
            </Text>
          </div>
        )}
      </div>
    </FlexContainer>
  );
};

export default SkillCard;
