import "@tbe/components/styles/common.css";
import "@/styles/globals.css";
import "@/styles/colors.css";

import { AuthProvider } from "@tbe/auth";
import { GamificationProvider } from "@tbe/gamification";
import { useTracking, useUser } from "@tbe/hooks";
import { TBEQueryProvider } from "@tbe/query";
import type { AppProps } from "next/app";
import Head from "next/head";
import { useRouter } from "next/router";
import { Fragment, useEffect } from "react";
import { Toaster } from "sonner";

import DashboardLayout from "@/components/DashboardLayout";
import { OnboardingCheck } from "@/components/OnboardingCheck";

const NON_SHELL_ROUTES = new Set([
  "/",
  "/login",
  "/pricing",
  "/campus-prep",
  "/auth/callback",
]);

const AppContent = ({
  Component,
  pageProps,
}: {
  Component: AppProps["Component"];
  pageProps: any;
}) => {
  const router = useRouter();
  useUser();
  useTracking();

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.classList.remove("light");
      document.documentElement.classList.add("dark");
    }
  }, []);

  const isNonShellRoute =
    NON_SHELL_ROUTES.has(router.pathname) ||
    router.pathname.startsWith("/auth/");

  const pageContent = <Component {...pageProps} />;

  return (
    <GamificationProvider theme="dark">
      {isNonShellRoute ? (
        pageContent
      ) : (
        <DashboardLayout>{pageContent}</DashboardLayout>
      )}
    </GamificationProvider>
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
        <TBEQueryProvider>
          <OnboardingCheck />
          <AppContent Component={Component} pageProps={pageProps} />
        </TBEQueryProvider>
        <Toaster position="top-center" richColors />
      </AuthProvider>
    </Fragment>
  );
};

export default OnCampusApp;
