import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';

import { Button } from '@tbe/components';
import type { LoginRedirectButtonProps } from '@tbe/interface';
import { trackEvent } from '@tbe/utils';

const LoginRedirectButton = ({
  text = 'Login to Start',
  className = '',
}: LoginRedirectButtonProps) => {
  const router = useRouter();
  const { status } = useSession();

  // Determine the correct auth route based on current pathname
  // Prep-yatra uses /auth, platform uses /login
  const getAuthRoute = () => {
    // Check if we're in prep-yatra app (has /auth route)
    if (router.pathname === '/auth' || router.pathname.startsWith('/dashboard') || router.pathname.startsWith('/pricing') || router.pathname.startsWith('/journey')) {
      return '/auth';
    }
    // Default to /login for platform app
    return '/login';
  };

  const handleLoginRedirect = () => {
    if (status === 'unauthenticated') {
      try {
        trackEvent('login_redirect_click', {
          category: 'auth',
          label: 'Login Redirect',
        });
      } catch {
        /* ignore analytics errors */
      }
      const authRoute = getAuthRoute();
      const redirectParam = authRoute === '/auth' ? 'callbackUrl' : 'redirect';
      router.push(`${authRoute}?${redirectParam}=${encodeURIComponent(router.asPath)}`);
    }
  };

  const authRoute = getAuthRoute();
  if (status === 'authenticated' || router.pathname === '/login' || router.pathname === '/auth') {
    return null;
  }

  return (
    <Button
      className={className}
      text={text}
      variant='PRIMARY'
      onClick={handleLoginRedirect}
    />
  );
};

export default LoginRedirectButton;
