import { useSession } from 'next-auth/react';
import { useCallback, useEffect, useState } from 'react';

const ADMIN_EMAIL = 'theboringeducation@gmail.com';

export const useAdmin = () => {
  const sessionResult = useSession();
  const { data: session, status } = sessionResult || { data: null, status: 'loading' };
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;

    const adminStatus = session?.user?.email === ADMIN_EMAIL;
    setIsAdmin(adminStatus);
    setIsLoading(false);
  }, [session, status]);

  return {
    isAdmin,
    isLoading,
    user: session?.user,
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
        const url = new URL(endpoint, window.location.origin);
        if (params) {
          Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              url.searchParams.append(key, value.toString());
            }
          });
        }

        const response = await fetch(url.toString());
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || 'Failed to fetch data');
        }

        setData(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const refetch = useCallback(
    (endpoint: string, params?: Record<string, any>) => {
      fetchData(endpoint, params);
    },
    [fetchData]
  );

  return {
    data,
    loading,
    error,
    fetchData,
    refetch,
  };
};
