import "@tbe/components/styles/common.css";
import "@/index.css";

import type { AppProps } from "next/app";
import Head from "next/head";
import { useRouter } from "next/router";

import DsaDashboardLayout from "@/components/DsaDashboardLayout";
import Layout from "@/components/Layout";
import { OnboardingCheck } from "@/components/OnboardingCheck";
import { Providers } from "@/components/Providers";

const DSA_APP_SHELL_PATHS = new Set([
  "/dashboard",
  "/revisions",
  "/topics",
  "/pricing",
]);

function AppWithShell({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const useDsaShell = DSA_APP_SHELL_PATHS.has(router.pathname);
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
      </Head>
      <AppWithShell {...props} />
    </>
  );
}
