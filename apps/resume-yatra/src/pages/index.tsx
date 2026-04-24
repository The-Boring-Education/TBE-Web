import { ResumeYatraLandingPage } from "@tbe/components";
import { PAGE_REFRESH_TIMEOUT, routes } from "@tbe/constants";
import type { PageProps } from "@tbe/interface";
import { getPreFetchProps } from "@tbe/utils";

import Hero from "@/components/landing/Hero";

export default function Index({ seoMeta }: PageProps) {
  return <ResumeYatraLandingPage heroComponent={<Hero />} seoMeta={seoMeta} />;
}

export const getStaticProps = async () => ({
  ...(await getPreFetchProps({
    slug: routes.resumeYatra.home,
    appId: "resume-yatra",
  })),
  revalidate: PAGE_REFRESH_TIMEOUT.veryVeryLong,
});
