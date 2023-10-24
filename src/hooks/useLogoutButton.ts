import { useEffect, useState } from 'react';
import { useUser } from '.';

const useLogoutButton = () => {
  const { user } = useUser({});
  const [showLogoutButton, setShowLogoutButton] = useState<boolean>(false);

  useEffect(() => {
    if (user) setShowLogoutButton(true);
  }, [user]);

  return { showLogoutButton };
};
export default useLogoutButton;
