"use client";

import { useUser } from "@tbe/hooks";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Lock } from "lucide-react";
import Link from "next/link";

interface SignUpBannerProps {
  /** Total number of resources in the library — shown in the copy */
  totalResources?: number;
}

export function SignUpBanner({ totalResources = 20 }: SignUpBannerProps) {
  const { isAuth, loading } = useUser();

  if (loading || isAuth) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="w-full border-b border-zinc-800/80 bg-[#0e0e0e]"
      >
        <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-3 px-4 py-3 sm:flex-row sm:items-center sm:px-6">
          {/* Left — icon + copy */}
          <div className="flex items-start gap-3 sm:items-center">
            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-zinc-800 ring-1 ring-zinc-700/60 sm:mt-0">
              <Lock className="h-3.5 w-3.5 text-zinc-400" />
            </div>
            <p className="text-sm text-zinc-400 leading-snug">
              <span className="font-medium text-zinc-200">
                Unlock {totalResources}+ free resources
              </span>
              {" — "}
              guides, roadmaps &amp; career resources for the TBE community.
            </p>
          </div>

          {/* Right — CTA */}
          <Link
            href="/login"
            className="group inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-zinc-800 px-3.5 py-2 text-xs font-medium text-zinc-100 ring-1 ring-zinc-700/60 transition-all hover:bg-zinc-700 hover:ring-zinc-600 active:scale-[0.98]"
          >
            Get free access
            <ArrowRight className="h-3.5 w-3.5 text-zinc-500 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
