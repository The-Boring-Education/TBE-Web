import { ContentFeedbackWidget, PatternQuizPanel, SEO } from "@tbe/components";
import type { PageProps } from "@tbe/interface";
import { getPreFetchProps } from "@tbe/utils";
import Head from "next/head";
import Link from "next/link";
import { Fragment } from "react";

export default function PatternQuizPage({ seoMeta }: PageProps) {
  return (
    <Fragment>
      <Head>
        <title>Pattern Quiz | OnCampus</title>
      </Head>
      <SEO seoMeta={seoMeta} />
      <div className="w-full min-w-0 max-w-full font-sans px-1 sm:px-2 py-1 space-y-2.5 pb-4">
        {/* Breadcrumb Navigation on Top */}
        <nav className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 dark:text-slate-500">
          <Link
            href="/dashboard"
            className="hover:text-slate-800 dark:hover:text-white transition-colors"
          >
            OnCampus
          </Link>
          <span className="text-slate-300 dark:text-slate-600">›</span>
          <span className="font-bold text-[#FF4D4D]">Pattern Quiz</span>
        </nav>

        <div className="w-full max-w-[560px] mx-auto pt-0.5 pb-3">
          <PatternQuizPanel questionsPerRound={5} />
        </div>
      </div>
      <ContentFeedbackWidget
        contentType="QUIZ"
        contentId="pattern-quiz"
        title="Rate this quiz"
        meta={{
          quizId: "pattern-quiz",
          quizName: "Pattern Quiz",
        }}
        theme="dark"
      />
    </Fragment>
  );
}

export const getServerSideProps = async () =>
  getPreFetchProps({ slug: "/pattern-quiz" });
