import {
  installGlobalAnalyticsListeners,
  trackEvent as trackEventFromCore,
} from "@tbe/utils/analytics";

export const ANALYTICS_ID = import.meta.env.VITE_ANALYTICS_ID || "";

type EventParams = {
  category?: string;
  label?: string;
  value?: number;
  [key: string]: unknown;
};

export const initGA = (): void => {
  if (typeof window === "undefined") return;
  if (!ANALYTICS_ID) return;
  if ((window as Window & { __ga_initialized?: boolean }).__ga_initialized)
    return;
  (window as Window & { __ga_initialized?: boolean }).__ga_initialized = true;

  if (!document.querySelector(`script[src*="googletagmanager.com/gtag/js"]`)) {
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${ANALYTICS_ID}`;
    document.head.appendChild(script);
  }

  const w = window as Window & {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  };
  w.dataLayer = w.dataLayer || [];
  const gtag = (...args: unknown[]) => {
    w.dataLayer!.push(args);
  };
  w.gtag = gtag;
  gtag("js", new Date());
  gtag("config", ANALYTICS_ID);
};

export const trackPageview = (url: string): void => {
  if (typeof window === "undefined") return;
  const w = window as Window & { gtag?: (...args: unknown[]) => void };
  if (!w.gtag || !ANALYTICS_ID) return;
  w.gtag("config", ANALYTICS_ID, { page_path: url });
};

/** Forwards shared GA4 helper: adds page_path / app_id when configured. */
export const trackEvent = (action: string, params: EventParams = {}) => {
  trackEventFromCore(action, params);
};

export const installGlobalListeners = (): void => {
  installGlobalAnalyticsListeners({ appId: "onboarding" });
};
