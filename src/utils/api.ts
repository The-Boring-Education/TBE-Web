import { APIMakeRquestProps, APIResponseType } from '@/interfaces';
import axios, { AxiosRequestConfig } from 'axios';
import { NextApiResponse } from 'next';

const apiInstance = axios.create();

const sendRequest = async ({
  method = 'GET',
  url,
  headers,
  body,
}: APIMakeRquestProps): Promise<APIResponseType> => {
  const config: AxiosRequestConfig = {
    method,
    url: `/api/v1${url}`,
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

const sendAPIResponse = ({ status, error, message, data }: APIResponseType) => {
  return { status, error, message, data };
};

const applyCorsHeaders = (res: NextApiResponse, url: string) => {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', url);
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET,POST,DELETE,PATCH,OPTIONS'
  );
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type,Authorization,x-admin-secret'
  );
};

export { sendRequest, sendAPIResponse, applyCorsHeaders };
