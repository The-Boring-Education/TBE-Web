export const GA_TRACKING_ID =
  process.env.NEXT_PUBLIC_ANALYTICS_ID ||
  process.env.NEXT_PUBLIC_GA_TRACKING_ID ||
  process.env.NEXT_PUBLIC_ANALYTICS_ID ||
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ||
  "";
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}
export {};

/* -----------------------------
    LOAD GA
------------------------------ */
export const initGA = () => {
  if (typeof window === "undefined") return;
  if (!GA_TRACKING_ID) return;

  // Prevent double-initialization
  if ((window as any).__ga_initialized) return;
  (window as any).__ga_initialized = true;

  // gtag script
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
  if (typeof window !== "undefined" && (window as any).gtag) {
    (window as any).gtag("config", GA_TRACKING_ID, {
      page_path: url,
    });
  }
};

// backward compatibility
export const trackPageview = trackPageView;

/* -----------------------------
    GENERAL EVENT
------------------------------ */
export const trackEvent = (name: string, params: Record<string, any> = {}) => {
  if (typeof window !== "undefined" && (window as any).gtag) {
    (window as any).gtag("event", name, params);
  }
};

/* -----------------------------
    GLOBAL LISTENERS
------------------------------ */
export function installGlobalAnalyticsListeners() {
  if (typeof window === "undefined") return;

  // Auto track ALL button clicks
  window.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;
    if (target.tagName === "BUTTON") {
      trackEvent("button_click", {
        button_text: target.innerText,
        button_id: target.id || null,
      });
    }
  });
}

/* -----------------------------
   QUIZ EVENTS
------------------------------ */
export const trackQuizStart = (quizId: string) =>
  trackEvent("quiz_start", { quiz_id: quizId });

export const trackQuizAnswer = (
  quizId: string,
  questionId: string,
  correct: boolean,
) =>
  trackEvent("quiz_question_answered", {
    quiz_id: quizId,
    question_id: questionId,
    correct,
  });

export const trackQuizComplete = (quizId: string) =>
  trackEvent("quiz_complete", { quiz_id: quizId });

export const trackQuizScore = (quizId: string, score: number) =>
  trackEvent("quiz_score", { quiz_id: quizId, score });

/* -----------------------------
   COURSE EVENTS
------------------------------ */
export const trackCourseView = (courseId: string) =>
  trackEvent("course_view", { course_id: courseId });

export const trackEnrollClick = (courseId: string) =>
  trackEvent("enroll_click", { course_id: courseId });

/* -----------------------------
   USER EVENTS
------------------------------ */
export const trackLoginSuccess = (userId: string) =>
  trackEvent("login_success", { user_id: userId });

export const trackSignupSuccess = (userId: string) =>
  trackEvent("signup_success", { user_id: userId });

export const trackLogout = (userId: string) =>
  trackEvent("logout", { user_id: userId });
