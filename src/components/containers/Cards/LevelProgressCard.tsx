import React from 'react';
import { FlexContainer } from '@/components';
import { ProgressRing, LevelInfo } from '@/components';

const LevelProgressCard = () => {
  return (
    <div className='bg-white p-3 rounded-2xl shadow-md border relative w-full min-w-[200px] max-w-[320px]'>
      <FlexContainer className='flex-col items-center sm:flex-row'>
        <ProgressRing progress={1000} max={1000} />
        <LevelInfo level={3} pointsNeeded={100} />
      </FlexContainer>
    </div>
  );
};

export default LevelProgressCard;
