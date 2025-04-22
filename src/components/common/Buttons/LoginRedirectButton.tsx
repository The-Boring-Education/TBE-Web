import { useRouter } from 'next/router';
import { Button } from '@/components';
import { LoginRedirectButtonProps } from '@/interfaces';
import { useSession } from 'next-auth/react';

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
      variant='PRIMARY'
      text={text}
      onClick={handleLoginRedirect}
      className={className}
    />
  );
};

export default LoginRedirectButton;
