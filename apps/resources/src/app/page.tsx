import Link from "next/link";

import { getResourceIndex } from "@/lib/content";

export default async function HomePage() {
  const items = await getResourceIndex();

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-2xl font-semibold tracking-tight text-white">
        Learning resources
      </h1>
      <p className="mt-2 text-[var(--shell-muted)]">
        Guides and roadmaps from our team. New drops ship with regular deploys.
      </p>
      <p className="mt-6">
        <Link
          href="/search"
          className="text-[var(--shell-accent)] underline-offset-4 hover:underline"
        >
          Search all resources
        </Link>
      </p>
      <ul className="mt-10 space-y-3">
        {items.map((it) => (
          <li key={it.slug}>
            <Link
              href={`/resources/${it.slug}`}
              className="block rounded-md border border-[var(--shell-border)] bg-zinc-900/40 px-4 py-3 transition hover:border-zinc-600"
            >
              <span className="font-medium text-white">{it.title}</span>
              <p className="mt-1 text-sm text-[var(--shell-muted)]">
                {it.description}
              </p>
            </Link>
          </li>
        ))}
      </ul>
      {items.length === 0 && (
        <p className="mt-8 text-sm text-[var(--shell-muted)]">
          No resources yet. Add folders under{" "}
          <code className="text-zinc-400">content/</code> (see CONTRIBUTING.md).
        </p>
      )}
    </div>
  );
}
