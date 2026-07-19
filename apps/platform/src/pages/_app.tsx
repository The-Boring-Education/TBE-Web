import '@tbe/components/styles/common.css';
import '@/styles/globals.css';
import '@/styles/colors.css';

import { AuthProvider, getAccessToken } from '@tbe/auth';
import { Layout } from '@tbe/components';
// import { envConfig, googleAnalyticsScript, gtag, routes } from '@tbe/constants';
import { envConfig, routes } from '@tbe/constants';
import { GamificationProvider } from '@tbe/gamification';
import { useTracking, useUser } from '@tbe/hooks';
import { TBEQueryProvider } from '@tbe/query';
import { getRedirectUrl } from '@tbe/utils';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { Fragment, useEffect, useState } from 'react';

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

  // Ensure we're on the client side before accessing window
  useEffect(() => {
    setIsClient(true);
  }, []);

  useTracking();

  const [isSyncingSession, setIsSyncingSession] = useState(false);

  useEffect(() => {
    // Only run on client side
    if (!isClient || loading || !isAuth || isSyncingSession) return;

    const ensureOnboardingAndSession = async () => {
      // If session says not onboarded, verify with API once to avoid stale session loop
      if (!isOnboarded && router.pathname !== routes.onboarding) {
        try {
          if (user?.id) {
            const resp = await fetch(
              `${envConfig.API_URL}/user?userId=${user.id}`,
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
          } else {
            // Fallback: the JWT-based `AuthUser` (see @tbe/auth AuthProvider)
            // has no `token` field, so read the access token from the cookie.
            // Without this, the cross-origin onboarding app cannot send an
            // Authorization header and every submit hits `withUserAuth` and
            // returns 401 (see apps/api /user/onboarding).
            const accessToken = getAccessToken();
            if (accessToken) {
              params.append('token', accessToken);
            }
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
    <TBEQueryProvider>
      <GamificationProvider>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </GamificationProvider>
    </TBEQueryProvider>
  );
};
const TheBoringEducation = ({ Component, pageProps }: AppProps) => {
  return (
    <Fragment>
      <AuthProvider>
        <AppContent Component={Component} pageProps={pageProps} />
      </AuthProvider>
    </Fragment>
  );
};

export default TheBoringEducation;
