"use client";

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

  const handleArticleClick = (e: React.MouseEvent<HTMLElement>) => {
    const target = e.target as HTMLElement | null;
    const printBtn = target?.closest(".print-btn, [data-action='print']");
    if (printBtn) {
      e.preventDefault();
      window.print();
    }
  };

  return (
    <>
      {includeJsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      ) : null}
      <article className={articleClassName} onClick={handleArticleClick}>
        {styleTags ? (
          <div
            className="resource-embed-styles"
            dangerouslySetInnerHTML={{ __html: styleTags }}
          />
        ) : null}
        <div
          className="resource-embed-body"
          dangerouslySetInnerHTML={{ __html: bodyHtml }}
        />
      </article>
    </>
  );
}
