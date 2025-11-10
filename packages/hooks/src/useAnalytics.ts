import { useRouter } from 'next/router';
import { useEffect } from 'react';

import { trackEvent as sendEvent, installGlobalAnalyticsListeners } from '@tbe/utils';
import type { TrackEventProps } from '@tbe/types';

const useAnalytics = () => {
  const router = useRouter();

  // Handle Route Changes (For Page Views)
  useEffect(() => {
    const handleRouteChange = (url: string) => {
      if (window.gtag && process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID) {
        window.gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID, {
          page_path: url,
        });
      }
    };

    router.events.on('routeChangeComplete', handleRouteChange);
    installGlobalAnalyticsListeners();
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  // Function to Track Custom Events
  const trackEvent = ({ action, category, label, value }: TrackEventProps) => {
    sendEvent(action, {
      category,
      label,
      value: value as number,
    });
  };

  return { trackEvent };
};

export default useAnalytics;
