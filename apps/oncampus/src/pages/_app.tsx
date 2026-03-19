import "@tbe/components/styles/common.css";
import "@/styles/globals.css";
import "@/styles/colors.css";

import { AuthProvider } from "@tbe/auth";
import {
  initGA,
  installGlobalAnalyticsListeners,
  trackPageview,
} from "@tbe/components/analytics";
import { GamificationProvider } from "@tbe/gamification";
import { useUser } from "@tbe/hooks";
import { TBEQueryProvider } from "@tbe/query";
import type { AppProps } from "next/app";
import Head from "next/head";
import { useRouter } from "next/router";
import { Fragment, useEffect, useState } from "react";
import { Toaster } from "sonner";

import DashboardLayout from "@/components/DashboardLayout";

const AppContent = ({
  Component,
  pageProps,
}: {
  Component: AppProps["Component"];
  pageProps: any;
}) => {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const userData = useUser();
  const { user, isAuth, loading } = (userData as any) || {
    user: null,
    isAuth: false,
    loading: true,
  };

  // Ensure we're on the client side before accessing window
  useEffect(() => {
    setIsClient(true);
  }, []);

  // ✅ Initialize Google Analytics
  useEffect(() => {
    initGA();
    installGlobalAnalyticsListeners();

    const handleRouteChange = (url: string) => trackPageview(url);
    router.events.on("routeChangeComplete", handleRouteChange);
    return () => router.events.off("routeChangeComplete", handleRouteChange);
  }, [router.events]);

  const isDashboardRoute = router.pathname.startsWith("/dashboard");
  const isDSAPrepRoute = router.pathname.startsWith("/dashboard/dsa-prep");
  // Exclude slug pages from DashboardLayout (they should be full-screen study view)
  // router.pathname for dynamic routes is the pattern like '/dashboard/interview-prep/[sheetSlug]' or '/dsa-prep/[sheetSlug]'
  const isStudyRoute = router.pathname.includes("[sheetSlug]");
  // Exclude the main DSA prep page for fullscreen experience
  const isDSAMainRoute = router.pathname === "/dashboard/dsa-prep";
  // Exclude the Aptitude page for fullscreen workspace experience
  const isAptitudeRoute = router.pathname === "/dashboard/aptitude";

  const shouldUseDashboardLayout =
    (isDashboardRoute || isDSAPrepRoute) &&
    !isStudyRoute &&
    !isDSAMainRoute &&
    !isAptitudeRoute;

  const pageContent = <Component {...pageProps} />;

  return (
    <TBEQueryProvider>
      <GamificationProvider>
        <div className="bg-[#0A0A0A] min-h-screen">
          {shouldUseDashboardLayout ? (
            <DashboardLayout>{pageContent}</DashboardLayout>
          ) : (
            pageContent
          )}
        </div>
      </GamificationProvider>
    </TBEQueryProvider>
  );
};

const OnCampusApp = ({ Component, pageProps }: AppProps) => {
  return (
    <Fragment>
      <Head>
        <link rel="icon" href="/svg/favicon.ico" />
        <title>OnCampus</title>
      </Head>
      <AuthProvider>
        <AppContent Component={Component} pageProps={pageProps} />
        <Toaster position="top-center" richColors />
      </AuthProvider>
    </Fragment>
  );
};

export default OnCampusApp;
