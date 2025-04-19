import '@/styles/globals.css';
import '@/styles/colors.css';
import { AppProps } from 'next/app';
import { PageLayout } from '@/components';
import Script from 'next/script';
import { googleAnalyticsScript, gtag, routes } from '@/constant';
import { QueryClient, QueryClientProvider } from 'react-query';
import { SessionProvider } from 'next-auth/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useUser } from '@/hooks';
import { getRedirectUrl } from '@/utils';

// Create a client
const queryClient = new QueryClient();

const AppContent = ({
  Component,
  pageProps,
}: Omit<AppProps, 'pageProps'> & { pageProps: any }) => {
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
    <>
      <Script async strategy='afterInteractive' src={gtag}></Script>
      <Script id='google-analytics'>{googleAnalyticsScript}</Script>
      <SessionProvider session={session}>
        <AppContent Component={Component} pageProps={pageProps} />
      </SessionProvider>
      <SpeedInsights />
    </>
  );
};

export default TheBoringEducation;
