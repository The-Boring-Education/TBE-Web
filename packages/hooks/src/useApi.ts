import { useEffect, useState } from 'react';
import { useQueryClient } from 'react-query';

import type { APIMakeRequestProps, APIResponseType } from '@tbe/types';
import { sendRequest } from '@tbe/utils';

const useApi = (
  queryKey: string,
  initialParams?: APIMakeRequestProps,
  options = { enabled: !!initialParams }
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
      setData(response);
      return response;
    } catch (error: any) {
      setError(error.message);
      throw new Error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Custom function to refetch with optional new params
  const makeRequest = (overrideParams?: APIMakeRquestProps) => {
    const params = overrideParams || initialParams;
    if (!params) {
      throw new Error('Params are required to make a request.');
    }
    return queryClient.fetchQuery([queryKey, params], () =>
      fetchFunction(params)
    );
  };

  // Effect to trigger the API call on initial render if enabled
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
