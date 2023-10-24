import { useLogoutButton } from '@/hooks';
import Button from './Button';
import { removeLocalStorageItem } from '@/utils';
import { localStorageKeys, routes } from '@/constant';
import { useRouter } from 'next/router';

const LogoutButton = () => {
  const router = useRouter();
  const { showLogoutButton } = useLogoutButton();

  const logOutUser = () => {
    removeLocalStorageItem(localStorageKeys.USER);
    router.push(routes.home);
  };

  if (!showLogoutButton) return <></>;

  return (
    <Button
      variant='GHOST'
      text='Log out'
      className='w-fit'
      onClick={logOutUser}
    />
  );
};

export default LogoutButton;
