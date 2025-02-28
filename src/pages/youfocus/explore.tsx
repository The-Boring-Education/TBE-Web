import React from 'react';
import {
  FlexContainer,
  Button,
  Section,
  SectionHeaderContainer,
} from '@/components';
import { Skills } from '@/constant';

const Home = () => {
  return (
    <Section>
      <FlexContainer
        direction='col'
        className='w-full py-11 justify-center items-center'
      >
        <div className='w-full max-w-md'>
          <SectionHeaderContainer
            heading='Pick An '
            focusText='Skill'
            headingLevel={3}
            subtext='What Do You Want to Learn?'
          />
        </div>

        <FlexContainer className='flex-wrap justify-center gap-1 md:gap-2 mx-auto max-w-lg  py-5'>
          {Skills.map((skill, index) => (
            <span key={index}>
              <Button
                variant='GHOST'
                text={skill}
                className=' px-4 py-1 text-black font-bold rounded-lg transition-all duration-300 hover:bg-gradient-to-b hover:from-yellow-300 hover:to-green-400'
                active={true}
                isLoading={false}
                onClick={() => console.log('clicked', skill)}
              />
            </span>
          ))}
        </FlexContainer>

        <div className='w-full max-w-md'>
          <Button
            variant='PRIMARY'
            className='w-full  mx-auto'
            text='Explore Playlists'
            onClick=''
          />
        </div>
      </FlexContainer>
    </Section>
  );
};

export default Home;
