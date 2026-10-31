import "@tbe/components/styles/common.css";
import "@/styles/globals.css";

import { AuthProvider } from "@tbe/auth";
import {
  RadixToaster,
  Toaster as SonnerToaster,
  TooltipProvider,
} from "@tbe/components/ui";
import { DEFAULT_OG_IMAGE } from "@tbe/constants";
import { useTracking } from "@tbe/hooks";
import { TBEQueryProvider } from "@tbe/query";
import type { AppProps } from "next/app";
import Head from "next/head";
import React from "react";

import { OnboardingCheck } from "@/components/OnboardingCheck";

export default function App({ Component, pageProps }: AppProps) {
  useTracking();

  return (
    <>
      <Head>
        <title key="title">Resume Yatra - Build Your Perfect Resume</title>
        <meta
          key="description"
          name="description"
          content="Build a professional resume with guided steps, best practices, and expert tips. Resume Yatra helps you create a resume that gets you hired."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg?v=2" />

        {/* Open Graph / Social Media (overridden by page-level SEO via matching keys) */}
        <meta key="og:type" property="og:type" content="website" />
        <meta
          key="og:title"
          property="og:title"
          content="Resume Yatra - Build Your Perfect Resume"
        />
        <meta
          key="og:description"
          property="og:description"
          content="Build a professional resume with guided steps and expert tips."
        />
        <meta
          key="og:image"
          property="og:image"
          content={DEFAULT_OG_IMAGE.url}
        />
        <meta
          key="twitter:card"
          name="twitter:card"
          content="summary_large_image"
        />
        <meta
          key="twitter:image"
          name="twitter:image"
          content={DEFAULT_OG_IMAGE.url}
        />

        {/* PWA meta tags */}
        <meta name="theme-color" content="#8b5cf6" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Resume Yatra" />
      </Head>

      <AuthProvider>
        <TBEQueryProvider>
          <TooltipProvider>
            <OnboardingCheck />
            <RadixToaster />
            <SonnerToaster />
            <Component {...pageProps} />
          </TooltipProvider>
        </TBEQueryProvider>
      </AuthProvider>
    </>
  );
}
