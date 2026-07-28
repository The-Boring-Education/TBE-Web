import { sanitizeHTML } from "@tbe/components";

import type { ResourceMeta } from "@/lib/types";

type Props = {
  meta: ResourceMeta;
  pageUrl: string;
  styleTags: string | null;
  bodyHtml: string;
  /** Omit on zen/reader URLs to avoid duplicate Article schema. */
  includeJsonLd?: boolean;
  articleClassName?: string;
};

export function ResourceArticle({
  meta,
  pageUrl,
  styleTags,
  bodyHtml,
  includeJsonLd = true,
  articleClassName,
}: Props) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: meta.title,
    description: meta.description,
    url: pageUrl,
    author: {
      "@type": "Organization",
      name: "The Boring Education",
    },
    publisher: {
      "@type": "Organization",
      name: "The Boring Education",
    },
  };
  const sanitizedStyleTags = styleTags ? sanitizeHTML(styleTags) : null;
  const sanitizedBodyHtml = sanitizeHTML(bodyHtml);

  return (
    <>
      {includeJsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      ) : null}
      <article className={articleClassName}>
        {styleTags ? (
          <div
            className="resource-embed-styles"
            dangerouslySetInnerHTML={{ __html: sanitizedStyleTags || "" }}
          />
        ) : null}
        <div
          className="resource-embed-body"
          dangerouslySetInnerHTML={{ __html: sanitizedBodyHtml }}
        />
      </article>
    </>
  );
}
