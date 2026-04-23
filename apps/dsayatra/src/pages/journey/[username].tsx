import { DsaYatraPublicJourneyPage, SEO } from "@tbe/components";
import { PAGE_REFRESH_TIMEOUT } from "@tbe/constants";
import type { PageProps } from "@tbe/interface";
import { getPreFetchProps } from "@tbe/utils";
import type { GetStaticPaths, GetStaticProps } from "next";
import { Fragment } from "react";

/**
 * Dynamic route: no paths at build time (same pattern as prep-yatra `/journey/[username]`).
 * Public page uses Prep Yatra–styled shell from `@tbe/components`.
 */
export const getStaticPaths: GetStaticPaths = async () => ({
  paths: [],
  fallback: "blocking",
});

export const getStaticProps: GetStaticProps = async () => ({
  ...(await getPreFetchProps({ slug: "/journey", appId: "dsayatra" })),
  revalidate: PAGE_REFRESH_TIMEOUT.veryVeryLong,
});

export default function PublicDsaJourneyPage({ seoMeta }: PageProps) {
  return (
    <Fragment>
      <SEO seoMeta={seoMeta} />
      <DsaYatraPublicJourneyPage />
    </Fragment>
  );
}
