import { Button } from '@headlessui/react';
import React from 'react';
import { FaStar } from 'react-icons/fa';

import { FlexContainer } from '@/components';
import type { StarRatingCardProps } from '@/interfaces';

const StarRatingCard = ({ rating, onClick }: StarRatingCardProps) => {
  return (
    <FlexContainer className='mb-2'>
      {[1, 2, 3, 4, 5].map((star) => (
        <Button
          key={star}
          className='focus:outline-none'
          onClick={() => onClick(star)}
        >
          <FaStar
            className={`w-4 h-4 ${
              rating >= star ? 'text-yellow-400' : 'text-gray-300'
            }`}
          />
        </Button>
      ))}
    </FlexContainer>
  );
};

export default StarRatingCard;
