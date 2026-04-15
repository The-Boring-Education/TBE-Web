"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import type { ResourceIndexEntry } from "@/lib/types";

function normalize(s: string): string {
  return s.toLowerCase().trim();
}

export function ResourceSearch({ items }: { items: ResourceIndexEntry[] }) {
  const [query, setQuery] = useState("");

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

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <label className="block text-sm font-medium text-[var(--shell-muted)]">
        Find a resource
      </label>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by title, tag, or keyword…"
        className="mt-2 w-full rounded-md border border-[var(--shell-border)] bg-black/40 px-3 py-2 text-white placeholder:text-zinc-600 focus:border-[var(--shell-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--shell-accent)]"
        autoComplete="off"
      />
      <ul className="mt-8 space-y-3">
        {filtered.map((it) => (
          <li key={it.slug}>
            <div className="rounded-md border border-[var(--shell-border)] bg-zinc-900/50 transition hover:border-zinc-600">
              <Link href={`/resources/${it.slug}`} className="block px-4 py-3">
                <span className="font-medium text-white">{it.title}</span>
                <p className="mt-1 text-sm text-[var(--shell-muted)]">
                  {it.description}
                </p>
                {(it.tags?.length ?? 0) > 0 && (
                  <p className="mt-2 text-xs text-zinc-500">
                    {it.tags.join(" · ")}
                  </p>
                )}
              </Link>
              <p className="border-t border-[var(--shell-border)] px-4 py-2 text-xs text-zinc-500">
                <Link
                  href={`/read/${it.slug}`}
                  className="text-[var(--shell-accent)] hover:underline"
                >
                  Reader mode
                </Link>
                <span className="text-zinc-600"> — </span>
                <span>Content only</span>
              </p>
            </div>
          </li>
        ))}
      </ul>
      {filtered.length === 0 && (
        <p className="mt-8 text-center text-sm text-[var(--shell-muted)]">
          No matches. Try a different term.
        </p>
      )}
    </div>
  );
}
