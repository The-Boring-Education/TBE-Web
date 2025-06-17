import { ArrowDownIcon, ArrowUpIcon } from '@heroicons/react/24/solid';

import { FloatingActionButton } from '@/components';
import { useScrollPosition } from '@/hooks';

const ScrollToTopBottomButton = () => {
  const scrollPercentage = useScrollPosition();

  const scrollTo = (position: 'top' | 'bottom') => {
    window.scrollTo({
      top: position === 'top' ? 0 : document.documentElement.scrollHeight,
      behavior: 'smooth',
    });
  };

  return (
    <FloatingActionButton
      icon={
        scrollPercentage > 20 ? (
          <ArrowUpIcon className='w-3 h-3 md:w-4 md:h-4' />
        ) : (
          <ArrowDownIcon className='w-3 h-3 md:w-4 md:h-4' />
        )
      }
      onClick={() => scrollTo(scrollPercentage > 20 ? 'top' : 'bottom')}
    />
  );
};

export default ScrollToTopBottomButton;
