import React from "react"
export const GA_TRACKING_ID = "G-SR3M17B588"

// Initialize GA
export const initGA = () => {
    console.log("Initializing Google Analytics...")
    if (typeof window !== "undefined") {
        const script1 = document.createElement("script")
        script1.async = true
        script1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`
        document.head.appendChild(script1)

        const script2 = document.createElement("script")
        script2.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${GA_TRACKING_ID}', {
        page_path: window.location.pathname,
      });
    `
        document.head.appendChild(script2)
        console.log("✅ GA scripts added to DOM")
    }
}

// Track page views
export const trackPageView = (url: string) => {
    console.log("📄 Tracking page view:", url)

    if (typeof window !== "undefined" && (window as any).gtag) {
        ;(window as any).gtag("config", GA_TRACKING_ID, {
            page_path: url
        })
    }
}

// Alias for backward compatibility
export const trackPageview = trackPageView

// Track custom events
export const trackEvent = (
    action: string,
    category: string,
    label?: string,
    value?: number
) => {
    if (typeof window !== "undefined" && (window as any).gtag) {
        ;(window as any).gtag("event", action, {
            event_category: category,
            event_label: label,
            value: value
        })
    }
}

// export {
//   initGA,
//   trackPageview,
//   trackEvent,
//   installGlobalAnalyticsListeners
// };
export function installGlobalAnalyticsListeners() {
    if (typeof window !== "undefined") {
        window.addEventListener("click", (event) => {
            // Example: custom analytics tracking for global clicks
            console.log("Global click event tracked:", event.target)
        })
    }
}
