import type { Metadata } from "next";

import { ResourceSearch } from "@/components/ResourceSearch";
import { getResourceIndex } from "@/lib/content";

export const metadata: Metadata = {
  title: "Search",
  description: "Search free learning resources from The Boring Education.",
};

export default async function SearchPage() {
  const items = await getResourceIndex();

  return <ResourceSearch items={items} />;
}
