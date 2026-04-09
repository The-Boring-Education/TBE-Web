import { DsaYatraLandingPage } from "@tbe/components";
import { PAGE_REFRESH_TIMEOUT } from "@tbe/constants";
import type { PageProps } from "@tbe/interface";
import { getPreFetchProps } from "@tbe/utils";

export const getStaticProps = async () => ({
  ...(await getPreFetchProps({ slug: "/", appId: "dsayatra" })),
  revalidate: PAGE_REFRESH_TIMEOUT.veryVeryLong,
});

export default function Index(props: PageProps) {
  return <DsaYatraLandingPage seoMeta={props.seoMeta} />;
}
