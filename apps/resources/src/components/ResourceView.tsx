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

      {/* Top unlock banner — shown to unauthenticated users only, full-width */}
      {!isZenMode && (
        <div className="-mx-4 -mt-4 mb-6">
          <SignUpBanner />
        </div>
      )}

      <div className={isZenMode ? "min-h-screen bg-[var(--shell-bg)]" : ""}>
        <div
          className={`mb-6 flex items-center justify-end gap-3 text-sm ${isZenMode ? "fixed right-6 top-6 z-[300]" : ""}`}
        >
          {/* Quiz button — only shown when a quiz file exists */}
          {quiz && !isZenMode && (
            <button
              id="open-quiz-btn"
              type="button"
              onClick={() => setIsQuizOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-emerald-500/15 px-4 py-2 text-sm font-medium text-emerald-300 ring-1 ring-emerald-500/30 transition-all duration-200 hover:bg-emerald-500/25 hover:ring-emerald-500/50 hover:text-emerald-200 active:scale-[0.97]"
            >
              {/* Brain icon inline SVG to avoid another import */}
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
              Take Quiz
              <span className="flex h-5 items-center justify-center rounded-full bg-emerald-500/20 px-1.5 text-[10px] font-bold text-emerald-400 ring-1 ring-emerald-500/30">
                {quiz.questions.length}
              </span>
            </button>
          )}

          <ShareButton pageUrl={pageUrl} title={meta.title} />
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
          {!isZenMode && (
            <span className="text-zinc-500">Toggle for focused reading</span>
          )}
        </div>
        <ResourceArticle
          meta={meta}
          pageUrl={pageUrl}
          styleTags={styleTags}
          bodyHtml={bodyHtml}
          articleClassName={isZenMode ? ZEN_ARTICLE_CLASS : undefined}
        />
        <div className="flex flex-col items-center px-4">
          <ResourceContributeBanner docTitle={meta.title} pageUrl={pageUrl} />
        </div>
      </div>

      {/* Quiz modal — mounted outside the layout flow, rendered only when quiz data exists */}
      {quiz && (
        <QuizModal
          quiz={quiz}
          isOpen={isQuizOpen}
          onClose={() => setIsQuizOpen(false)}
        />
      )}
    </>
  );
}
