import '@/styles/globals.css';
import '@/styles/colors.css';

import { GamificationProvider } from '@tbe/components';
import {
  initGA,
  installGlobalAnalyticsListeners,
  trackPageview,
} from '@tbe/components/analytics';
import { useUser } from '@tbe/hooks';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { SessionProvider } from 'next-auth/react';
import { Fragment, useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'sonner';

import DashboardLayout from '@/components/DashboardLayout';

// Create a client
const queryClient = new QueryClient();

const AppContent = ({
  Component,
  pageProps,
}: {
  Component: AppProps['Component'];
  pageProps: any;
}) => {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const userData = useUser();
  const { user, isAuth, loading } =
    (userData as any) || {
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
    router.events.on('routeChangeComplete', handleRouteChange);
    return () => router.events.off('routeChangeComplete', handleRouteChange);
  }, [router.events]);

  const isDashboardRoute = router.pathname.startsWith('/dashboard');
  const isDSAPrepRoute = router.pathname.startsWith('/dashboard/dsa-prep');
  // Exclude slug pages from DashboardLayout (they should be full-screen study view)
  // router.pathname for dynamic routes is the pattern like '/dashboard/interview-prep/[sheetSlug]' or '/dsa-prep/[sheetSlug]'
  const isStudyRoute = router.pathname.includes('[sheetSlug]');
  // Exclude the main DSA prep page for fullscreen experience
  const isDSAMainRoute = router.pathname === '/dashboard/dsa-prep';
  const shouldUseDashboardLayout = (isDashboardRoute || isDSAPrepRoute) && !isStudyRoute && !isDSAMainRoute;

  const pageContent = (
    <Component {...pageProps} />
  );

  return (
    <QueryClientProvider client={queryClient}>
      <GamificationProvider>
        <div className="bg-[#0A0A0A] min-h-screen">
          {shouldUseDashboardLayout ? (
            <DashboardLayout>
              {pageContent}
            </DashboardLayout>
          ) : (
            pageContent
          )}
        </div>
      </GamificationProvider>
    </QueryClientProvider>
  );
};

const OnCampusApp = ({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) => {
  return (
    <Fragment>
      <Head>
        <link rel="icon" href="/svg/favicon.ico" />
        <title>OnCampus</title>
      </Head>
      <SessionProvider
        session={session}
        refetchInterval={5 * 60}
        refetchOnWindowFocus
      >
        <AppContent Component={Component} pageProps={pageProps} />
        <Toaster position="top-center" richColors />
      </SessionProvider>
    </Fragment>
  );
};

export default OnCampusApp;