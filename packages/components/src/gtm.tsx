/**
 * Google Tag Manager Component
 * 
 * Provides GTM container code for Next.js applications.
 * Should be added to _document.tsx for proper initialization.
 * 
 * @see https://developers.google.com/tag-manager/quickstart
 */

import { envConfig } from "@tbe/constants"

/**
 * Get GTM Container ID from environment variables
 */
export const GTM_ID = envConfig.GTM_ID || process.env.NEXT_PUBLIC_GTM_ID || ""

/**
 * Google Tag Manager Script Component
 * 
 * This component should be placed in the <Head> section of _document.tsx
 * It includes the GTM container snippet that initializes GTM on page load.
 */
export const GTMScript = () => {
    if (!GTM_ID) {
        console.warn("⚠️ GTM_ID not configured. Google Tag Manager will not be initialized.")
        return null
    }

    return (
        <>
            {/* Google Tag Manager */}
            <script
                dangerouslySetInnerHTML={{
                    __html: `
                        (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                        })(window,document,'script','dataLayer','${GTM_ID}');
                    `,
                }}
            />
        </>
    )
}

/**
 * Google Tag Manager NoScript Component
 * 
 * This component should be placed immediately after the opening <body> tag in _document.tsx
 * It provides a fallback for users with JavaScript disabled.
 */
export const GTMNoScript = () => {
    if (!GTM_ID) {
        return null
    }

    return (
        <noscript>
            <iframe
                src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
                height="0"
                width="0"
                style={{ display: "none", visibility: "hidden" }}
            />
        </noscript>
    )
}

/**
 * Push data to GTM dataLayer
 * 
 * Use this function to send custom events or data to GTM
 * 
 * @example
 * ```ts
 * pushToDataLayer({
 *   event: 'page_view',
 *   page_path: '/dashboard',
 *   user_type: 'premium'
 * });
 * ```
 */
export const pushToDataLayer = (data: Record<string, any>) => {
    if (typeof window !== "undefined" && (window as any).dataLayer) {
        (window as any).dataLayer.push(data)
    }
}

/**
 * Track page view in GTM
 * 
 * Call this function when navigating to a new page (e.g., in Next.js router events)
 * 
 * @param url - The URL of the page being viewed
 */
export const trackGTMPageView = (url: string) => {
    pushToDataLayer({
        event: "page_view",
        page_path: url,
        page_location: typeof window !== "undefined" ? window.location.href : url,
    })
}

/**
 * Track custom event in GTM
 * 
 * @param eventName - Name of the event
 * @param eventData - Additional event data
 * 
 * @example
 * ```ts
 * trackGTMEvent('button_click', {
 *   button_name: 'signup',
 *   button_location: 'hero_section'
 * });
 * ```
 */
export const trackGTMEvent = (eventName: string, eventData?: Record<string, any>) => {
    pushToDataLayer({
        event: eventName,
        ...eventData,
    })
};

