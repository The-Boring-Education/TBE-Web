import { useQueryClient } from "@tbe/query";
import type { APIMakeRequestProps, APIResponseType } from "@tbe/types";
import { sendRequest } from "@tbe/utils";
import { useEffect, useState } from "react";

/**
 * @deprecated Migrate to `createQuery` / `useQuery` from `@tbe/query` instead.
 * This hook exists for backward compatibility during the migration period.
 */
const useApi = (
  queryKey: string,
  initialParams?: APIMakeRequestProps,
  options = { enabled: !!initialParams },
) => {
  const queryClient = useQueryClient();
  const [data, setData] = useState<APIResponseType | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFunction = async (params: APIMakeRequestProps) => {
    setLoading(true);
    setError(null);
    try {
      const response = await sendRequest(params);
      setData(response as APIResponseType);
      return response;
    } catch (error: any) {
      setError(error.message);
      throw new Error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const makeRequest = (overrideParams?: APIMakeRequestProps) => {
    const params = overrideParams || initialParams;
    if (!params) {
      throw new Error("Params are required to make a request.");
    }
    return queryClient.fetchQuery({
      queryKey: [queryKey, params],
      queryFn: () => fetchFunction(params),
    });
  };

  useEffect(() => {
    if (options.enabled && initialParams) {
      makeRequest(initialParams);
    }
  }, [options.enabled]);

  return {
    response: data,
    isSuccess: !!data,
    error,
    loading,
    makeRequest,
  };
};

export default useApi;
