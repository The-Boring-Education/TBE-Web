import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { TrackEventProps } from '@/interfaces';
import { envConfig } from '@/constant';

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
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  // Function to Track Custom Events
  const trackEvent = ({ action, category, label, value }: TrackEventProps) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', action, {
        event_category: category,
        event_label: label,
        value,
      });
    }
  };

  return { trackEvent };
};

export default useAnalytics;
