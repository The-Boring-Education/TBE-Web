import { useRouter } from 'next/router';
import { useEffect } from 'react';

import { envConfig } from '@/constant';
import type { TrackEventProps } from '@/interfaces';
import { installGlobalAnalyticsListeners, trackEvent as sendEvent } from '@/utils/analytics';

const useAnalytics = () => {
  const router = useRouter();

  // Handle Route Changes (For Page Views)
  useEffect(() => {
    const handleRouteChange = (url: string) => {
      window.gtag('config', envConfig.GA_TRACKING_ID, {
        page_path: url,
      });
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
      value,
    });
  };

  return { trackEvent };
};

export default useAnalytics;
