import { PrepYatraLandingPage } from "@tbe/components";
import { PAGE_REFRESH_TIMEOUT, routes } from "@tbe/constants";
import type { PageProps } from "@tbe/interface";
import { getPreFetchProps } from "@tbe/utils";

const Index = (props: PageProps) => <PrepYatraLandingPage {...props} />;

export const getStaticProps = async () => ({
  ...(await getPreFetchProps({
    slug: routes.prepYatra.home,
    appId: "prep-yatra",
  })),
  revalidate: PAGE_REFRESH_TIMEOUT.veryVeryLong,
});

export default Index;
