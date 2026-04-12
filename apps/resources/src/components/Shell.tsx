import Link from "next/link";

import { getPlatformSignupUrl, getSiteBaseUrl } from "@/lib/site";

export function Shell({ children }: { children: React.ReactNode }) {
  const signupUrl = getPlatformSignupUrl();
  const homeUrl = getSiteBaseUrl();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-[var(--shell-border)] bg-[var(--shell-bg)]/95 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-3">
          <Link href="/" className="font-semibold tracking-tight text-white">
            TBE Resources
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link
              href="/search"
              className="text-[var(--shell-muted)] transition hover:text-white"
            >
              Search
            </Link>
            <a
              href={signupUrl}
              className="rounded-md bg-[var(--shell-accent)] px-3 py-1.5 font-medium text-black transition hover:opacity-90"
            >
              Sign up
            </a>
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-[var(--shell-border)] py-6 text-center text-xs text-[var(--shell-muted)]">
        <a href={homeUrl} className="hover:text-white">
          Resources
        </a>
        {" · "}
        <a href={signupUrl} className="hover:text-white">
          The Boring Education
        </a>
      </footer>
    </div>
  );
}
