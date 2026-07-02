"use client";

import { useAuth } from "@tbe/auth";
import { ANALYTICS_EVENTS } from "@tbe/constants";
import { useUser } from "@tbe/hooks";
import { trackEvent } from "@tbe/utils";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Lock, Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import type { ResourceIndexEntry } from "@/lib/types";

function normalize(s: string): string {
  return s.toLowerCase().trim();
}

export function ResourceSearch({ items }: { items: ResourceIndexEntry[] }) {
  const [query, setQuery] = useState("");
  const { isAuth, loading } = useUser();
  const { signIn } = useAuth();

  const handleSignUp = () => {
    try {
      trackEvent(ANALYTICS_EVENTS.SIGNUP_CLICK, {
        category: "auth",
        label: "Resources Search Overlay",
      });
    } catch {
      // Ignore
    }
    signIn();
  };

  const filtered = useMemo(() => {
    const q = normalize(query);
    if (!q) return items;
    return items.filter((it) => {
      const hay = [it.title, it.description, ...it.keywords, ...it.tags].join(
        " ",
      );
      return normalize(hay).includes(q);
    });
  }, [items, query]);

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <div className="h-10 w-full animate-pulse rounded-md bg-zinc-800/40" />
        <div className="mt-8 space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-20 w-full animate-pulse rounded-md bg-zinc-800/40"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="relative">
        <label className="block text-sm font-medium text-zinc-400">
          Find a resource
        </label>
        <div className="relative mt-2">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, tag, or keyword…"
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 py-3 pl-10 pr-4 text-white placeholder:text-zinc-600 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
            autoComplete="off"
          />
        </div>
      </div>

      <div className="relative mt-8 min-h-[300px]">
        <ul
          className={`space-y-3 transition-all duration-500 ${!isAuth ? "blur-md select-none pointer-events-none opacity-40" : ""}`}
        >
          {filtered.map((it) => (
            <li key={it.slug}>
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 transition hover:border-zinc-700 hover:bg-zinc-900/60">
                <Link
                  href={`/resources/${it.slug}`}
                  className="block px-5 py-4"
                >
                  <span className="text-lg font-semibold text-white">
                    {it.title}
                  </span>
                  <p className="mt-1 text-sm text-zinc-400 line-clamp-2">
                    {it.description}
                  </p>
                  {(it.tags?.length ?? 0) > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {it.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] font-medium text-zinc-400 uppercase tracking-wider"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </Link>
              </div>
            </li>
          ))}
        </ul>

        {filtered.length === 0 && isAuth && (
          <p className="mt-8 text-center text-sm text-zinc-500">
            No matches. Try a different term.
          </p>
        )}

        <AnimatePresence>
          {!isAuth && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0 z-20 flex items-start justify-center pt-8"
            >
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.1,
                  duration: 0.45,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="relative w-full max-w-xs"
              >
                <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-zinc-700/60 via-zinc-800/30 to-transparent" />
                <div className="relative rounded-2xl border border-zinc-800/80 bg-[#0e0e0e]/95 px-7 py-7 backdrop-blur-xl">
                  <div className="mb-5 flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-800 ring-1 ring-zinc-700/60">
                      <Lock className="h-3.5 w-3.5 text-zinc-400" />
                    </div>
                    <span className="text-xs font-medium tracking-widest text-zinc-500 uppercase">
                      Members only
                    </span>
                  </div>

                  <h2 className="text-lg font-semibold leading-snug tracking-tight text-zinc-100">
                    Sign in to search
                    <br />
                    <span className="text-emerald-400">the full library</span>
                  </h2>

                  <p className="mt-2.5 text-sm leading-relaxed text-zinc-500">
                    100% free access for the TBE community.
                  </p>

                  <Link
                    href="/login"
                    className="mt-6 group/btn flex w-full items-center justify-between rounded-xl bg-zinc-800 px-4 py-3 text-sm font-medium text-zinc-100 ring-1 ring-zinc-700/60 transition-all hover:bg-zinc-700 hover:ring-zinc-600 active:scale-[0.98]"
                  >
                    <span>Get free access</span>
                    <ArrowRight className="h-4 w-4 text-zinc-400 group-hover/btn:translate-x-0.5 transition-transform" />
                  </Link>

                  <p className="mt-4 text-center text-xs text-zinc-600">
                    Already signed up?{" "}
                    <Link
                      href="/login"
                      className="text-zinc-400 underline underline-offset-2 hover:text-zinc-200 transition-colors"
                    >
                      Log in
                    </Link>
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
