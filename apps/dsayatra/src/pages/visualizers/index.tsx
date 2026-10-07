import { SEO } from "@tbe/components";
import { DSA_VISUALIZER_META, routes, TOPIC_LABELS } from "@tbe/constants";
import type { PageProps } from "@tbe/interface";
import { getPreFetchProps } from "@tbe/utils";
import type { GetStaticProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { Fragment } from "react";

const VisualizersIndexPage = ({ seoMeta }: PageProps) => {
  const entries = Object.entries(DSA_VISUALIZER_META);

  return (
    <Fragment>
      <Head>
        <title>DSA Yatra | Visualizers</title>
      </Head>
      <SEO seoMeta={seoMeta} appId="dsayatra" />

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="mb-8">
          <p className="text-[10px] font-black uppercase tracking-widest text-[#ff5757]">
            DSA Yatra
          </p>
          <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">
            Interactive Visualizers
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-[#9ca3af]">
            Step through common data structures and algorithms. Play, pause,
            change speed — build intuition before you code.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {entries.map(([slug, meta]) => (
            <Link
              key={slug}
              href={routes.dsayatra.visualizer(slug)}
              className="group rounded-2xl border border-[#1f2937] bg-[#09090b] p-5 transition-all hover:border-[#ff5757] hover:bg-[#0d0d0f]"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="rounded-full border border-[#1f2937] px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-[#9ca3af]">
                  {TOPIC_LABELS[meta.topic] || meta.topic}
                </span>
                <span className="text-[10px] font-mono text-[#4b5563] group-hover:text-[#ff5757]">
                  →
                </span>
              </div>
              <h2 className="text-base font-bold text-white">{meta.title}</h2>
              <p className="mt-2 text-xs leading-relaxed text-[#9ca3af]">
                {meta.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </Fragment>
  );
};

export const getStaticProps: GetStaticProps = async () =>
  await getPreFetchProps({
    slug: routes.dsayatra.visualizers,
    appId: "dsayatra",
  });

export default VisualizersIndexPage;
