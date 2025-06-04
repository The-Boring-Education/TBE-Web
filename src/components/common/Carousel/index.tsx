import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';

import type { CarouselProps } from '@/interfaces';

const Carousel = ({ items, renderItem }: CarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    setCurrentIndex(
      (prevIndex) => (prevIndex + newDirection + items.length) % items.length
    );
  };

  return (
    <div className='relative w-full max-w-4xl mx-auto md:px-4 px-2'>
      <div className='relative md:h-[300px] h-[520px] overflow-hidden'>
        <AnimatePresence custom={direction} initial={false}>
          <motion.div
            key={currentIndex}
            animate='center'
            className='absolute w-full'
            custom={direction}
            drag='x'
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            exit='exit'
            initial='enter'
            transition={{
              x: { type: 'spring', stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            variants={slideVariants}
            onDragEnd={(e, { offset, velocity }) => {
              const swipe = swipePower(offset.x, velocity.x);

              if (swipe < -swipeConfidenceThreshold) {
                paginate(1);
              } else if (swipe > swipeConfidenceThreshold) {
                paginate(-1);
              }
            }}
          >
            {renderItem(items[currentIndex])}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className='flex justify-center gap-4 mt-6'>
        <motion.button
          className='p-2 rounded-full bg-primary/10 hover:bg-primary/20'
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => paginate(-1)}
        >
          <ChevronLeftIcon className='w-6 h-6 text-primary' />
        </motion.button>
        <motion.button
          className='p-2 rounded-full bg-primary/10 hover:bg-primary/20'
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => paginate(1)}
        >
          <ChevronRightIcon className='w-6 h-6 text-primary' />
        </motion.button>
      </div>
    </div>
  );
};

export default Carousel;
