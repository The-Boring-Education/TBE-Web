import "@/index.css";

import type { AppProps } from "next/app";

import { Providers } from "@/components/Providers";

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Providers>
      <Component {...pageProps} />
    </Providers>
  );
}
