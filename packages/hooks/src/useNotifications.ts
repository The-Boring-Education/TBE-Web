import { routes } from "@tbe/constants";
import type { NotificationItemProps } from "@tbe/interface";
import { useEffect, useState } from "react";

import useApi from "./useApi";

const useNotifications = ({ enabled = true }: { enabled?: boolean } = {}) => {
  const [notifications, setNotifications] = useState<NotificationItemProps[]>(
    [],
  );
  const [loading, setLoading] = useState(enabled);
  const { makeRequest } = useApi("notifications");

  useEffect(() => {
    if (!enabled) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    makeRequest({
      method: "GET",
      url: routes.api.notification,
    })
      .then((response) => {
        setNotifications(response.data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [enabled]);

  return { notifications, loading };
};

export default useNotifications;
