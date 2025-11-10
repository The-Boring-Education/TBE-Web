import '@/styles/globals.css';
import '@/styles/colors.css';

import { Layout } from '@tbe/components';
import { GamificationProvider } from '@tbe/components';
import {
  initGA,
  installGlobalAnalyticsListeners,
  trackPageview,
} from '@tbe/components/analytics';
// import { envConfig, googleAnalyticsScript, gtag, routes } from '@tbe/constants';
import { envConfig, routes } from '@tbe/constants';
import { useUser } from '@tbe/hooks';
import { getRedirectUrl } from '@tbe/utils';
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
  const { user, isOnboarded, isAuth, loading, updateSession } =
    (userData as any) || {
      user: null,
      isOnboarded: false,
      isAuth: false,
      loading: true,
    };
  const [isSyncingSession, setIsSyncingSession] = useState(false);

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

  useEffect(() => {
    // Only run on client side
    if (!isClient || loading || !isAuth || isSyncingSession) return;

    const ensureOnboardingAndSession = async () => {
      // If session says not onboarded, verify with API once to avoid stale session loop
      if (!isOnboarded && router.pathname !== routes.onboarding) {
        try {
          if (user?.id) {
            const resp = await fetch(
              `${envConfig.API_URL}/api/v1/user?userId=${user.id}`
            );
            const json = await resp.json();
            const dbIsOnboarded = json?.data?.isOnboarded === true;
            if (dbIsOnboarded) {
              // Refresh session so callbacks pull latest isOnboarded
              setIsSyncingSession(true);
              try {
                if (typeof updateSession === 'function') {
                  await updateSession();
                } else {
                  // Fallback: hard reload to force session refetch
                  window.location.reload();
                }
              } finally {
                setIsSyncingSession(false);
              }
              return; // Skip redirect since user is actually onboarded
            }
          }
        } catch {
          // ignore and proceed to onboarding redirect
        }

        // Redirect to external onboarding app (only if URL configured)
        const onboardingBaseUrl = envConfig.ONBOARDING_URL;
        if (onboardingBaseUrl) {
          const params = new URLSearchParams({
            userId: user?.id || '',
            email: user?.email || '',
            from: 'webapp',
            redirect: window.location.href,
          });
          if (user && (user as any).token) {
            params.append('token', (user as any).token);
          }
          window.location.href = `${onboardingBaseUrl}/?${params.toString()}`;
          return;
        }
      }

      // Redirect to dashboard if onboarded and authenticated
      if (isOnboarded && router.pathname === routes.onboarding) {
        const redirectTo = getRedirectUrl();
        router.push(redirectTo);
      }
    };

    void ensureOnboardingAndSession();
  }, [
    isClient,
    isAuth,
    isOnboarded,
    loading,
    router,
    router.pathname,
    user,
    updateSession,
    isSyncingSession,
  ]);

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

export default TheBoringEducation;
