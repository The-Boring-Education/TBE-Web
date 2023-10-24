import { APIMakeRquestProps, APIResponseType } from '@/interfaces';
import axios, { AxiosRequestConfig } from 'axios';

const apiInstance = axios.create();

const sendRequest = async ({
  method = 'GET',
  url,
  headers,
  body,
}: APIMakeRquestProps): Promise<APIResponseType> => {
  const config: AxiosRequestConfig = {
    method,
    url: `/api${url}`,
    headers: {
      ...headers,
      cache: 'no-store',
    },
    data: body,
  };

  try {
    const response = (await apiInstance.request(config)).data;

    return response;
  } catch (error: any) {
    return error.response.data;
  }
};

const sendAPIResponse = ({ status, error, message, data }: APIResponseType) => {
  return { status, error, message, data };
};

export { sendRequest, sendAPIResponse };
