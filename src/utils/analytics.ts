import { envConfig } from '@/constant'

type EventParams = {
  category?: string
  label?: string
  value?: number
  [key: string]: unknown
}

export function trackEvent(action: string, params: EventParams = {}) {
  if (typeof window === 'undefined') return
  const gtag = (window as any).gtag
  if (!gtag) return
  gtag('event', action, params)
}

export function trackPageview(url: string) {
  if (typeof window === 'undefined') return
  const gtag = (window as any).gtag
  if (!gtag) return
  gtag('config', envConfig.GA_TRACKING_ID, { page_path: url })
}

export function installGlobalAnalyticsListeners() {
  if (typeof window === 'undefined') return
  if ((window as any).__analytics_listeners_installed) return
  ;(window as any).__analytics_listeners_installed = true

  // Delegate clicks on anchors, buttons, and elements with data-analytics
  document.addEventListener('click', (e) => {
    const el = (e.target as HTMLElement | null)?.closest(
      'a,button,[data-analytics]'
    ) as HTMLElement | null
    if (!el) return

    const label = (
      el.getAttribute('data-analytics-label') || el.textContent || ''
    )
      .trim()
      .slice(0, 120)

    const href = (el as HTMLAnchorElement).href
    const isOutbound = !!href && !href.includes(window.location.host)
    trackEvent(isOutbound ? 'outbound_click' : 'click', {
      category: 'interaction',
      label,
      href,
    })
  })

  // Delegate form submissions
  document.addEventListener(
    'submit',
    (e) => {
      const form = e.target as HTMLFormElement
      if (!form) return
      const name = form.getAttribute('name') || form.id || 'form'
      trackEvent('form_submit', { category: 'form', label: name })
    },
    true
  )
}

