import React from 'react';
import { Text } from '@/components';
import { ProgressRingProps } from '@/interfaces';

const ProgressRing = ({ progress = 0, point }: ProgressRingProps) => {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;

  // Ensure progress is between 0-100%
  const clampedProgress = Math.min(100, Math.max(0, progress));

  // Calculate stroke offset
  const strokeDashoffset =
    circumference - (clampedProgress / 100) * circumference;

  return (
    <div className='relative w-20 h-20 flex items-center justify-center'>
      <svg className='absolute w-full h-full' viewBox='0 0 100 100'>
        {/* Background Circle */}
        <circle
          cx='50'
          cy='50'
          r={radius}
          stroke='#E0E0E0'
          strokeWidth='8'
          fill='transparent'
        />
        {/* Progress Circle */}
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
          className='transition-all duration-300 ease-in-out'
        />
      </svg>
      {/* Display Progress Percentage */}
      <Text className='p-3 text-base md:text-lg font-bold' level='span'>
        {point}
      </Text>
    </div>
  );
};

export default ProgressRing;
