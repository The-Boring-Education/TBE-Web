import "@tbe/components/styles/common.css";
import "@/index.css";

import {
  initGA,
  installGlobalAnalyticsListeners,
  trackPageview,
} from "@tbe/components/analytics";
import type { AppProps } from "next/app";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect } from "react";

import DsaDashboardLayout from "@/components/layout/DsaDashboardLayout";
import Layout from "@/components/layout/Layout";
import { OnboardingCheck } from "@/components/onboarding/OnboardingCheck";
import { Providers } from "@/components/providers/Providers";

const DSA_APP_SHELL_PATHS = new Set(["/dashboard", "/revisions", "/topics"]);

function AppWithShell({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const useDsaShell = DSA_APP_SHELL_PATHS.has(router.pathname);

  useEffect(() => {
    initGA();
    installGlobalAnalyticsListeners();

    const handleRouteChange = (url: string) => trackPageview(url);
    router.events.on("routeChangeComplete", handleRouteChange);
    return () => router.events.off("routeChangeComplete", handleRouteChange);
  }, [router.events]);
  const page = <Component {...pageProps} />;

  if (useDsaShell) {
    return (
      <Providers>
        <OnboardingCheck />
        <DsaDashboardLayout>{page}</DsaDashboardLayout>
      </Providers>
    );
  }

  return (
    <Providers>
      <OnboardingCheck />
      <Layout>{page}</Layout>
    </Providers>
  );
}

export default function MyApp(props: AppProps) {
  return (
    <>
      <Head>
        <link rel="icon" type="image/svg+xml" href="/dsayatra_favicon.svg" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0"
        />
      </Head>
      <AppWithShell {...props} />
    </>
  );
}
