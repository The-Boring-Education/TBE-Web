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

const ZEN_ARTICLE_CLASS = "resource-embed mx-auto";

export function ResourceView({ meta, pageUrl, styleTags, bodyHtml }: Props) {
  const [isZenMode, setIsZenMode] = useState(false);

  return (
    <>
      {/* Achievement of distraction-free mode without modifying shell files */}
      {isZenMode && (
        <style
          dangerouslySetInnerHTML={{
            __html: `
          header, footer { display: none !important; }
          main { padding-top: 1rem !important; }
        `,
          }}
        />
      )}

      <div className={isZenMode ? "min-h-screen bg-[var(--shell-bg)]" : ""}>
        <p
          className={`mb-6 text-right text-sm ${isZenMode ? "fixed right-6 top-6 z-[300]" : ""}`}
        >
          <button
            type="button"
            onClick={() => setIsZenMode((prev) => !prev)}
            aria-pressed={isZenMode}
            className={`transition-all duration-300 ${
              isZenMode
                ? "rounded-full border border-white/5 bg-zinc-800/80 px-4 py-2 text-zinc-300 backdrop-blur-md shadow-xl hover:text-white"
                : "text-[var(--shell-muted)] underline-offset-4 hover:text-white hover:underline"
            }`}
          >
            {isZenMode ? "Zen Mode active" : "Enable Zen Mode"}
          </button>
          <span className="text-zinc-600"> · </span>
          <span className="text-zinc-500">
            {!isZenMode && "Toggle for focused reading"}
          </span>
        </p>
        <ResourceArticle
          meta={meta}
          pageUrl={pageUrl}
          styleTags={styleTags}
          bodyHtml={bodyHtml}
          articleClassName={isZenMode ? ZEN_ARTICLE_CLASS : undefined}
        />
      </div>
    </>
  );
}
