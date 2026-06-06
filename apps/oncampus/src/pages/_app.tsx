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
import { Fragment } from "react";
import { Toaster } from "sonner";

import DashboardLayout from "@/components/DashboardLayout";
import { OnboardingCheck } from "@/components/OnboardingCheck";

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

  const isDashboardRoute = router.pathname.startsWith("/dashboard");
  const isDSAPrepRoute = router.pathname.startsWith("/sheets");
  // Exclude slug pages from DashboardLayout (they should be full-screen study view)
  // router.pathname for dynamic routes is the pattern like '/sheets' (with topic param) or '/dashboard/quizzes'
  const isStudyRoute = router.pathname.includes("[sheetSlug]");
  // Exclude the main DSA prep page for fullscreen experience
  const isDSAMainRoute = router.pathname === "/sheets";
  // Exclude the Aptitude page for fullscreen workspace experience
  const isAptitudeRoute = router.pathname === "/dashboard/aptitude";
  // Exclude the Interview Prep main page for fullscreen workspace experience
  const isInterviewPrepMainRoute = router.pathname === "/interview-sheets";
  // Exclude the Quizzes page for fullscreen workspace experience
  const isQuizzesRoute = router.pathname === "/dashboard/quizzes";
  // Exclude the Core Subjects page for fullscreen workspace experience
  const isCoreSubjectsRoute = router.pathname.startsWith("/coresubjects");

  const shouldUseDashboardLayout =
    (isDashboardRoute || isDSAPrepRoute) &&
    !isStudyRoute &&
    !isDSAMainRoute &&
    !isAptitudeRoute &&
    !isInterviewPrepMainRoute &&
    !isQuizzesRoute &&
    !isCoreSubjectsRoute;

  /** Same idea as DSA Yatra: /pricing is full-screen only (no shell, no app chrome wrapper). */
  const isPricingRoute = router.pathname === "/pricing";

  const pageContent = <Component {...pageProps} />;

  return (
    <GamificationProvider>
      {isPricingRoute ? (
        pageContent
      ) : (
        <div className="bg-[#0A0A0A] min-h-screen">
          {shouldUseDashboardLayout ? (
            <DashboardLayout>{pageContent}</DashboardLayout>
          ) : (
            pageContent
          )}
        </div>
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
