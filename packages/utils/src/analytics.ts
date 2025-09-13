export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || ""

type EventParams = {
    category?: string
    label?: string
    value?: number
    [key: string]: unknown
}

declare global {
    interface Window {
        gtag: (...args: any[]) => void
        dataLayer: any[]
        __ga_initialized?: boolean
        __analytics_listeners_installed?: boolean
    }
}

export function initGA() {
    if (typeof window === "undefined") return
    if (!GA_MEASUREMENT_ID) return
    if (window.__ga_initialized) return

    window.__ga_initialized = true

    // Load gtag.js dynamically if not already present
    if (
        !document.querySelector('script[src*="googletagmanager.com/gtag/js"]')
    ) {
        const script = document.createElement("script")
        script.async = true
        script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`
        document.head.appendChild(script)
    }

    // Initialize dataLayer and gtag
    window.dataLayer = window.dataLayer || []
    function gtag(...args: any[]) {
        window.dataLayer.push(args)
    }
    window.gtag = gtag
    gtag("js", new Date())
    gtag("config", GA_MEASUREMENT_ID)
}

export function trackPageview(url: string) {
    if (typeof window === "undefined") return
    if (!window.gtag || !GA_MEASUREMENT_ID) return

    window.gtag("config", GA_MEASUREMENT_ID, {
        page_path: url
    })
}

export function trackEvent(action: string, params: EventParams = {}) {
    if (typeof window === "undefined") return
    if (!window.gtag) return

    window.gtag("event", action, params)
}

export function installGlobalAnalyticsListeners() {
    if (typeof window === "undefined") return
    if (window.__analytics_listeners_installed) return

    window.__analytics_listeners_installed = true

    // Delegate clicks on buttons and links
    document.addEventListener("click", (e) => {
        const target = e.target as HTMLElement | null
        if (!target) return

        const el = target.closest(
            "a,button,[data-analytics]"
        ) as HTMLElement | null
        if (!el) return

        const label = (
            el.getAttribute("data-analytics-label") ||
            el.textContent ||
            ""
        )
            .trim()
            .slice(0, 120)

        const href = (el as HTMLAnchorElement).href
        const isOutbound = !!href && !href.includes(window.location.host)

        trackEvent(isOutbound ? "outbound_click" : "click", {
            category: "interaction",
            label,
            href
        })
    })

    // Delegate form submissions
    document.addEventListener(
        "submit",
        (e) => {
            const form = e.target as HTMLFormElement
            if (!form) return

            const name = form.getAttribute("name") || form.id || "form"
            trackEvent("form_submit", {
                category: "form",
                label: name
            })
        },
        true
    )
}
