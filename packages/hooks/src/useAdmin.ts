import { useAuth } from "@tbe/auth";
import { routes } from "@tbe/constants";
import { useCallback, useState } from "react";

const ADMIN_EMAIL = "theboringeducation@gmail.com";

export const useAdmin = () => {
  const { user, isLoading } = useAuth();

  return {
    isAdmin: user?.email === ADMIN_EMAIL,
    isLoading,
    user,
  };
};

export const useAdminData = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(
    async (endpoint: string, params?: Record<string, any>) => {
      setLoading(true);
      setError(null);

      try {
        const baseUrl = routes.api.base || "http://localhost:3000/api/v1";
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
          // Fallback for invalid URLs (e.g., during SSG/build time)
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

        const response = await fetch(fullUrl);
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
    (endpoint: string, params?: Record<string, any>) => {
      fetchData(endpoint, params);
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
