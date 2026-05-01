"use client";

import { useAuth } from "@tbe/auth";
import { useUser } from "@tbe/hooks";
import { trackEvent } from "@tbe/utils";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Lock } from "lucide-react";
import Link from "next/link";
import React from "react";

interface ResourceItem {
  slug: string;
  title: string;
  description: string;
}

interface RestrictedResourceListProps {
  items: ResourceItem[];
}

export function RestrictedResourceList({ items }: RestrictedResourceListProps) {
  const { isAuth, loading } = useUser();
  const { signIn } = useAuth();

  const handleSignUp = () => {
    try {
      trackEvent("signup_click", {
        category: "auth",
        label: "Resources Blur Overlay",
      });
    } catch {
      // Ignore analytics errors
    }
    signIn();
  };

  if (loading) {
    return (
      <div className="mt-10 space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-20 w-full animate-pulse rounded-xl border border-zinc-800/60 bg-zinc-900/30"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="relative mt-10 min-h-[420px]">
      {/* Resource List — blurred when locked */}
      <ul
        className={`space-y-3 transition-all duration-700 ${
          !isAuth ? "blur-sm select-none pointer-events-none opacity-30" : ""
        }`}
      >
        {items.map((it) => (
          <li key={it.slug}>
            <Link
              href={`/resources/${it.slug}`}
              className="group flex items-center justify-between rounded-xl border border-zinc-800/70 bg-zinc-900/30 px-5 py-4 transition-all hover:border-zinc-700 hover:bg-zinc-900/60"
            >
              <div className="min-w-0 flex-1 pr-4">
                <span className="block truncate text-base font-medium text-zinc-100 group-hover:text-emerald-400 transition-colors">
                  {it.title}
                </span>
                <p className="mt-0.5 truncate text-sm text-zinc-500">
                  {it.description}
                </p>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0 text-zinc-700 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
            </Link>
          </li>
        ))}
      </ul>

      {/* Auth Overlay */}
      <AnimatePresence>
        {!isAuth && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 z-20 flex items-start justify-center pt-16 sm:pt-24"
          >
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.15,
                duration: 0.5,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="relative mx-auto w-full max-w-sm"
            >
              {/* Animated glow ring */}
              <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-zinc-700/60 via-zinc-800/30 to-transparent" />
              <div className="absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-700 group-hover:opacity-100 bg-gradient-to-b from-emerald-500/20 via-transparent to-transparent" />

              {/* Card body */}
              <div className="relative rounded-2xl border border-zinc-800/80 bg-[#0e0e0e]/95 px-8 py-8 backdrop-blur-xl">
                {/* Lock badge */}
                <div className="mb-6 flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-800 ring-1 ring-zinc-700/60">
                    <Lock className="h-3.5 w-3.5 text-zinc-400" />
                  </div>
                  <span className="text-xs font-medium tracking-widest text-zinc-500 uppercase">
                    Members only
                  </span>
                </div>

                {/* Headline */}
                <h2 className="text-xl font-semibold leading-snug tracking-tight text-zinc-100">
                  Free access for the
                  <br />
                  <span className="text-emerald-400">TBE community</span>
                </h2>

                <p className="mt-3 text-sm leading-relaxed text-zinc-500">
                  Guides, roadmaps, and career resources — all free. Sign in to
                  unlock.
                </p>

                {/* CTA */}
                <Link
                  href="/login"
                  className="mt-7 group/btn flex w-full items-center justify-between rounded-xl bg-zinc-800 px-4 py-3 text-sm font-medium text-zinc-100 ring-1 ring-zinc-700/60 transition-all hover:bg-zinc-700 hover:ring-zinc-600 active:scale-[0.98]"
                >
                  <span>Get free access</span>
                  <ArrowRight className="h-4 w-4 text-zinc-400 group-hover/btn:translate-x-0.5 transition-transform" />
                </Link>

                {/* Divider + log in link */}
                <p className="mt-5 text-center text-xs text-zinc-600">
                  Already signed up?{" "}
                  <Link
                    href="/login"
                    className="text-zinc-400 underline underline-offset-2 hover:text-zinc-200 transition-colors"
                  >
                    Log in
                  </Link>
                </p>

                {/* Stat pill */}
                <div className="mt-7 flex justify-center">
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-1 text-xs text-zinc-500">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    10,000+ developers learning with TBE
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
