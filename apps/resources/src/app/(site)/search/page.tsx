import type { Metadata } from "next";

import { ResourceSearch } from "@/components/ResourceSearch";
import { getResourceIndex } from "@/lib/content";
import { getSiteBaseUrl } from "@/lib/site";

export const dynamic = "force-static";
export const revalidate = false;

const searchDescription =
  "Search free learning resources from The Boring Education.";

export const metadata: Metadata = {
  title: "Search",
  description: searchDescription,
  alternates: {
    canonical: `${getSiteBaseUrl()}/search`,
  },
  openGraph: {
    title: "Search",
    description: searchDescription,
    url: `${getSiteBaseUrl()}/search`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Search | TBE Resources",
    description: searchDescription,
  },
};

export default async function SearchPage() {
  const items = await getResourceIndex();

  return <ResourceSearch items={items} />;
}
