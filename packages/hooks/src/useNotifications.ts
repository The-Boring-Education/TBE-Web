import { useEffect, useState } from 'react';

import { routes } from '@tbe/constants';
import type { NotificationItemProps } from '@tbe/interface';

import useApi from './useApi';

const useNotifications = () => {
  const [notifications, setNotifications] = useState<NotificationItemProps[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const { makeRequest } = useApi('notifications');

  useEffect(() => {
    makeRequest({
      method: 'GET',
      url: routes.api.notification,
    })
      .then((response) => {
        setNotifications(response.data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  return { notifications, loading };
};

export default useNotifications;
