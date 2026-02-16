import "@/index.css";

import type { AppProps } from "next/app";

import { OnboardingCheck } from "@/components/OnboardingCheck";
import { Providers } from "@/components/Providers";
import Layout from "@/components/Layout";

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Providers session={pageProps.session}>
      <OnboardingCheck />
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </Providers>
  );
}
