import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import Script from 'next/script';
import { SessionProvider } from 'next-auth/react';
import { Fragment, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';

import '@/styles/globals.css';
import '@/styles/colors.css';

import { useUser } from '@/hooks';

import { PageLayout } from '@/components';

import { googleAnalyticsScript, gtag, routes } from '@/constant';
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
  const { isOnboarded, isAuth, loading } = useUser();

  useEffect(() => {
    if (loading) return;

    // Redirect to onboarding if not onboarded and authenticated
    if (!isOnboarded && isAuth) {
      router.push(routes.onboarding);
    }
    // Redirect to dashboard if onboarded and authenticated
    else if (isOnboarded && router.pathname === routes.onboarding) {
      const redirectTo = getRedirectUrl();
      router.push(redirectTo);
    }
  }, [isAuth, isOnboarded, loading]);

  return (
    <QueryClientProvider client={queryClient}>
      <PageLayout>
        <Component {...pageProps} />
      </PageLayout>
    </QueryClientProvider>
  );
};

const TheBoringEducation = ({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) => {
  return (
    <Fragment>
      <Script async src={gtag} strategy='lazyOnload'></Script>
      <Script id='google-analytics' strategy='lazyOnload'>
        {googleAnalyticsScript}
      </Script>
      <SessionProvider session={session}>
        <AppContent Component={Component} pageProps={pageProps} />
      </SessionProvider>
    </Fragment>
  );
};

export default TheBoringEducation;
