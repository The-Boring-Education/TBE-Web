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
        <title>Pattern Quiz | DSA Yatra</title>
      </Head>
      <SEO seoMeta={seoMeta} appId="dsayatra" />
      <div className="w-full h-full overflow-y-auto px-3 sm:px-6 py-2 sm:py-3 space-y-2.5 font-sans scrollbar-thin-grey">
        {/* Breadcrumb Navigation on Top */}
        <nav className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 dark:text-slate-500">
          <Link
            href="/dashboard"
            className="hover:text-slate-800 dark:hover:text-white transition-colors"
          >
            DSA Yatra
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
  getPreFetchProps({ slug: "/pattern-quiz", appId: "dsayatra" });
