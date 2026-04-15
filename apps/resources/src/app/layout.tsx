import "./globals.css";

import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { getSiteBaseUrl } from "@/lib/site";

import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteBaseUrl()),
  title: {
    default: "TBE Resources | The Boring Education",
    template: "%s | TBE Resources",
  },
  description:
    "Free guides, roadmaps, and learning resources from The Boring Education.",
  keywords: [
    "tech education",
    "programming",
    "roadmap",
    "interview prep",
    "The Boring Education",
  ],
  authors: [{ name: "The Boring Education" }],
  openGraph: {
    siteName: "TBE Resources",
    locale: "en_IN",
    type: "website",
  },
};

function SiteJsonLd() {
  const base = getSiteBaseUrl();
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${base}/#organization`,
        name: "The Boring Education",
        url: base,
      },
      {
        "@type": "WebSite",
        "@id": `${base}/#website`,
        name: "TBE Resources",
        url: base,
        publisher: { "@id": `${base}/#organization` },
      },
    ],
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans">
        <SiteJsonLd />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
