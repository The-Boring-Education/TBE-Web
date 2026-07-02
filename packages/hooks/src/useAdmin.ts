import { getAuthApiUrl, useAuth } from "@tbe/auth";
import { routes } from "@tbe/constants";
import type { AdminMeResponse, AdminUser } from "@tbe/types";
import { useCallback, useEffect, useRef, useState } from "react";

const ADMIN_ME_STALE_MS = 3 * 60 * 1000;

const getAdminApiBaseUrl = (): string =>
  getAuthApiUrl() || routes.api.base || "http://localhost:3004/api/v1";

const getAccessTokenFromCookie = (): string | null => {
  if (typeof document === "undefined") {
    return null;
  }
  return document.cookie.match(/(?:^|; )tbe_access_token=([^;]+)/)?.[1] ?? null;
};

const fetchAdminMe = async (): Promise<AdminMeResponse> => {
  const baseUrl = getAdminApiBaseUrl();
  const token = getAccessTokenFromCookie();

  const response = await fetch(`${baseUrl}/admin/me`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to fetch admin status");
  }

  return (result.data ?? { isAdmin: false }) as AdminMeResponse;
};

export const useAdmin = () => {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [admin, setAdmin] = useState<AdminUser | undefined>();
  const [isAdminLoading, setIsAdminLoading] = useState(false);
  const lastFetchedAt = useRef(0);

  const loadAdminStatus = useCallback(
    async (force = false) => {
      if (!user?.email) {
        setIsAdmin(false);
        setAdmin(undefined);
        return;
      }

      const isStale = Date.now() - lastFetchedAt.current > ADMIN_ME_STALE_MS;
      if (!force && !isStale && lastFetchedAt.current > 0) {
        return;
      }

      setIsAdminLoading(true);
      try {
        const data = await fetchAdminMe();
        setIsAdmin(Boolean(data.isAdmin));
        setAdmin(data.admin);
        lastFetchedAt.current = Date.now();
      } catch {
        setIsAdmin(false);
        setAdmin(undefined);
      } finally {
        setIsAdminLoading(false);
      }
    },
    [user?.email],
  );

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    if (!user?.email) {
      setIsAdmin(false);
      setAdmin(undefined);
      lastFetchedAt.current = 0;
      return;
    }

    void loadAdminStatus(true);
  }, [isAuthLoading, user?.email, loadAdminStatus]);

  return {
    isAdmin,
    isLoading: isAuthLoading || isAdminLoading,
    user,
    admin,
    refetchAdminStatus: () => loadAdminStatus(true),
  };
};

export const useAdminData = () => {
  const [data, setData] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(
    async (
      endpoint: string,
      params?: Record<string, string | number | boolean>,
    ) => {
      setLoading(true);
      setError(null);

      try {
        const baseUrl = getAdminApiBaseUrl();
        let fullUrl: string;

        try {
          const url = new URL(endpoint, baseUrl);
          if (params) {
            Object.entries(params).forEach(([key, value]) => {
              if (value !== undefined && value !== null) {
                url.searchParams.append(key, value.toString());
              }
            });
          }
          fullUrl = url.toString();
        } catch {
          const queryString = params
            ? "?" +
              Object.entries(params)
                .filter(([, value]) => value !== undefined && value !== null)
                .map(
                  ([key, value]) =>
                    `${encodeURIComponent(key)}=${encodeURIComponent(value.toString())}`,
                )
                .join("&")
            : "";
          fullUrl = `${baseUrl}${endpoint}${queryString}`;
        }

        const token = getAccessTokenFromCookie();

        const response = await fetch(fullUrl, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Failed to fetch data");
        }

        setData(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const refetch = useCallback(
    (endpoint: string, params?: Record<string, string | number | boolean>) => {
      void fetchData(endpoint, params);
    },
    [fetchData],
  );

  return {
    data,
    loading,
    error,
    fetchData,
    refetch,
  };
};
