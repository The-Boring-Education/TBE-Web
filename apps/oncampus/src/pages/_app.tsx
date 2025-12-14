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
import { useRouter } from 'next/router';
import { SessionProvider } from 'next-auth/react';
import { Fragment, useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';

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

  return (
    <QueryClientProvider client={queryClient}>
      <GamificationProvider>
        <div className="bg-[#0A0A0A] min-h-screen">
          <Component {...pageProps} />
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
      <SessionProvider
        session={session}
        refetchInterval={5 * 60}
        refetchOnWindowFocus
      >
        <AppContent Component={Component} pageProps={pageProps} />
      </SessionProvider>
    </Fragment>
  );
};

export default OnCampusApp;
