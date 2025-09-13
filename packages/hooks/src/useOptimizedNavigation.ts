import { useRouter } from 'next/router';
import { useCallback, useState } from 'react';

/**
 * Custom hook for optimized navigation with immediate feedback
 * Reduces perceived loading time by showing immediate visual feedback
 */
 const useOptimizedNavigation = () => {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  const navigateTo = useCallback(
    async (href: string, options?: { shallow?: boolean; replace?: boolean }) => {
      try {
        setIsNavigating(true);
        
        // Show immediate feedback
        const startTime = performance.now();
        
        // Navigate to the page
        if (options?.replace) {
          await router.replace(href, undefined, options);
        } else {
          await router.push(href, undefined, options);
        }
        
        // Ensure minimum feedback time for better UX
        const elapsed = performance.now() - startTime;
        const minFeedbackTime = 150; // Minimum time to show loading state
        
        if (elapsed < minFeedbackTime) {
          await new Promise(resolve => setTimeout(resolve, minFeedbackTime - elapsed));
        }
      } catch (error) {
        console.error('Navigation error:', error);
      } finally {
        setIsNavigating(false);
      }
    },
    [router]
  );

  const navigateWithLoading = useCallback(
    async (href: string, options?: { shallow?: boolean; replace?: boolean }) => {
      // Show loading state immediately
      setIsNavigating(true);
      
      // Navigate after a brief delay to ensure loading state is visible
      setTimeout(() => {
        navigateTo(href, options);
      }, 50);
    },
    [navigateTo]
  );

  return {
    isNavigating,
    navigateTo,
    navigateWithLoading,
  };
};

export default useOptimizedNavigation;