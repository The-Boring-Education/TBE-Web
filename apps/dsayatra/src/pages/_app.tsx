import "@tbe/components/styles/common.css";
import "@/index.css";

import type { AppProps } from "next/app";
import Head from "next/head";

import Layout from "@/components/Layout";
import { OnboardingCheck } from "@/components/OnboardingCheck";
import { Providers } from "@/components/Providers";

function AppWithShell({ Component, pageProps }: AppProps) {
  const page = <Component {...pageProps} />;

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
