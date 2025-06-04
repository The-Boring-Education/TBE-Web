import { signIn } from 'next-auth/react';
import { useSession } from 'next-auth/react';

import { useAnalytics } from '@/hooks';

import type { LoginWithGoogleBtnProps } from '@/interfaces';

import Button from './Button';

const LoginWithGoogleButton = ({ text = 'Login' }: LoginWithGoogleBtnProps) => {
  const session = useSession();
  const { trackEvent } = useAnalytics();

  if (session.status === 'authenticated' || session.status === 'loading')
    return <></>;

  return (
    <Button
      text={text}
      variant='PRIMARY'
      onClick={() => {
        trackEvent({
          action: 'USER_LOGIN',
          category: 'User',
          label: 'User Logged In',
        });

        signIn('google');
      }}
    />
  );
};

export default LoginWithGoogleButton;
