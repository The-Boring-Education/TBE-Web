"use client";

import { useState } from "react";

import type { ResourceMeta, ResourceQuiz } from "@/lib/types";

import { QuizModal } from "./QuizModal";
import { ResourceArticle } from "./ResourceArticle";
import { ResourceContributeBanner } from "./ResourceContributeBanner";
import { ShareButton } from "./ShareButton";
import { SignUpBanner } from "./SignUpBanner";

type Props = {
  meta: ResourceMeta;
  pageUrl: string;
  styleTags: string | null;
  bodyHtml: string;
  quiz?: ResourceQuiz;
};

const ZEN_ARTICLE_CLASS = "resource-embed mx-auto";

export function ResourceView({
  meta,
  pageUrl,
  styleTags,
  bodyHtml,
  quiz,
}: Props) {
  const [isZenMode, setIsZenMode] = useState(false);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const hideShell = isZenMode || isQuizOpen;

  return (
    <>
      {/* Achievement of distraction-free mode without modifying shell files */}
      {hideShell && (
        <style
          dangerouslySetInnerHTML={{
            __html: `
          header, footer { display: none !important; }
          main { padding-top: 1rem !important; }
        `,
          }}
        />
      )}

      {isZenMode && (
        <div className="fixed right-4 top-4 z-[400]">
          <button
            type="button"
            onClick={() => setIsZenMode(false)}
            title="Exit Deep Read"
            className="rounded-md border border-yellow-600/50 bg-yellow-900/40 px-3 py-1.5 text-sm text-yellow-300 transition hover:border-yellow-500 hover:bg-yellow-800/60 hover:text-yellow-200"
          >
            Deep Read
          </button>
        </div>
      )}

      {/* Top unlock banner — shown to unauthenticated users only, full-width */}
      {!hideShell && (
        <div className="-mx-4 -mt-4 mb-6">
          <SignUpBanner />
        </div>
      )}

      <div className={hideShell ? "min-h-screen bg-[var(--shell-bg)]" : ""}>
        {!hideShell && (
          <div className="mb-6 flex items-center justify-end gap-3 text-sm">
            {/* Quiz button — only shown when a quiz file exists */}
            {quiz && (
              <button
                id="open-quiz-btn"
                type="button"
                onClick={() => setIsQuizOpen(true)}
                className="flex items-center gap-1.5 rounded-md border border-emerald-600/60 bg-emerald-950/80 px-3 py-1.5 text-sm font-medium text-emerald-400 transition hover:border-emerald-500 hover:bg-emerald-900/90 hover:text-emerald-300"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-1.66Z" />
                  <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-1.66Z" />
                </svg>
                <span className="text-shimmer-sweep">Take Quiz</span>
              </button>
            )}

            <ShareButton pageUrl={pageUrl} title={meta.title} />
            <button
              type="button"
              onClick={() => setIsZenMode(true)}
              title="Enter Deep Read"
              className="rounded-md border border-zinc-700 bg-zinc-800/60 px-3 py-1.5 text-sm text-zinc-300 transition hover:border-zinc-600 hover:text-white"
            >
              Deep Read
            </button>
          </div>
        )}
        {isQuizOpen ? (
          // Render quiz inline in place of the article
          <div className="px-4">
            <QuizModal
              quiz={quiz!}
              isOpen={isQuizOpen}
              inline
              shareUrl={pageUrl}
              onBack={() => setIsQuizOpen(false)}
              onClose={() => setIsQuizOpen(false)}
            />
          </div>
        ) : (
          <ResourceArticle
            meta={meta}
            pageUrl={pageUrl}
            styleTags={styleTags}
            bodyHtml={bodyHtml}
            articleClassName={isZenMode ? ZEN_ARTICLE_CLASS : undefined}
          />
        )}
        {!isQuizOpen && (
          <div className="flex flex-col items-center px-4">
            <ResourceContributeBanner docTitle={meta.title} pageUrl={pageUrl} />
          </div>
        )}
      </div>

      {/* Quiz rendered inline when open (handled above) */}
    </>
  );
}
