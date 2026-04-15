import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ResourceView } from "@/components/ResourceView";
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
    return { title: "Resource" };
  }
  const base = getSiteBaseUrl();
  const url = `${base}/resources/${slug}`;
  return {
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords,
    alternates: { canonical: url },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url,
      type: "article",
      images: meta.ogImage ? [{ url: meta.ogImage }] : undefined,
    },
    twitter: {
      card: meta.ogImage ? "summary_large_image" : "summary",
      title: meta.title,
      description: meta.description,
      images: meta.ogImage ? [meta.ogImage] : undefined,
    },
  };
}

export default async function ResourcePage(props: Props) {
  const { slug } = props.params;
  const [meta, rawHtml] = await Promise.all([
    readResourceMeta(slug),
    readResourceHtml(slug),
  ]);
  if (!meta || !rawHtml) notFound();

  const { styleTags, bodyHtml } = extractEmbedParts(rawHtml);
  const base = getSiteBaseUrl();
  const url = `${base}/resources/${slug}`;

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Resources",
        item: base,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: meta.title,
        item: url,
      },
    ],
  };

  return (
    <div className="mx-auto w-full px-4 pb-8 pt-4">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <ResourceView
        meta={meta}
        pageUrl={url}
        styleTags={styleTags}
        bodyHtml={bodyHtml}
      />
    </div>
  );
}
