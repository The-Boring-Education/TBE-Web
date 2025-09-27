import axios, { type AxiosRequestConfig } from 'axios';

import type { APIMakeRquestProps, APIResponseType } from '@/interfaces';
import { routes } from '@tbe/constants';

const apiInstance = axios.create();

const sendRequest = async ({
  method = 'GET',
  url,
  headers,
  body,
}: APIMakeRquestProps): Promise<APIResponseType> => {
  const config: AxiosRequestConfig = {
    method,
    url: `${routes.api.base}${url}`,
    headers: {
      ...headers,
      cache: 'no-store',
    },
    data: body,
  };

  try {
    const response = await apiInstance.request(config);
    return response.data as APIResponseType;
  } catch (error: any) {
    return error.response.data as APIResponseType;
  }
};

const sendAPIResponse = ({
  status,
  error,
  message,
  data,
}: APIResponseType) => ({ status, error, message, data });



export {
  sendAPIResponse,
  sendRequest,
};
