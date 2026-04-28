import "@tbe/components/styles/common.css";
import "@/styles/globals.css";

import { AuthProvider } from "@tbe/auth";
import { useAuth } from "@tbe/auth";
import { PrepYatraGamificationProvider } from "@tbe/components";
import { Toaster as Sonner } from "@tbe/components";
import { Toaster } from "@tbe/components";
import { TooltipProvider } from "@tbe/components";
import {
  initGA,
  installGlobalAnalyticsListeners,
  trackPageview,
} from "@tbe/components/analytics";
import { GamificationProvider } from "@tbe/gamification";
import { useProductOnboardingGate } from "@tbe/hooks";
import { TBEQueryProvider } from "@tbe/query";
import type { AppProps } from "next/app";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useCallback, useEffect, useState } from "react";

// Cache clearing component
const CacheManager = () => {
  useEffect(() => {
    // Check if we need to clear cache (e.g., after deployment)
    const lastDeployTime = localStorage.getItem("lastDeployTime");
    const currentTime = Date.now();

    // If no last deploy time or it's been more than 1 hour, clear cache
    if (!lastDeployTime || currentTime - parseInt(lastDeployTime) > 3600000) {
      if ("caches" in window) {
        caches.keys().then((names) => {
          names.forEach((name) => {
            caches.delete(name);
          });
        });
      }
      localStorage.setItem("lastDeployTime", currentTime.toString());
    }
  }, []);

  return null;
};

// App Content Component with onboarding logic
const AppContent = ({
  Component,
  pageProps,
}: {
  Component: AppProps["Component"];
  pageProps: any;
}) => {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    initGA();
    installGlobalAnalyticsListeners();
    trackPageview(router.asPath);
    const handleRouteChange = (url: string) => trackPageview(url);
    router.events.on("routeChangeComplete", handleRouteChange);
    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [router]);

  const buildRedirectUrl = useCallback(() => {
    if (typeof window === "undefined") return "/dashboard";
    return `${window.location.origin}/dashboard`;
  }, []);

  const { isChecking } = useProductOnboardingGate({
    pathname: router.pathname,
    publicRoutes: ["/login", "/", "/auth"],
    productId: "prepyatra",
    from: "prepyatra",
    buildRedirectUrl,
    isOnboarded: (data) =>
      (data as { prepYatra?: { pyOnboarded?: boolean } })?.prepYatra
        ?.pyOnboarded === true,
  });

  const publicPages = ["/login", "/auth", "/"];
  const isProtectedPage = !publicPages.includes(router.pathname);

  if (
    isClient &&
    isProtectedPage &&
    isAuthenticated &&
    !isLoading &&
    isChecking
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <>
      <CacheManager />
      <GamificationProvider>
        <PrepYatraGamificationProvider>
          <Component {...pageProps} />
        </PrepYatraGamificationProvider>
      </GamificationProvider>
    </>
  );
};

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>PrepYatra - Your Interview Preparation Journey</title>
        <meta
          name="description"
          content="Track your interview preparation journey, manage recruiter contacts, and accelerate your career growth with PrepYatra."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />

        {/* PWA meta tags */}
        <meta name="theme-color" content="#FF5757" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="PrepYatra" />
        <link rel="apple-touch-icon" href="/android-chrome-192x192.png" />
        <link rel="manifest" href="/manifest.json" />
      </Head>

      <AuthProvider>
        <TBEQueryProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <AppContent Component={Component} pageProps={pageProps} />
          </TooltipProvider>
        </TBEQueryProvider>
      </AuthProvider>
    </>
  );
}
