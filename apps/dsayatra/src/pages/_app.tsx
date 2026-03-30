import "@tbe/components/styles/common.css";
import "@/index.css";

import type { AppProps } from "next/app";
import Head from "next/head";

import Layout from "@/components/Layout";
import { OnboardingCheck } from "@/components/OnboardingCheck";
import { Providers } from "@/components/Providers";

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <link rel="icon" type="image/svg+xml" href="/dsayatra_favicon.svg" />
      </Head>
      <Providers>
        <OnboardingCheck />
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </Providers>
    </>
  );
}
