import { PatternQuizPanel, SEO } from "@tbe/components";
import type { PageProps } from "@tbe/interface";
import { getPreFetchProps } from "@tbe/utils";
import Head from "next/head";
import { Fragment } from "react";

export default function PatternQuizPage({ seoMeta }: PageProps) {
  return (
    <Fragment>
      <Head>
        <title>Pattern Quiz | DSA Yatra</title>
      </Head>
      <SEO seoMeta={seoMeta} appId="dsayatra" />
      <div className="flex-1 w-full bg-[#0f0f0f] font-sans px-4 sm:px-6 py-4 pb-16 lg:py-6">
        <div className="max-w-[700px] w-full mx-auto space-y-5">
          <PatternQuizPanel questionsPerRound={5} />
        </div>
      </div>
    </Fragment>
  );
}

export const getServerSideProps = async () =>
  getPreFetchProps({ slug: "/pattern-quiz", appId: "dsayatra" });
