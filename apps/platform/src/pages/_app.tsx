import '@/styles/globals.css';
import '@/styles/colors.css';

import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import Script from 'next/script';
import { SessionProvider } from 'next-auth/react';
import { Fragment, useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';

import { Layout } from '@tbe/components';
import { GamificationProvider } from '@tbe/components';
import { envConfig, googleAnalyticsScript, gtag, routes } from '@tbe/constants';
import { useUser } from '@tbe/hooks';
import { getRedirectUrl } from '@tbe/utils';

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
  const { user, isOnboarded, isAuth, loading } = userData || { user: null, isOnboarded: false, isAuth: false, loading: true };

  // Ensure we're on the client side before accessing window
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    // Only run on client side
    if (!isClient || loading || !isAuth) return;

    if (!isOnboarded && isAuth && router.pathname !== routes.onboarding) {
      // Redirect to external onboarding app
      const onboardingBaseUrl = envConfig.NEXT_PUBLIC_ONBOARDING_APP_URL;
      const params = new URLSearchParams({
        userId: user?.id || '',
        from: 'webapp',
        redirect: window.location.href,
      });
      // If token is available, add it
      if (user && (user as any).token) {
        params.append('token', (user as any).token);
      }
      window.location.href = `${onboardingBaseUrl}/?${params.toString()}`;
      return;
    }
    // Redirect to dashboard if onboarded and authenticated
    else if (isOnboarded && router.pathname === routes.onboarding) {
      const redirectTo = getRedirectUrl();
      router.push(redirectTo);
    }
  }, [isClient, isAuth, isOnboarded, loading, router, router.pathname, user]);

  return (
    <QueryClientProvider client={queryClient}>
      <GamificationProvider>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </GamificationProvider>
    </QueryClientProvider>
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
