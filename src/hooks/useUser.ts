import { localStorageKeys } from '@/constant';
import { NextAuthUserType, UseUserProps } from '@/interfaces';
import {
  getUserFromLocalStorage,
  removeLocalStorageItem,
  setUserInLocalStorage,
} from '@/utils';
import { getSession, useSession } from 'next-auth/react';
import { useEffect } from 'react';

const useUser = ({ userType }: UseUserProps) => {
  const { status } = useSession();

  const userData = getUserFromLocalStorage(localStorageKeys.USER);

  useEffect(() => {
    const checkAuth = async () => {
      const session = await getSession();
      if (session && userType) {
        const { user } = session;
        setUserInLocalStorage(
          localStorageKeys.USER,
          user as NextAuthUserType,
          userType
        );
      } else {
        removeLocalStorageItem(localStorageKeys.USER);
      }
    };

    if (!userData) checkAuth();
  }, []);

  return {
    user: userData?.user,
    type: userData?.type,
    isLoading: status === 'loading',
    isUnauthenticated: !userData,
  };
};

export default useUser;
