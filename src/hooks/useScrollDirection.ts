// 'use client';
// import { useState, useEffect } from 'react';

// const useScrollDirection = () => {
//   const [scrollDirection, setScrollDirection] = useState('up');

//   useEffect(() => {
//     let lastScrollY = window.pageYOffset;

//     const updateScrollDirection = () => {
//       const scrollY = window.pageYOffset;
//       const direction = scrollY > lastScrollY ? 'down' : 'up';
//       if (
//         direction !== scrollDirection &&
//         (scrollY - lastScrollY > 10 || scrollY - lastScrollY < -10)
//       ) {
//         setScrollDirection(direction);
//       }
//       lastScrollY = scrollY > 0 ? scrollY : 0;
//     };

//     window.addEventListener('scroll', updateScrollDirection);
//     return () => {
//       window.removeEventListener('scroll', updateScrollDirection);
//     };
//   }, [scrollDirection]);
//   return scrollDirection;
// };

// export default useScrollDirection;

'use client';
import { useState, useEffect } from 'react';

const useScrollDirection = (): 'up' | 'down' => {
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('up');

  useEffect(() => {
    let lastScrollY: number = window.scrollY;

    const updateScrollDirection = (): void => {
      const scrollY: number = window.scrollY;
      const direction: 'up' | 'down' = scrollY > lastScrollY ? 'down' : 'up';

      if (
        direction !== scrollDirection &&
        (scrollY - lastScrollY > 10 || scrollY - lastScrollY < -10)
      ) {
        setScrollDirection(direction);
      }
      lastScrollY = scrollY > 0 ? scrollY : 0;
    };

    window.addEventListener('scroll', updateScrollDirection);

    return (): void => {
      window.removeEventListener('scroll', updateScrollDirection);
    };
  }, [scrollDirection]);

  return scrollDirection;
};

export default useScrollDirection;
