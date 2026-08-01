import { ResumeYatraLandingPage } from "@tbe/components";
import { PAGE_REFRESH_TIMEOUT, routes } from "@tbe/constants";
import type { PageProps } from "@tbe/interface";
import { getPreFetchProps } from "@tbe/utils";

export default function Index({ seoMeta }: PageProps) {
  return <ResumeYatraLandingPage seoMeta={seoMeta} />;
}

export const getStaticProps = async () => ({
  ...(await getPreFetchProps({
    slug: routes.resumeYatra.home,
    appId: "resume-yatra",
  })),
  revalidate: PAGE_REFRESH_TIMEOUT.veryVeryLong,
});
