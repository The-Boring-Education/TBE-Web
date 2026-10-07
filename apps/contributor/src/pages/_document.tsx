import { Head, Html, Main, NextScript } from "next/document";

import { SITE } from "@/config/links";

export default function Document() {
  return (
    <Html lang="en" className="scroll-smooth">
      <Head>
        <meta name="theme-color" content="#ffffff" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="application-name" content={SITE.name} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </Head>
      <body className="antialiased bg-white text-gray-900 selection:bg-[#FFE2E0] selection:text-[#EA4544]">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
