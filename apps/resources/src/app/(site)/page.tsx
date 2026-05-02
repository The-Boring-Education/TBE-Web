import type { Metadata } from "next";

import { RestrictedResourceList } from "@/components/RestrictedResourceList";
import { getResourceIndex } from "@/lib/content";
import { getSiteBaseUrl } from "@/lib/site";

export const dynamic = "force-static";
export const revalidate = false;

const homeDescription =
  "Free guides, roadmaps, and learning resources from The Boring Education.";

export const metadata: Metadata = {
  title: "Learning resources",
  description: homeDescription,
  alternates: {
    canonical: getSiteBaseUrl(),
  },
  openGraph: {
    title: "Learning resources",
    description: homeDescription,
    url: getSiteBaseUrl(),
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Learning resources | TBE Resources",
    description: homeDescription,
  },
};

export default async function HomePage() {
  const items = await getResourceIndex();

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
        Learning resources
      </h1>
      <p className="mt-4 text-lg text-zinc-400">
        Guides and roadmaps from our team. New drops ship with regular deploys.
      </p>

      <RestrictedResourceList items={items} />

      {items.length === 0 && (
        <p className="mt-8 text-sm text-[var(--shell-muted)]">
          No resources yet. Add folders under{" "}
          <code className="text-zinc-400">content/</code> (see CONTRIBUTING.md).
        </p>
      )}
    </div>
  );
}
