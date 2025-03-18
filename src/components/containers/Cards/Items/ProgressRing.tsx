import React from 'react';
import { Text } from '@/components';

const ProgressRing = ({ progress = 0, max = 100 }) => {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / max) * circumference;

  // Calculate the percentage
  const percentage = Math.round((progress / max) * 100);

  return (
    <div className='relative w-20 h-20 flex items-center justify-center'>
      <svg className='absolute w-full h-full' viewBox='0 0 100 100'>
        <circle
          cx='50'
          cy='50'
          r={radius}
          stroke='#E0E0E0'
          strokeWidth='8'
          fill='transparent'
        />
        <circle
          cx='50'
          cy='50'
          r={radius}
          stroke='#FF4A4A'
          strokeWidth='8'
          fill='transparent'
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap='round'
        />
      </svg>
      <Text className='p-3 text-base md:text-lg font-bold' level='span'>
        {percentage}%
      </Text>
    </div>
  );
};

export default ProgressRing;
