import { LINKS, STATIC_FILE_PATH } from '@/constant';
import Link from 'next/link';
import React from 'react';
import FlexContainer from '../common/FlexContainer';
import { Image, Pill, Section } from '@/components';
import { Text } from '@/components';

const Community = () => {
  return (
    <Section>
      <FlexContainer className='gradient-5 w-full p-4 flex-col  gap-4 rounded-2'>
        <FlexContainer className='w-full max-w-[98%] md:max-w-[50%]'>
          <Image
            src={`${STATIC_FILE_PATH.svg}/community.svg`}
            fullHeight={true}
            fullWidth={true}
            alt='community'
          />
        </FlexContainer>
        <FlexContainer className='text-accent gap-1  max-w-[98%] md:max-w-[50%]'>
          <Text level='h1' className='heading-3 text-accent mb-[28px]'>
            Community For Everyone
          </Text>
          <Text level='p' className='text-center'>
            You excel where you’re supported. Connect with like-minded peers who
            share the same goal as you.
          </Text>
        </FlexContainer>
        <FlexContainer className='flex-col text-accent gap-2'>
          <Text level='h1' className='heading-5  text-accent'>
            In Community, You can
          </Text>
          <FlexContainer className='gap-1 justify-center items-center flex-wrap'>
            {[
              'Attend Tech Workshops',
              'Connect with Like-minded Peers',
              'Share your journey with others',
              'Find accountability parter',
            ].map((goal, index) => (
              <FlexContainer key={index} className='w-full md:w-[35%]'>
                <Pill text={goal} variant='GHOST' widthFull={true} />
              </FlexContainer>
            ))}
          </FlexContainer>
          <Link
            href={LINKS.whatsappCommunity}
            className='gradient-3 button-text rounded-[5px] text-center px-5 py-2 w-full sm:w-auto'
            target='block'
          >
            Join Community
          </Link>
        </FlexContainer>
      </FlexContainer>
    </Section>
  );
};

export default Community;
