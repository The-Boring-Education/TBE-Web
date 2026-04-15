import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ResourceArticle } from "@/components/ResourceArticle";
import {
  listResourceSlugs,
  readResourceHtml,
  readResourceMeta,
} from "@/lib/content";
import { extractEmbedParts } from "@/lib/html-embed";
import { getSiteBaseUrl } from "@/lib/site";

type Props = { params: { slug: string } };

export const dynamic = "force-static";
export const revalidate = false;
export const dynamicParams = false;

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const slugs = await listResourceSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { slug } = props.params;
  const meta = await readResourceMeta(slug);
  if (!meta) {
    return { title: "Resource", robots: { index: false, follow: true } };
  }
  const base = getSiteBaseUrl();
  const canonical = `${base}/resources/${slug}`;
  return {
    title: meta.title,
    description: meta.description,
    alternates: { canonical },
    robots: { index: false, follow: true },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: canonical,
      type: "article",
    },
  };
}

export default async function ZenResourcePage(props: Props) {
  const { slug } = props.params;
  const [meta, rawHtml] = await Promise.all([
    readResourceMeta(slug),
    readResourceHtml(slug),
  ]);
  if (!meta || !rawHtml) notFound();

  const { styleTags, bodyHtml } = extractEmbedParts(rawHtml);
  const base = getSiteBaseUrl();
  const canonicalUrl = `${base}/resources/${slug}`;

  return (
    <ResourceArticle
      meta={meta}
      pageUrl={canonicalUrl}
      styleTags={styleTags}
      bodyHtml={bodyHtml}
      includeJsonLd={false}
      articleClassName="resource-embed mx-auto max-w-4xl px-4 py-8"
    />
  );
}
