import { SEO } from "@tbe/components";
import { DSA_VISUALIZER_META, routes, TOPIC_LABELS } from "@tbe/constants";
import type { PageProps } from "@tbe/interface";
import { getPreFetchProps } from "@tbe/utils";
import { ArrowRight, Play, Sparkles } from "lucide-react";
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

      <div className="w-full h-full overflow-y-auto px-3 sm:px-6 py-2 sm:py-3 space-y-3 sm:space-y-4 scrollbar-thin-grey font-sans">
        {/* Top Header Section */}
        <div className="space-y-1">
          <nav className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 dark:text-slate-500 mb-0.5">
            <Link
              href="/dashboard"
              className="hover:text-slate-800 dark:hover:text-white transition-colors"
            >
              DSA Yatra
            </Link>
            <span className="text-slate-300 dark:text-slate-600">›</span>
            <span className="font-bold text-[#FF4D4D]">Visualizers</span>
          </nav>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              Interactive <span className="text-[#FF4D4D]">Visualizers</span>
            </h1>
            <Sparkles className="w-5 h-5 text-[#FF4D4D]" />
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium leading-normal max-w-2xl">
            Step through common data structures and algorithms. Play, pause,
            change speed — build intuition before you code.
          </p>
        </div>

        {/* Visualizers Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-3.5">
          {entries.map(([slug, meta]) => (
            <Link
              key={slug}
              href={`/visualizers/${slug}`}
              className="group relative rounded-xl border border-slate-200/90 dark:border-[#24242A] bg-white dark:bg-[#131316] hover:dark:bg-[#18181D] hover:border-[#FF4D4D]/50 dark:hover:border-[#FF4D4D]/50 p-4 transition-all duration-200 shadow-2xs hover:shadow-xs hover:-translate-y-0.5 flex flex-col justify-between cursor-pointer"
            >
              <div>
                {/* Top Row: Topic Badge & Play Icon */}
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-50 dark:bg-red-950/40 text-[#FF4D4D] border border-red-100 dark:border-red-900/30">
                    {TOPIC_LABELS[meta.topic] || meta.topic}
                  </span>
                  <div className="w-6 h-6 rounded-md bg-red-500/10 flex items-center justify-center text-[#FF4D4D] group-hover:scale-110 transition-transform">
                    <Play className="w-3 h-3 fill-current" />
                  </div>
                </div>

                {/* Card Title & Description */}
                <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white group-hover:text-[#FF4D4D] transition-colors mt-3">
                  {meta.title}
                </h2>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2 font-medium">
                  {meta.description}
                </p>
              </div>

              {/* Bottom Row */}
              <div className="mt-4 pt-2.5 border-t border-slate-100 dark:border-[#1E1E24] flex items-center justify-between text-[11px] font-semibold text-slate-400 group-hover:text-[#FF4D4D] transition-colors">
                <span>Launch Interactive Demo</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
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
