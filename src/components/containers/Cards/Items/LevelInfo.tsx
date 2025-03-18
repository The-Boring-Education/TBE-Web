import React from 'react';
import { Text } from '@/components';

const LevelInfo = ({ level, pointsNeeded }) => {
  return (
    <div className='mt-3 sm:mt-0 sm:ml-4 text-center sm:text-left'>
      <Text className='text-gray-500 text-sm' level='p'>
        YOU'RE AT
      </Text>
      <Text className='text-red-500 font-bold text-base md:text-lg' level='p'>
        Level {level}: Beginner
      </Text>
      <div className='mt-2 w-full bg-gradient-to-r from-pink-400 to-yellow-400 font-semibold py-1.5 rounded-md text-center text-sm md:text-base'>
        {pointsNeeded} Pts to Expert
      </div>
    </div>
  );
};

export default LevelInfo;
