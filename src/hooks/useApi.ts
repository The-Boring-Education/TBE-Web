import { useEffect, useState } from 'react';
import { sendRequest } from '@/utils';
import {
  APIMakeRquestProps,
  APIResponseProps,
  ApiHookResultProps,
} from '@/interfaces';

const useApi = (params?: APIMakeRquestProps): ApiHookResultProps => {
  const [data, setData] = useState<APIResponseProps>();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<APIResponseProps | string | null>();

  const makeRequest = async ({
    method,
    url,
    headers,
    body,
  }: APIMakeRquestProps): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const response: APIResponseProps = await sendRequest({
        method,
        url,
        headers,
        body,
      });

      if (response.status) setData(response as APIResponseProps);
      else setError(response.message);
    } catch (err: any) {
      setError(err.response.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      if (params) {
        try {
          await makeRequest(params);
        } catch (error: any) {
          setError(error?.message);
        }
      }
    };

    init();
  }, []);

  return {
    data: data,
    isSuccess: !!data,
    error: error,
    loading,
    makeRequest,
  };
};

export default useApi;
