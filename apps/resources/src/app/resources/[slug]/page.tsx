import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  listResourceSlugs,
  readResourceHtml,
  readResourceMeta,
} from "@/lib/content";
import { extractEmbedParts } from "@/lib/html-embed";
import { getSiteBaseUrl } from "@/lib/site";

type Props = { params: { slug: string } };

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

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: meta.title,
    description: meta.description,
    url,
    author: {
      "@type": "Organization",
      name: "The Boring Education",
    },
    publisher: {
      "@type": "Organization",
      name: "The Boring Education",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article className="resource-embed mx-auto max-w-4xl px-4 py-8">
        {styleTags ? (
          <div
            className="resource-embed-styles"
            dangerouslySetInnerHTML={{ __html: styleTags }}
          />
        ) : null}
        <div
          className="resource-embed-body max-w-none"
          dangerouslySetInnerHTML={{ __html: bodyHtml }}
        />
      </article>
    </>
  );
}
