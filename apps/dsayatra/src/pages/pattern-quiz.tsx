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
      <div className="flex-1 w-full h-full overflow-y-auto font-sans p-4 sm:p-6 lg:p-8 space-y-5 scrollbar-thin-grey">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
          <Link
            href="/dashboard"
            className="hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            DSA Yatra
          </Link>
          <span className="text-slate-300 dark:text-slate-600">›</span>
          <span className="font-bold text-[#FF4D4D]">Pattern Quiz</span>
        </nav>

        <div className="max-w-[760px] w-full mx-auto space-y-6 pt-2">
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
