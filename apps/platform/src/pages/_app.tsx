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
      // If user is on the onboarding page
      if (router.pathname === routes.onboarding) {
        if (isOnboarded) {
          const redirectTo = getRedirectUrl();
          router.push(redirectTo);
          return;
        }

        // If local session says not onboarded, verify with DB to prevent staying stuck on onboarding
        if (user?.id) {
          try {
            const accessToken = getAccessToken();
            const authHeaders: Record<string, string> = accessToken
              ? { Authorization: ['Bearer', accessToken].join(' ') }
              : {};

            let dbIsOnboarded = false;
            try {
              const apiUrl = envConfig.API_URL || '/api/proxy';
              const resp = await fetch(`${apiUrl}/user?userId=${user.id}`, {
                headers: authHeaders,
              });
              if (resp.ok) {
                const json = await resp.json();
                dbIsOnboarded = json?.data?.isOnboarded === true;
              }
            } catch {
              // fallback to same-origin proxy
              try {
                const resp = await fetch(`/api/proxy/user?userId=${user.id}`, {
                  headers: authHeaders,
                });
                if (resp.ok) {
                  const json = await resp.json();
                  dbIsOnboarded = json?.data?.isOnboarded === true;
                }
              } catch {
                // ignore
              }
            }

            if (dbIsOnboarded) {
              setIsSyncingSession(true);
              try {
                if (typeof updateSession === 'function') {
                  await updateSession();
                }
              } finally {
                setIsSyncingSession(false);
              }
              const redirectTo = getRedirectUrl();
              router.push(redirectTo);
              return;
            }
          } catch {
            // ignore
          }
        }
        return;
      }

      // If user is not on the onboarding page and session says not onboarded
      if (!isOnboarded) {
        try {
          if (user?.id) {
            // The `/user?userId=...` endpoint is protected by
            // `withUserAuth({ ownerRequired: true })` in the API. Without an
            // Authorization header carrying the access token the request
            // returns 401, `json?.data?.isOnboarded` becomes undefined, and
            // the code falls through to the external-onboarding redirect
            // below — so a user who has just completed onboarding gets
            // bounced right back to Step 1 (0%) instead of landing on the
            // intended page.
            const accessToken = getAccessToken();
            // NOTE: intentional array-join instead of a template literal
            const authHeaders: Record<string, string> = accessToken
              ? { Authorization: ['Bearer', accessToken].join(' ') }
              : {};

            let dbIsOnboarded = false;
            try {
              const apiUrl = envConfig.API_URL || '/api/proxy';
              const resp = await fetch(`${apiUrl}/user?userId=${user.id}`, {
                headers: authHeaders,
              });
              if (resp.ok) {
                const json = await resp.json();
                dbIsOnboarded = json?.data?.isOnboarded === true;
              }
            } catch {
              // fallback to same-origin proxy
              try {
                const resp = await fetch(`/api/proxy/user?userId=${user.id}`, {
                  headers: authHeaders,
                });
                if (resp.ok) {
                  const json = await resp.json();
                  dbIsOnboarded = json?.data?.isOnboarded === true;
                }
              } catch {
                // ignore
              }
            }

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
          const redirectTarget =
            router.pathname === routes.onboarding ||
            router.pathname === routes.login ||
            router.pathname === routes.home
              ? `${window.location.origin}${routes.learn}`
              : window.location.href;

          const params = new URLSearchParams({
            userId: user?.id || '',
            email: user?.email || '',
            productId: 'platform',
            from: 'webapp',
            redirect: redirectTarget,
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
