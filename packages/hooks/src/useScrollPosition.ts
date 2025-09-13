import { useEffect, useState } from 'react';

const useScrollPosition = () => {
  const [scrollPercentage, setScrollPercentage] = useState(0);

  useEffect(() => {
    const updateScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const percentScrolled = (scrollTop / docHeight) * 100;
      setScrollPercentage(percentScrolled);
    };

    window.addEventListener('scroll', updateScroll);
    return () => window.removeEventListener('scroll', updateScroll);
  }, []);

  return scrollPercentage;
};

export default useScrollPosition;
