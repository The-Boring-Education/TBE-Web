import { DsaYatraLandingPage } from "@tbe/components";
import { PAGE_REFRESH_TIMEOUT } from "@tbe/constants";
import { useUser } from "@tbe/hooks";
import type { PageProps } from "@tbe/interface";
import { getPreFetchProps } from "@tbe/utils";
import { useRouter } from "next/router";
import { useEffect } from "react";

export const getStaticProps = async () => ({
  ...(await getPreFetchProps({ slug: "/", appId: "dsayatra" })),
  revalidate: PAGE_REFRESH_TIMEOUT.veryVeryLong,
});

export default function Index(props: PageProps) {
  const router = useRouter();
  const { isAuth, loading } = useUser();

  useEffect(() => {
    if (!loading && isAuth) {
      router.replace("/dashboard");
    }
  }, [isAuth, loading, router]);

  return <DsaYatraLandingPage seoMeta={props.seoMeta} />;
}
