import { SEO, VISUALIZER_MAP } from "@tbe/components";
import { DSA_VISUALIZER_META, routes, TOPIC_LABELS } from "@tbe/constants";
import type { PageProps } from "@tbe/interface";
import { getPreFetchProps } from "@tbe/utils";
import { ChevronLeft } from "lucide-react";
import type { GetStaticPaths, GetStaticProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { Fragment } from "react";

interface VisualizerPageProps extends PageProps {
  slug: string;
}

const VisualizerViewerPage = ({ seoMeta, slug }: VisualizerPageProps) => {
  const meta = DSA_VISUALIZER_META[slug];
  const Component = VISUALIZER_MAP[slug];

  if (!meta || !Component) {
    return (
      <Fragment>
        <Head>
          <title>Visualizer not found | DSA Yatra</title>
        </Head>
        <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center font-sans">
          <div className="rounded-xl border border-slate-200/90 dark:border-[#24242A] bg-white dark:bg-[#131316] p-8 max-w-md w-full shadow-2xs space-y-3">
            <h1 className="text-xl font-black text-slate-900 dark:text-white">
              Visualizer not found
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              The requested visualizer could not be found or has been moved.
            </p>
            <Link
              href={routes.dsayatra.visualizers}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-[#FF4D4D] text-white hover:bg-[#FF3333] transition-colors mt-2"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Back to visualizers</span>
            </Link>
          </div>
        </div>
      </Fragment>
    );
  }

  return (
    <Fragment>
      <Head>
        <title>{meta.title} | DSA Visualizer</title>
      </Head>
      <SEO seoMeta={seoMeta} appId="dsayatra" />

      <div className="w-full h-full overflow-y-auto px-3 sm:px-6 py-2 sm:py-3 space-y-3 sm:space-y-4 scrollbar-thin-grey font-sans">
        {/* Top Header & Breadcrumb Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <nav className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 dark:text-slate-500">
            <Link
              href="/dashboard"
              className="hover:text-slate-800 dark:hover:text-white transition-colors"
            >
              DSA Yatra
            </Link>
            <span className="text-slate-300 dark:text-slate-600">›</span>
            <Link
              href="/visualizers"
              className="hover:text-slate-800 dark:hover:text-white transition-colors"
            >
              Visualizers
            </Link>
            <span className="text-slate-300 dark:text-slate-600">›</span>
            <span className="font-bold text-[#FF4D4D] truncate max-w-[200px] sm:max-w-none">
              {meta.title}
            </span>
          </nav>

          <Link
            href={routes.dsayatra.visualizers}
            className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg border border-slate-200/90 dark:border-[#26262E] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-[#1A1A20] transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>All Visualizers</span>
          </Link>
        </div>

        {/* Visualizer Workspace Card */}
        <div className="rounded-xl border border-slate-200/90 dark:border-[#24242A] bg-white dark:bg-[#131316] shadow-2xs p-4 sm:p-5 space-y-4">
          <header className="space-y-1.5 border-b border-slate-100 dark:border-[#1E1E24] pb-3 sm:pb-4">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-50 dark:bg-red-950/40 text-[#FF4D4D] border border-red-100 dark:border-red-900/30">
                {TOPIC_LABELS[meta.topic] || meta.topic}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {meta.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium max-w-2xl leading-relaxed">
              {meta.description}
            </p>
          </header>

          <div className="rounded-xl border border-slate-100 dark:border-[#1E1E24] bg-slate-50/50 dark:bg-[#0E0E12] p-2 sm:p-4 overflow-hidden">
            <Component />
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: Object.keys(DSA_VISUALIZER_META).map((slug) => ({ params: { slug } })),
  fallback: "blocking",
});

export const getStaticProps: GetStaticProps<VisualizerPageProps> = async (
  context,
) => {
  const raw = context.params?.slug;
  const slug = Array.isArray(raw) ? raw[0] : raw;

  if (!slug || !DSA_VISUALIZER_META[slug]) {
    return { notFound: true };
  }

  const prefetched = await getPreFetchProps({
    slug: routes.dsayatra.visualizers,
    appId: "dsayatra",
  });

  return {
    ...prefetched,
    props: {
      ...prefetched.props,
      slug,
    },
  };
};

export default VisualizerViewerPage;
