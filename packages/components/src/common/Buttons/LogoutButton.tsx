import { signOut, useSession } from 'next-auth/react';

import Button from './Button';

const LogoutButton = () => {
  const session = useSession();
  if (session.status === 'unauthenticated') return <></>;
  return (
    <Button
      className='w-full'
      text='Log out'
      variant='GHOST'
      onClick={() => {
        signOut();
      }}
    />
  );
};

export default LogoutButton;
