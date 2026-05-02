import "@tbe/components/styles/common.css";
import "@/index.css";

import { useTracking } from "@tbe/hooks";
import type { AppProps } from "next/app";
import Head from "next/head";
import { useRouter } from "next/router";

import DsaDashboardLayout from "@/components/layout/DsaDashboardLayout";
import Layout from "@/components/layout/Layout";
import { OnboardingCheck } from "@/components/onboarding/OnboardingCheck";
import { Providers } from "@/components/providers/Providers";

const DSA_APP_SHELL_PATHS = new Set(["/dashboard", "/revisions", "/topics"]);

function AppWithShell({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const useDsaShell = DSA_APP_SHELL_PATHS.has(router.pathname);

  useTracking();
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
