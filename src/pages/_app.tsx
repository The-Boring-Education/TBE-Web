import '@/styles/globals.css';
import '@/styles/colors.css';

import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import Script from 'next/script';
import { SessionProvider } from 'next-auth/react';
import { Fragment, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';

import { PageLayout } from '@/components';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import { GamificationProvider } from '@/components/layout/GamificationProvider';
import { envConfig, googleAnalyticsScript, gtag, routes } from '@/constant';
import { useUser } from '@/hooks';
import { getRedirectUrl } from '@/utils';

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
  const { user, isOnboarded, isAuth, loading } = useUser();

  useEffect(() => {
    if (loading || !isAuth) return;

    if (!isOnboarded && isAuth && router.pathname !== routes.onboarding) {
      // Redirect to internal onboarding page
      router.push(routes.onboarding);
      return;
    }
    // Redirect to dashboard if onboarded and authenticated
    else if (isOnboarded && router.pathname === routes.onboarding) {
      const redirectTo = getRedirectUrl();
      router.push(redirectTo);
    }
  }, [isAuth, isOnboarded, loading, router, router.pathname, user]);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <GamificationProvider>
          <PageLayout>
            <Component {...pageProps} />
          </PageLayout>
        </GamificationProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

const TheBoringEducation = ({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) => (
  <Fragment>
    <Script async src={gtag} strategy='lazyOnload' />
    <Script id='google-analytics' strategy='lazyOnload'>
      {googleAnalyticsScript}
    </Script>
    <SessionProvider session={session}>
      <AppContent Component={Component} pageProps={pageProps} />
    </SessionProvider>
  </Fragment>
);

export default TheBoringEducation;
