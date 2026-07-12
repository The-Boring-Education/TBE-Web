import { useAuth } from "@tbe/auth";
import { ANALYTICS_EVENTS, getLoginCardVariantConfig } from "@tbe/constants";
import { useAnalytics } from "@tbe/hooks";
import type { LoginCardNewProps } from "@tbe/interface";
import { trackEvent as sendEvent } from "@tbe/utils";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, BookOpen, Lock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo } from "react";

// TBE brand red — hsl(0 100% 67.1%) = #FF5757
// Replaces emerald-* from the resources login page
const ACCENT = "#FF5757";
const ACCENT_BG = "rgba(255,87,87,0.15)"; // bg-emerald-500/15 equivalent
const ACCENT_RING = "rgba(255,87,87,0.30)"; // ring-emerald-500/30 equivalent

// Per-variant text config — drives the left heading line 2,
// the card h2, card description, and the info-row bullets.
const VARIANT_COPY: Record<
  string,
  {
    appName: string;
    headingLine2: string;
    cardH2Line1: string;
    cardH2Line2: string;
    cardDesc: string;
    infoBullets: string[];
  }
> = {
  default: {
    appName: "The Boring Education",
    headingLine2: "Learning Platform",
    cardH2Line1: "Sign in to continue",
    cardH2Line2: "your journey",
    cardDesc: "One click with Google — no password required.",
    infoBullets: [
      "Sign in with your Google account",
      "No password needed",
      "No spam, ever",
    ],
  },
  platform: {
    appName: "The Boring Education",
    headingLine2: "Learning Platform",
    cardH2Line1: "Sign in to continue",
    cardH2Line2: "your journey",
    cardDesc: "One click with Google — no password required.",
    infoBullets: [
      "Sign in with your Google account",
      "No password needed",
      "No spam, ever",
    ],
  },
  prepyatra: {
    appName: "PrepYatra",
    headingLine2: "Interview Prep",
    cardH2Line1: "Continue your",
    cardH2Line2: "interview prep",
    cardDesc:
      "Sign in to track applications, prep resources, and your progress.",
    infoBullets: [
      "Sign in with your Google account",
      "No password needed",
      "No spam, ever",
    ],
  },
  dsayatra: {
    appName: "DSA Yatra",
    headingLine2: "DSA Practice",
    cardH2Line1: "Continue your",
    cardH2Line2: "DSA journey",
    cardDesc:
      "Sign in to access your sheets, track progress, and keep the streak alive.",
    infoBullets: [
      "Sign in with your Google account",
      "No password needed",
      "No spam, ever",
    ],
  },
  oncampus: {
    appName: "OnCampus",
    headingLine2: "Campus Prep",
    cardH2Line1: "Continue your",
    cardH2Line2: "campus prep",
    cardDesc:
      "Sign in to access DSA, aptitude, core subjects, interview sheets, and resume builder.",
    infoBullets: [
      "Sign in with your Google account",
      "No password needed",
      "No spam, ever",
    ],
  },
  "resume-yatra": {
    appName: "ResumeYatra",
    headingLine2: "Resume Builder",
    cardH2Line1: "Build your perfect",
    cardH2Line2: "resume",
    cardDesc:
      "Sign in to save your resume, track your score, and access from anywhere.",
    infoBullets: [
      "Sign in with your Google account",
      "No password needed",
      "No spam, ever",
    ],
  },
  quizes: {
    appName: "The Boring Quizes",
    headingLine2: "Quiz Platform",
    cardH2Line1: "Test your",
    cardH2Line2: "knowledge",
    cardDesc:
      "Sign in to track your scores, compete on the leaderboard, and keep learning.",
    infoBullets: [
      "Sign in with your Google account",
      "No password needed",
      "No spam, ever",
    ],
  },
};

const LoginCardNew = ({
  variant = "default",
  customRedirectPath,
  theme,
}: LoginCardNewProps) => {
  const router = useRouter();
  const { trackEvent } = useAnalytics();
  const { signIn, isAuthenticated, isLoading } = useAuth();

  const variantConfig = useMemo(() => {
    const configs = getLoginCardVariantConfig();
    return (
      configs[variant] ??
      configs.default ?? {
        title: "Welcome Back!",
        subtitle: "Sign in to continue your tech learning journey",
        features: [],
        redirectPath: "/",
        termsHref: "/terms-and-conditions",
      }
    );
  }, [variant]);

  const copy = VARIANT_COPY[variant] ?? VARIANT_COPY.default!;

  const isLight = useMemo(() => {
    if (theme === "light") return true;
    if (theme === "dark") return false;
    return (
      variant === "prepyatra" ||
      variant === "resume-yatra" ||
      variant === "quizes" ||
      variant === "platform"
    );
  }, [theme, variant]);

  const redirectPath = useMemo(() => {
    if (customRedirectPath) return customRedirectPath;
    if (router.query.redirect) return String(router.query.redirect);
    if (router.query.callbackUrl) return String(router.query.callbackUrl);
    return variantConfig.redirectPath ?? "/";
  }, [customRedirectPath, router.query, variantConfig.redirectPath]);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace(redirectPath);
    }
  }, [isAuthenticated, router, redirectPath]);

  const handleSignIn = async () => {
    trackEvent({
      action: ANALYTICS_EVENTS.USER_LOGIN,
      category: "User",
      label: "User Logged In",
    });
    try {
      sendEvent(ANALYTICS_EVENTS.LOGIN_CLICK, {
        category: "auth",
        label: "Continue with Google",
      });
    } catch {
      /* ignore */
    }
    await signIn(redirectPath);
  };

  const features = variantConfig.features ?? [];

  // ─────────────────────────────────────────────────────────────
  // Exact layout copied from resources/src/app/(site)/login/page.tsx
  // Only changes: emerald-* → ACCENT constant, dynamic text from
  // VARIANT_COPY & variantConfig, and `useRouter` instead of
  // `useSearchParams` (pages router compatibility).
  //
  // NOTE: We use arbitrary values (e.g. px-[32px], gap-[12px]) instead of standard Tailwind spacing
  // classes (e.g. px-8, gap-3) to ensure correct visual proportions across all host apps, since
  // some apps (like dsayatra, resume-yatra, platform) have custom spacing configurations that
  // scale up the standard spacing classes by 2x, resulting in distorted cards.
  // ─────────────────────────────────────────────────────────────
  return (
    <div
      className={`relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-[16px] py-[40px] ${isLight ? "bg-[#f9fafb]" : "bg-[#0a0a0b]"}`}
    >
      {/* Back link */}
      <motion.div
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        className="absolute left-6 top-6 sm:left-10 sm:top-8"
      >
        <Link
          href="/"
          className={`inline-flex items-center gap-1.5 text-xs font-medium transition-colors ${isLight ? "text-zinc-500 hover:text-zinc-800" : "text-zinc-500 hover:text-zinc-300"}`}
        >
          <ArrowLeft
            className="h-3.5 w-3.5"
            style={{ height: "14px", width: "14px" }}
          />
          Back to home
        </Link>
      </motion.div>

      {/* Glow blob — top right (was emerald-500/10, now TBE red) */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 right-[-10%] h-[420px] w-[420px] rounded-full blur-[120px]"
        style={{
          backgroundColor: isLight
            ? "rgba(255,87,87,0.06)"
            : "rgba(255,87,87,0.10)",
        }}
      />

      <div className="relative z-10 mx-auto w-full max-w-[880px]">
        <div className="grid grid-cols-1 gap-[32px] lg:grid-cols-2 lg:gap-[64px] lg:items-center">
          {/* ── Left column: copy ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Brand wordmark — h-[28px] w-[28px] badge + app name */}
            <div className="mb-[20px] flex items-center gap-[8px]">
              <div
                className="flex h-[28px] w-[28px] items-center justify-center rounded-lg"
                style={{
                  backgroundColor: ACCENT_BG,
                  boxShadow: `0 0 0 1px ${ACCENT_RING}`,
                }}
              >
                <BookOpen
                  className="h-[14px] w-[14px]"
                  style={{ color: ACCENT }}
                />
              </div>
              <span
                className={`text-xs font-semibold tracking-wide ${isLight ? "text-zinc-700" : "text-zinc-200"}`}
              >
                {copy.appName}
              </span>
            </div>

            {/* h1 — "The Boring Education" + colored line 2 */}
            <h1
              className={`text-2xl font-semibold leading-snug tracking-tight sm:text-3xl ${isLight ? "text-zinc-900" : "text-zinc-100"}`}
            >
              The Boring Education
              <br />
              <span style={{ color: ACCENT }}>{copy.headingLine2}</span>
            </h1>

            {/* Subtitle */}
            <p
              className={`mt-[12px] max-w-sm text-sm leading-relaxed ${isLight ? "text-zinc-600" : "text-zinc-500"}`}
            >
              {variantConfig.subtitle}
            </p>

            {/* Feature list — exact classes from resources */}
            {features.length > 0 && (
              <ul className="mt-[24px] space-y-[12px]">
                {features.map(({ icon: Icon, title, description }) => (
                  <li key={title} className="flex items-start gap-[10px]">
                    <div
                      className={`mt-[2px] flex h-[24px] w-[24px] shrink-0 items-center justify-center rounded-lg ring-1 ${isLight ? "bg-zinc-100 ring-zinc-200" : "bg-zinc-800/80 ring-zinc-700/60"}`}
                    >
                      <Icon
                        className={`h-[12px] w-[12px] ${isLight ? "text-zinc-500" : "text-zinc-400"}`}
                      />
                    </div>
                    <div>
                      <p
                        className={`text-xs font-medium ${isLight ? "text-zinc-800" : "text-zinc-200"}`}
                      >
                        {title}
                      </p>
                      <p
                        className={`mt-[2px] text-[11px] ${isLight ? "text-zinc-600/70" : "text-zinc-500"}`}
                      >
                        {description}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {/* Social proof — was bg-emerald-500, now TBE red */}
            <div className="mt-[24px] flex items-center gap-[8px]">
              <span
                className="h-[5px] w-[5px] rounded-full"
                style={{ backgroundColor: ACCENT }}
              />
              <p
                className={`text-[11px] ${isLight ? "text-zinc-600" : "text-zinc-500"}`}
              >
                <span
                  className={`font-medium ${isLight ? "text-zinc-800" : "text-zinc-300"}`}
                >
                  10,000+
                </span>{" "}
                developers learning with TBE
              </p>
            </div>
          </motion.div>

          {/* ── Right column: card ── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.12,
              duration: 0.55,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="relative"
          >
            {/* Border gradient — exact from resources */}
            <div
              className={`absolute -inset-px rounded-2xl bg-gradient-to-b to-transparent ${isLight ? "from-zinc-200/80 via-zinc-200/30" : "from-zinc-700/70 via-zinc-800/30"}`}
            />

            <div
              className={`relative rounded-2xl border px-[20px] py-[20px] backdrop-blur-xl ${isLight ? "border-zinc-200/80 bg-[#ffffff]/98 shadow-[0_8px_30px_rgb(0,0,0,0.04)]" : "border-zinc-800/80 bg-[#0e0e0e]/95"}`}
            >
              {/* Lock badge */}
              <div className="mb-[12px] flex items-center gap-[8px]">
                <div
                  className={`flex h-[24px] w-[24px] items-center justify-center rounded-lg ring-1 ${isLight ? "bg-zinc-100 ring-zinc-200" : "bg-zinc-800 ring-zinc-700/60"}`}
                >
                  <Lock
                    className={`h-[12px] w-[12px] ${isLight ? "text-zinc-500" : "text-zinc-400"}`}
                  />
                </div>
                <span className="text-[10px] font-medium tracking-widest text-zinc-500 uppercase">
                  Members only
                </span>
              </div>

              {/* Card h2 ── */}
              <h2
                className={`text-lg font-semibold leading-snug tracking-tight ${isLight ? "text-zinc-900" : "text-zinc-100"}`}
              >
                {copy.cardH2Line1}
                <br />
                <span style={{ color: ACCENT }}>{copy.cardH2Line2}</span>
              </h2>

              <p
                className={`mt-[6px] text-xs leading-relaxed ${isLight ? "text-zinc-600" : "text-zinc-500"}`}
              >
                {copy.cardDesc}
              </p>

              {/* Google sign-in CTA ── */}
              <button
                id={`google-signin-btn-${variant}`}
                onClick={handleSignIn}
                disabled={isLoading || isAuthenticated}
                className={`mt-[16px] group flex w-full items-center justify-between rounded-xl px-[12px] py-[10px] text-xs font-medium ring-1 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${isLight ? "bg-white hover:bg-zinc-50 ring-zinc-200/80 text-zinc-800 border border-zinc-200/80" : "bg-zinc-800 hover:bg-zinc-700 ring-zinc-700/60 text-zinc-100"}`}
              >
                <span className="flex items-center gap-[10px]">
                  <svg
                    className="h-[14px] w-[14px] shrink-0"
                    viewBox="0 0 24 24"
                    aria-hidden
                  >
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  {isLoading ? "Signing in…" : "Continue with Google"}
                </span>
                <ArrowRight
                  className={`h-[14px] w-[14px] transition-transform group-hover:translate-x-0.5 ${isLight ? "text-zinc-500" : "text-zinc-400"}`}
                />
              </button>

              {/* Divider ── */}
              <div className="my-[12px] flex items-center gap-[10px]">
                <div
                  className={`h-px flex-1 ${isLight ? "bg-zinc-200" : "bg-zinc-800"}`}
                />
                <span
                  className={`text-[10px] ${isLight ? "text-zinc-400" : "text-zinc-600"}`}
                >
                  or
                </span>
                <div
                  className={`h-px flex-1 ${isLight ? "bg-zinc-200" : "bg-zinc-800"}`}
                />
              </div>

              {/* Info row ── */}
              <div className="space-y-[6px] text-xs text-zinc-600">
                {copy.infoBullets.map((item) => (
                  <div key={item} className="flex items-center gap-[8px]">
                    <span
                      className={`h-[3px] w-[3px] rounded-full ${isLight ? "bg-zinc-400" : "bg-zinc-600"}`}
                    />
                    <span
                      className={`text-[11px] ${isLight ? "text-zinc-600" : ""}`}
                    >
                      {item}
                    </span>
                  </div>
                ))}
              </div>

              {/* Footer ── */}
              <p
                className={`mt-[16px] text-[10px] ${isLight ? "text-zinc-500" : "text-zinc-700"}`}
              >
                By signing in you agree to our{" "}
                <a
                  href={
                    variantConfig.termsHref ??
                    "https://theboringeducation.com/terms"
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`underline underline-offset-2 transition-colors ${isLight ? "text-zinc-600 hover:text-zinc-800" : "text-zinc-500 hover:text-zinc-300"}`}
                >
                  Terms
                </a>{" "}
                &{" "}
                <a
                  href={
                    variantConfig.privacyHref ??
                    "https://theboringeducation.com/privacy"
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`underline underline-offset-2 transition-colors ${isLight ? "text-zinc-600 hover:text-zinc-800" : "text-zinc-500 hover:text-zinc-300"}`}
                >
                  Privacy Policy
                </a>
                .
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default LoginCardNew;
