import { useEffect, useState } from 'react';

interface ScrollDirection {
  scrollDirection: 'up' | 'down' | null;
  isVisible: boolean;
}

const useScrollDirection = (threshold = 100): ScrollDirection => {
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const updateScrollDirection = () => {
      const scrollY = window.scrollY;
      
      // Don't update direction if scroll change is too small
      if (Math.abs(scrollY - lastScrollY) < 10) return;
      
      const direction = scrollY > lastScrollY ? 'down' : 'up';
      setScrollDirection(direction);
      
      // Show navbar when:
      // 1. At the very top of the page (scrollY < threshold)
      // 2. Scrolling up after being past the threshold
      if (scrollY < threshold) {
        setIsVisible(true);
      } else if (direction === 'up') {
        setIsVisible(true);
      } else if (direction === 'down') {
        setIsVisible(false);
      }
      
      setLastScrollY(scrollY);
    };

    window.addEventListener('scroll', updateScrollDirection);
    
    return () => window.removeEventListener('scroll', updateScrollDirection);
  }, [lastScrollY, threshold]);

  return { scrollDirection, isVisible };
};

export default useScrollDirection;