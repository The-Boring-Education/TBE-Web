export const GA_TRACKING_ID = "G-SR3M17B588";

// Initialize GA
export const initGA = () => {
  console.log("Initializing Google Analytics...");
  if (typeof window !== "undefined") {
    const script1 = document.createElement("script");
    script1.async = true;
    script1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`;
    document.head.appendChild(script1);

    const script2 = document.createElement("script");
    script2.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${GA_TRACKING_ID}', {
        page_path: window.location.pathname,
      });
    `;
    document.head.appendChild(script2);
    console.log("✅ GA scripts added to DOM");
  }
};

// Track page views
export const trackPageView = (url: string) => {
  console.log("📄 Tracking page view:", url);

  if (typeof window !== "undefined" && (window as any).gtag) {
    (window as any).gtag("config", GA_TRACKING_ID, {
      page_path: url,
    });
  }
};

// Alias for backward compatibility
export const trackPageview = trackPageView;

// Track custom events
export const trackEvent = (
  action: string,
  category: string,
  label?: string,
  value?: number,
) => {
  if (typeof window !== "undefined" && (window as any).gtag) {
    (window as any).gtag("event", action, {
      event_category: category,
      event_label: label,
      value,
    });
  }
};

// export {
//   initGA,
//   trackPageview,
//   trackEvent,
//   installGlobalAnalyticsListeners
// };
export function installGlobalAnalyticsListeners() {
  if (typeof window === "undefined") return;
  if ((window as any).__ga_global_listeners_installed) return;
  (window as any).__ga_global_listeners_installed = true;

  // Auto-track all button and link clicks via event delegation
  document.addEventListener("click", (e) => {
    const el = (e.target as HTMLElement)?.closest(
      "a,button,[data-analytics]",
    ) as HTMLElement | null;
    if (!el) return;

    const label = (
      el.getAttribute("data-analytics-label") ||
      el.textContent ||
      ""
    )
      .trim()
      .slice(0, 120);
    const href = (el as HTMLAnchorElement).href;
    let isOutbound = false;
    if (href) {
      try {
        isOutbound = new URL(href).host !== window.location.host;
      } catch {
        // ignore malformed URLs
      }
    }

    trackEvent(
      isOutbound ? "outbound_click" : "click",
      "interaction",
      label,
    );
  });

  // Auto-track form submissions
  document.addEventListener(
    "submit",
    (e) => {
      const form = e.target as HTMLFormElement;
      if (!form) return;
      const name = form.getAttribute("name") || form.id || "form";
      trackEvent("form_submit", "form", name);
    },
    true,
  );
}
