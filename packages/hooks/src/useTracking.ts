import {
  initGA,
  installGlobalAnalyticsListeners,
  trackEvent as sendEvent,
  trackPageview,
} from "@tbe/utils";
import { useRouter } from "next/router";
import { useCallback, useEffect } from "react";

export interface TrackingEventParams {
  action: string;
  category?: string;
  label?: string;
  value?: number;
  [key: string]: unknown;
}

/**
 * useTracking – single hook that initialises GA, installs global click/form
 * listeners, tracks page-views on route changes, and exposes a `trackEvent`
 * helper for custom events.
 *
 * Usage (Pages Router _app.tsx):
 *   const { trackEvent } = useTracking();
 */
const useTracking = () => {
  const router = useRouter();

  // Initialise GA & global listeners once
  useEffect(() => {
    initGA();
    installGlobalAnalyticsListeners();
  }, []);

  // Track page views on route changes
  useEffect(() => {
    // Track the initial page view
    trackPageview(router.asPath);

    const handleRouteChange = (url: string) => {
      trackPageview(url);
    };

    router.events.on("routeChangeComplete", handleRouteChange);
    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [router.events, router.asPath]);

  // Expose a typed trackEvent helper
  const trackEvent = useCallback(
    ({ action, category, label, value, ...rest }: TrackingEventParams) => {
      sendEvent(action, {
        ...(category && { category }),
        ...(label && { label }),
        ...(value !== undefined && { value }),
        ...rest,
      });
    },
    [],
  );

  return { trackEvent };
};

export default useTracking;
