import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';

import { Button } from '@/components';
import type { LoginRedirectButtonProps } from '@/interfaces';

const LoginRedirectButton = ({
  text = 'Login to Start',
  className = '',
}: LoginRedirectButtonProps) => {
  const router = useRouter();
  const { status } = useSession();

  const handleLoginRedirect = () => {
    if (status === 'unauthenticated') {
      router.push(`/login?redirect=${encodeURIComponent(router.asPath)}`);
    }
  };

  if (status === 'authenticated' || router.pathname === '/login') {
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
