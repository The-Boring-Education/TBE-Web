import { PatternQuizPanel } from "@tbe/components";
import Head from "next/head";
import { Fragment } from "react";

export default function PatternQuizPage() {
  return (
    <Fragment>
      <Head>
        <title>Pattern Quiz | On Campus</title>
      </Head>
      <div className="flex-1 w-full bg-[#0f0f0f] font-sans px-4 sm:px-6 py-4 pb-16 lg:py-6">
        <div className="max-w-[700px] w-full mx-auto space-y-5">
          <PatternQuizPanel questionsPerRound={5} />
        </div>
      </div>
    </Fragment>
  );
}

export async function getServerSideProps() {
  return { props: {} };
}
