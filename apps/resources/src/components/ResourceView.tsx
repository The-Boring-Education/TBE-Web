"use client";

import { useState } from "react";

import type { ResourceMeta } from "@/lib/types";

import { ResourceArticle } from "./ResourceArticle";

type Props = {
  meta: ResourceMeta;
  pageUrl: string;
  styleTags: string | null;
  bodyHtml: string;
};

const DEFAULT_ARTICLE_CLASS = "resource-embed mx-auto max-w-4xl px-4 py-8";
const ZEN_ARTICLE_CLASS = "resource-embed mx-auto w-[80%] max-w-none px-4 py-8";

export function ResourceView({ meta, pageUrl, styleTags, bodyHtml }: Props) {
  const [isZenMode, setIsZenMode] = useState(false);

  return (
    <>
      <p className="mb-6 text-right text-sm">
        <button
          type="button"
          onClick={() => setIsZenMode((prev) => !prev)}
          aria-pressed={isZenMode}
          className="text-[var(--shell-muted)] underline-offset-4 hover:text-white hover:underline"
        >
          {isZenMode ? "Zen Mode active" : "Enable Zen Mode"}
        </button>
        <span className="text-zinc-600"> · </span>
        <span className="text-zinc-500">
          {isZenMode ? "Content at 80% width" : "Toggle for focused reading"}
        </span>
      </p>
      <ResourceArticle
        meta={meta}
        pageUrl={pageUrl}
        styleTags={styleTags}
        bodyHtml={bodyHtml}
        articleClassName={isZenMode ? ZEN_ARTICLE_CLASS : DEFAULT_ARTICLE_CLASS}
      />
    </>
  );
}
