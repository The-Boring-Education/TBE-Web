"use client";

import { useAuth } from "@tbe/auth";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Lock,
  Map,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

const FEATURES = [
  {
    icon: BookOpen,
    label: "Learning Guides",
    desc: "Step-by-step technical guides written by practitioners",
  },
  {
    icon: Map,
    label: "Career Roadmaps",
    desc: "Curated paths from student to software engineer",
  },
  {
    icon: TrendingUp,
    label: "Interview Prep",
    desc: "Resources to help you land your first or next role",
  },
];

function LoginPageContent() {
  const { signIn, isAuthenticated, isLoading } = useAuth();
  const searchParams = useSearchParams();
  const returnTo = searchParams?.get("returnTo") || "/";

  // Auto-redirect already-authenticated users
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      window.location.href = returnTo;
    }
  }, [isLoading, isAuthenticated, returnTo]);

  const handleSignIn = () => {
    signIn();
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#0a0a0b] px-4 py-20">
      {/* Subtle grid backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Emerald glow blob — top right */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 right-[-10%] h-[420px] w-[420px] rounded-full bg-emerald-500/10 blur-[120px]"
      />

      {/* Back link */}
      <motion.div
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        className="absolute left-6 top-6 sm:left-10 sm:top-8"
      >
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 transition-colors hover:text-zinc-300"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to resources
        </Link>
      </motion.div>

      <div className="relative z-10 mx-auto w-full max-w-[880px]">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-16 lg:items-center">
          {/* ── Left column: copy ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Brand wordmark */}
            <div className="mb-10 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15 ring-1 ring-emerald-500/30">
                <BookOpen className="h-4 w-4 text-emerald-400" />
              </div>
              <span className="text-sm font-semibold tracking-wide text-zinc-200">
                Resources
              </span>
            </div>

            <h1 className="text-3xl font-semibold leading-snug tracking-tight text-zinc-100 sm:text-4xl">
              The Boring Education
              <br />
              <span className="text-emerald-400">Resource Library</span>
            </h1>

            <p className="mt-4 max-w-sm text-base leading-relaxed text-zinc-500">
              Free guides, roadmaps, and career resources — built by the
              community, for the community.
            </p>

            {/* Feature list */}
            <ul className="mt-10 space-y-5">
              {FEATURES.map(({ icon: Icon, label, desc }) => (
                <li key={label} className="flex items-start gap-3.5">
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-zinc-800/80 ring-1 ring-zinc-700/60">
                    <Icon className="h-3.5 w-3.5 text-zinc-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-200">{label}</p>
                    <p className="mt-0.5 text-xs text-zinc-500">{desc}</p>
                  </div>
                </li>
              ))}
            </ul>

            {/* Social proof */}
            <div className="mt-10 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <p className="text-xs text-zinc-500">
                <span className="text-zinc-300 font-medium">10,000+</span>{" "}
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
            {/* Border gradient */}
            <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-zinc-700/70 via-zinc-800/30 to-transparent" />

            <div className="relative rounded-2xl border border-zinc-800/80 bg-[#0e0e0e]/95 px-8 py-9 backdrop-blur-xl">
              {/* Lock badge */}
              <div className="mb-7 flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-800 ring-1 ring-zinc-700/60">
                  <Lock className="h-3.5 w-3.5 text-zinc-400" />
                </div>
                <span className="text-xs font-medium tracking-widest text-zinc-500 uppercase">
                  Members only
                </span>
              </div>

              <h2 className="text-xl font-semibold leading-snug tracking-tight text-zinc-100">
                Free access for the
                <br />
                <span className="text-emerald-400">TBE community</span>
              </h2>

              <p className="mt-3 text-sm leading-relaxed text-zinc-500">
                Sign in with Google to unlock all resources. No password, no
                credit card — ever.
              </p>

              {/* Google sign-in CTA */}
              <button
                id="google-signin-btn"
                onClick={handleSignIn}
                disabled={isLoading}
                className="mt-8 group flex w-full items-center justify-between rounded-xl bg-zinc-800 px-4 py-3.5 text-sm font-medium text-zinc-100 ring-1 ring-zinc-700/60 transition-all hover:bg-zinc-700 hover:ring-zinc-600 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="flex items-center gap-3">
                  {/* Google logo inline SVG */}
                  <svg
                    className="h-4 w-4 shrink-0"
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
                  Continue with Google
                </span>
                <ArrowRight className="h-4 w-4 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
              </button>

              {/* Divider */}
              <div className="my-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-zinc-800" />
                <span className="text-xs text-zinc-600">or</span>
                <div className="h-px flex-1 bg-zinc-800" />
              </div>

              {/* Info row */}
              <div className="space-y-2.5 text-xs text-zinc-600">
                {[
                  "100% free — no credit card required",
                  "Instant access to all resources",
                  "No spam, ever",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <span className="h-1 w-1 rounded-full bg-zinc-600" />
                    {item}
                  </div>
                ))}
              </div>

              {/* Footer */}
              <p className="mt-8 text-xs text-zinc-700">
                By signing in you agree to our{" "}
                <a
                  href="https://theboringeducation.com/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-500 underline underline-offset-2 hover:text-zinc-300 transition-colors"
                >
                  Terms
                </a>{" "}
                &amp;{" "}
                <a
                  href="https://theboringeducation.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-500 underline underline-offset-2 hover:text-zinc-300 transition-colors"
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
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageContent />
    </Suspense>
  );
}
