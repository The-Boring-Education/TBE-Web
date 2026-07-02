import {
  ANALYTICS_EVENTS,
  type AnalyticsEventName,
  type AnalyticsEventParams,
} from "@tbe/constants";

/**
 * GA4 instrumentation for TBE products.
 *
 * Data attributes for richer `ui_click` payloads (recommended on CTAs):
 * - data-tbe-analytics — mark any element as the analytics target when it is not a native button/link
 * - data-tbe-analytics-id — stable id for reporting (prefer over transient copy)
 * - data-tbe-analytics-label — human-readable label when inner text is poor
 * - data-tbe-surface — optional; set on container to attribute clicks to a feature/page slice
 *
 * Omit automatic delegation for an element when you already fire precise `trackEvent` calls:
 * - data-tbe-analytics-skip-global
 */

export const TBE_ANALYTICS_ATTR_MARKER = "data-tbe-analytics";
export const TBE_ANALYTICS_ATTR_ID = "data-tbe-analytics-id";
export const TBE_ANALYTICS_ATTR_LABEL = "data-tbe-analytics-label";
export const TBE_ANALYTICS_ATTR_SURFACE = "data-tbe-surface";
export const TBE_ANALYTICS_ATTR_SKIP_GLOBAL = "data-tbe-analytics-skip-global";

export const LEGACY_ANALYTICS_ATTR_MARKER = "data-analytics";
export const LEGACY_ANALYTICS_ATTR_LABEL = "data-analytics-label";

const CAPTURE_CLICK_GUARD_KEY = "__tbeAnalyticsCaptureClickInstalled";

let delegatedClickCaptureHandler: ((e: MouseEvent) => void) | undefined;

let delegatedSubmitCaptureHandler: EventListener | undefined;

const INTERACTIVE_CLICK_SELECTOR = [
  "button:not([disabled])",
  "a[href]",
  '[role="button"]:not([aria-disabled="true"])',
  `[${TBE_ANALYTICS_ATTR_MARKER}]`,
  `[${LEGACY_ANALYTICS_ATTR_MARKER}]`,
  'input[type="submit"]:not(:disabled)',
  'input[type="button"]:not(:disabled)',
].join(",");

declare global {
  interface Window {
    gtag?: GtagFn;
    dataLayer?: unknown[];
    [CAPTURE_CLICK_GUARD_KEY]?: boolean;
  }
}

type GtagFn = (...args: unknown[]) => void;

export interface AnalyticsTrackParams {
  omit_auto_context?: boolean;
  app_id?: string;
  page_path?: string | null;
  [key: string]: unknown;
}

/** Build-time ID for the current SPA (set per deployed app). */
export const GA_TRACKING_ID =
  process.env.NEXT_PUBLIC_ANALYTICS_ID ||
  process.env.NEXT_PUBLIC_GA_TRACKING_ID ||
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ||
  "";

/** Stable product slug for GA custom dimension `app_id` (NEXT_PUBLIC_* or VITE_* at build time). */
export const readTbeAppIdFromEnv = (): string => {
  if (typeof process === "undefined") return "";
  return (process.env.NEXT_PUBLIC_TBE_APP_ID ??
    process.env.VITE_TBE_APP_ID ??
    "") as string;
};

export type InstallGlobalAnalyticsListenersOptions = {
  /**
   * Use when compile-time env is unavailable (e.g. Vite stubbing `process.env`).
   * Passed-through to `trackEvent` as `app_id` when callers do not override it.
   */
  appId?: string;
  /** Capture delegated form submits (`ui_form_submit`). Default true. */
  trackFormSubmits?: boolean;
};

type ResolvedInstallOptions = {
  appId?: string;
  trackFormSubmits: boolean;
};

let lastInstallOptions: ResolvedInstallOptions = {
  trackFormSubmits: true,
};

const mergeInstallOptions = (
  opts?: InstallGlobalAnalyticsListenersOptions,
): void => {
  if (!opts) return;
  lastInstallOptions = {
    appId: opts.appId !== undefined ? opts.appId : lastInstallOptions.appId,
    trackFormSubmits:
      opts.trackFormSubmits ?? lastInstallOptions.trackFormSubmits,
  };
};

const resolveAnalyticsAppId = (
  explicit?: string | null | undefined,
): string | undefined => {
  if (typeof explicit === "string" && explicit.trim() !== "") {
    return explicit;
  }
  if (lastInstallOptions.appId && lastInstallOptions.appId.trim() !== "") {
    return lastInstallOptions.appId;
  }
  const envId = readTbeAppIdFromEnv();
  return envId.trim() !== "" ? envId : undefined;
};

const currentPagePath = (): string => {
  if (typeof window === "undefined") return "";
  return `${window.location.pathname}${window.location.search}`;
};

const sanitizePathOrHref = (fullUrl: string, maxLen = 200): string => {
  try {
    const u = new URL(fullUrl, window.location.origin);
    const normalized = `${u.pathname}${u.search}`;
    return normalized.length <= maxLen
      ? normalized
      : `${normalized.slice(0, maxLen)}…`;
  } catch {
    return fullUrl.slice(0, maxLen);
  }
};

const anchorIsOutbound = (el: HTMLAnchorElement): boolean => {
  const href = el.getAttribute("href");
  const lower = href?.toLowerCase() ?? "";
  if (
    !href ||
    href.startsWith("#") ||
    lower.startsWith("javascript:") ||
    lower.startsWith("data:") ||
    lower.startsWith("vbscript:")
  ) {
    return false;
  }
  try {
    const u = new URL(el.href, window.location.href);
    return u.host !== window.location.host;
  } catch {
    return false;
  }
};

const readSurfaceFromAncestors = (
  el: HTMLElement | null,
): string | undefined => {
  let node: HTMLElement | null = el;
  while (node) {
    const s = node.getAttribute(TBE_ANALYTICS_ATTR_SURFACE);
    if (s && s.trim() !== "") return s.trim().slice(0, 120);
    node = node.parentElement;
  }
  return undefined;
};

const readClickLabel = (interactive: HTMLElement): string => {
  const explicit =
    interactive.getAttribute(TBE_ANALYTICS_ATTR_LABEL)?.trim() ||
    interactive.getAttribute(LEGACY_ANALYTICS_ATTR_LABEL)?.trim();
  if (explicit) return explicit.slice(0, 120);
  const text = interactive.textContent?.trim() || "";
  return text.slice(0, 120);
};

const readElementAnalyticsId = (interactive: HTMLElement): string | null => {
  const dataId =
    interactive.getAttribute(TBE_ANALYTICS_ATTR_ID)?.trim() ||
    interactive.id?.trim();
  return dataId && dataId.length > 0 ? dataId.slice(0, 120) : null;
};

const enrichEventParams = (
  params: AnalyticsTrackParams,
): AnalyticsTrackParams => {
  if (params.omit_auto_context) {
    const { omit_auto_context: omitted, ...rest } = params;
    void omitted;
    return rest;
  }
  const enriched: AnalyticsTrackParams = { ...params };
  if (
    enriched.page_path === undefined &&
    typeof window !== "undefined" &&
    window.location
  ) {
    enriched.page_path = currentPagePath();
  }
  const appId = resolveAnalyticsAppId(
    typeof enriched.app_id === "string" ? enriched.app_id : undefined,
  );
  if (appId) {
    enriched.app_id = appId;
  }
  return enriched;
};

/* -----------------------------
    LOAD GA
------------------------------ */
export const initGA = () => {
  if (typeof window === "undefined") return;
  if (!GA_TRACKING_ID) return;

  if ((window as Window & { __ga_initialized?: boolean }).__ga_initialized)
    return;
  (window as Window & { __ga_initialized?: boolean }).__ga_initialized = true;

  const s1 = document.createElement("script");
  s1.async = true;
  s1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`;
  document.head.appendChild(s1);

  const s2 = document.createElement("script");
  s2.innerHTML = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${GA_TRACKING_ID}', { page_path: window.location.pathname });
  `;
  document.head.appendChild(s2);
};

/* -----------------------------
    PAGE VIEW
------------------------------ */
export const trackPageView = (url: string) => {
  if (typeof window !== "undefined" && window.gtag && GA_TRACKING_ID) {
    window.gtag("config", GA_TRACKING_ID, {
      page_path: url,
    });
  }
};

export const trackPageview = trackPageView;

/* -----------------------------
    GENERAL EVENT
------------------------------ */
export function trackEvent<E extends AnalyticsEventName>(
  name: E,
  params?: AnalyticsEventParams<E> & AnalyticsTrackParams,
): void;
export function trackEvent(name: string, params?: AnalyticsTrackParams): void;
export function trackEvent(
  name: string,
  params: AnalyticsTrackParams = {},
): void {
  if (typeof window === "undefined" || typeof window.gtag !== "function")
    return;
  window.gtag("event", name, enrichEventParams(params));
}

/**
 * Removes delegated listeners registered by {@link installGlobalAnalyticsListeners}.
 * **Only call from Vitest teardown** — not from runtime application code.
 * @internal
 */
export const resetDelegatedAnalyticsListenersForTesting = (): void => {
  if (typeof document === "undefined") return;

  if (delegatedClickCaptureHandler) {
    document.removeEventListener("click", delegatedClickCaptureHandler, true);
    delegatedClickCaptureHandler = undefined;
  }

  if (delegatedSubmitCaptureHandler) {
    document.removeEventListener("submit", delegatedSubmitCaptureHandler, true);
    delegatedSubmitCaptureHandler = undefined;
  }

  if (typeof window !== "undefined") {
    delete window[CAPTURE_CLICK_GUARD_KEY];
  }

  lastInstallOptions = { trackFormSubmits: true };
};

const delegatedClickCaptureHandlerBody = (e: MouseEvent): void => {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey) return;
  const target = e.target;
  if (!target || !(target instanceof HTMLElement)) return;

  const interactive = target.closest(
    INTERACTIVE_CLICK_SELECTOR,
  ) as HTMLElement | null;
  if (!interactive || interactive.closest("[data-ignore-tbe-analytics]")) {
    return;
  }
  if (
    interactive.hasAttribute(TBE_ANALYTICS_ATTR_SKIP_GLOBAL) ||
    interactive.getAttribute(TBE_ANALYTICS_ATTR_SKIP_GLOBAL) === ""
  ) {
    return;
  }

  const tagName = interactive.tagName.toLowerCase();
  const elementIdRaw = readElementAnalyticsId(interactive);
  let hrefSanitized: string | undefined;
  let isOutbound = false;

  if (interactive instanceof HTMLAnchorElement) {
    const rawHref = interactive.href;
    if (rawHref) {
      hrefSanitized = sanitizePathOrHref(rawHref);
      isOutbound = anchorIsOutbound(interactive);
    }
  }

  trackEvent(ANALYTICS_EVENTS.UI_CLICK, {
    interaction_type: "click",
    element_tag: tagName,
    ...(elementIdRaw ? { element_id: elementIdRaw } : {}),
    click_label: readClickLabel(interactive),
    surface: readSurfaceFromAncestors(interactive),
    ...(hrefSanitized !== undefined
      ? { link_href: hrefSanitized, is_outbound: isOutbound }
      : {}),
  });
};

const delegatedSubmitCaptureHandlerBody = (e: Event): void => {
  const form = e.target instanceof HTMLFormElement ? e.target : null;
  if (!form || form.closest("[data-ignore-tbe-analytics]")) return;
  if (
    form.hasAttribute(TBE_ANALYTICS_ATTR_SKIP_GLOBAL) ||
    form.getAttribute(TBE_ANALYTICS_ATTR_SKIP_GLOBAL) === ""
  ) {
    return;
  }
  const formName =
    form.getAttribute("name")?.trim() || form.id?.trim() || undefined;
  trackEvent(ANALYTICS_EVENTS.UI_FORM_SUBMIT, {
    interaction_type: "form_submit",
    form_name: formName ?? "anonymous_form",
    surface: readSurfaceFromAncestors(form),
  });
};

/* -----------------------------
    GLOBAL DELEGATED LISTENERS
------------------------------ */
export const installGlobalAnalyticsListeners = (
  options?: InstallGlobalAnalyticsListenersOptions,
): void => {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  mergeInstallOptions(options);

  if (window[CAPTURE_CLICK_GUARD_KEY]) return;
  window[CAPTURE_CLICK_GUARD_KEY] = true;

  delegatedClickCaptureHandler = delegatedClickCaptureHandlerBody;
  document.addEventListener("click", delegatedClickCaptureHandler, true);

  if (lastInstallOptions.trackFormSubmits) {
    delegatedSubmitCaptureHandler =
      delegatedSubmitCaptureHandlerBody as EventListener;
    document.addEventListener("submit", delegatedSubmitCaptureHandler, true);
  }
};

/* -----------------------------
   QUIZ EVENTS
------------------------------ */
export const trackQuizStart = (quizId: string) =>
  trackEvent(ANALYTICS_EVENTS.QUIZ_START, { quiz_id: quizId });

export const trackQuizAnswer = (
  quizId: string,
  questionId: string,
  correct: boolean,
) =>
  trackEvent(ANALYTICS_EVENTS.QUIZ_QUESTION_ANSWERED, {
    quiz_id: quizId,
    question_id: questionId,
    correct,
  });

export const trackQuizComplete = (quizId: string) =>
  trackEvent(ANALYTICS_EVENTS.QUIZ_COMPLETE, { quiz_id: quizId });

export const trackQuizScore = (quizId: string, score: number) =>
  trackEvent(ANALYTICS_EVENTS.QUIZ_SCORE, { quiz_id: quizId, score });

/* -----------------------------
   COURSE EVENTS
------------------------------ */
export const trackCourseView = (courseId: string) =>
  trackEvent(ANALYTICS_EVENTS.COURSE_VIEW, { course_id: courseId });

export const trackEnrollClick = (courseId: string) =>
  trackEvent(ANALYTICS_EVENTS.ENROLL_CLICK, { course_id: courseId });

/* -----------------------------
   USER IDENTITY (GA4 User-ID)
------------------------------ */
export const setAnalyticsUser = (userId: string): void => {
  if (typeof window === "undefined" || !userId.trim()) return;
  if (!GA_TRACKING_ID || typeof window.gtag !== "function") return;
  window.gtag("config", GA_TRACKING_ID, { user_id: userId });
};

export const clearAnalyticsUser = (): void => {
  if (typeof window === "undefined") return;
  if (!GA_TRACKING_ID || typeof window.gtag !== "function") return;
  window.gtag("config", GA_TRACKING_ID, { user_id: undefined });
};

/* -----------------------------
   USER EVENTS
------------------------------ */
export const trackLoginSuccess = (userId: string) =>
  trackEvent(ANALYTICS_EVENTS.LOGIN_SUCCESS, { user_id: userId });

export const trackSignupSuccess = (userId: string) =>
  trackEvent(ANALYTICS_EVENTS.SIGNUP_SUCCESS, { user_id: userId });

export const trackLogout = (userId: string) =>
  trackEvent(ANALYTICS_EVENTS.LOGOUT, { user_id: userId });

export const trackUserActivated = (
  userId: string,
  productId?: string,
): void => {
  trackEvent(ANALYTICS_EVENTS.USER_ACTIVATED, {
    user_id: userId,
    ...(productId ? { product_id: productId } : {}),
  });
};

export const PENDING_AUTH_ANALYTICS_KEY = "tbe_pending_auth_analytics";
