import { useRouter } from 'next/router';
import { useApi } from '.';
import { useEffect } from 'react';
import { removeLocalStorageItem } from '@/utils';
import { apiUrls, localStorageKeys, routes } from '@/constant';

const useAdmin = (email: string | undefined) => {
  const router = useRouter();
  const { loading, error, makeRequest } = useApi();

  useEffect(() => {
    if (!email) return;

    makeRequest({
      method: 'GET',
      url: apiUrls.validateAdminByEmail(email),
    });
  }, [email]);

  if (error) {
    removeLocalStorageItem(localStorageKeys.USER);
    router.replace(routes.admin.base);
  }

  return { loading, error };
};

export default useAdmin;
