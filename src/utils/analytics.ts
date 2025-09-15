export const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || ""

type EventParams = {
    category?: string
    label?: string
    value?: number
    [key: string]: unknown
}

export function initGA() {
    if (typeof window === "undefined") return
    if (!GA_MEASUREMENT_ID) return
    if ((window as any).__ga_initialized) return
    ;(window as any).__ga_initialized = true

    if (!document.querySelector(`script[src*="googletagmanager.com/gtag/js"]`)) {
        const script = document.createElement("script")
        script.async = true
        script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`
        document.head.appendChild(script)
    }

    ;(window as any).dataLayer = (window as any).dataLayer || []
    function gtag(...args: any[]) {
        ;(window as any).dataLayer.push(args)
    }
    ;(window as any).gtag = gtag
    gtag("js", new Date())
    gtag("config", GA_MEASUREMENT_ID)
}

export function trackPageview(url: string) {
    if (typeof window === "undefined") return
    if (!(window as any).gtag || !GA_MEASUREMENT_ID) return
    ;(window as any).gtag("config", GA_MEASUREMENT_ID, { page_path: url })
}

export function trackEvent(action: string, params: EventParams = {}) {
    if (typeof window === "undefined") return
    if (!(window as any).gtag) return
    ;(window as any).gtag("event", action, params)
}

export function installGlobalListeners() {
    if (typeof window === "undefined") return
    if ((window as any).__ga_listeners_installed) return
    ;(window as any).__ga_listeners_installed = true

    document.addEventListener("click", (e) => {
        const el = (e.target as HTMLElement)?.closest("a,button,[data-analytics]") as HTMLElement | null
        if (!el) return
        const label = (el.getAttribute("data-analytics-label") || el.textContent || "").trim().slice(0, 120)
        const href = (el as HTMLAnchorElement).href
        const isOutbound = !!href && !href.includes(window.location.host)
        trackEvent(isOutbound ? "outbound_click" : "click", { category: "interaction", label, href })
    })

    document.addEventListener("submit", (e) => {
        const form = e.target as HTMLFormElement
        if (!form) return
        const name = form.getAttribute("name") || form.id || "form"
        trackEvent("form_submit", { category: "form", label: name })
    }, true)
}

