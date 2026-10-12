import { SEO, VISUALIZER_MAP } from "@tbe/components";
import { DSA_VISUALIZER_META, routes, TOPIC_LABELS } from "@tbe/constants";
import type { PageProps } from "@tbe/interface";
import { getPreFetchProps } from "@tbe/utils";
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
        <div className="mx-auto max-w-3xl px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-white">
            Visualizer not found
          </h1>
          <Link
            href={routes.dsayatra.visualizers}
            className="mt-4 inline-block text-sm text-[#ff5757] hover:underline"
          >
            ← Back to visualizers
          </Link>
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

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            href={routes.dsayatra.visualizers}
            className="text-xs text-[#9ca3af] hover:text-[#ff5757]"
          >
            ← All visualizers
          </Link>
        </div>

        <header className="mb-6">
          <p className="text-[10px] font-black uppercase tracking-widest text-[#ff5757]">
            {TOPIC_LABELS[meta.topic] || meta.topic}
          </p>
          <h1 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
            {meta.title}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-[#9ca3af]">
            {meta.description}
          </p>
        </header>

        <div>
          <Component />
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
