"use client";

import { getPlatformSignupUrl } from "@/lib/site";

export function SignUpBanner() {
  const signupUrl = getPlatformSignupUrl();

  return (
    <aside
      className="mt-8 mb-4 w-full max-w-3xl rounded-lg border border-emerald-800/40 bg-emerald-950/20 px-5 py-4 text-center sm:text-left"
      aria-label="Sign up for full access"
    >
      <p className="text-sm font-medium text-emerald-300">
        🚀 Get full access to all resources
      </p>
      <p className="mt-1 text-sm leading-relaxed text-zinc-400">
        Sign up for a free account to unlock all learning resources, roadmaps,
        and guides from The Boring Education.
      </p>
      <p className="mt-3">
        <a
          href={signupUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-500"
        >
          Sign Up for Free
        </a>
      </p>
    </aside>
  );
}
