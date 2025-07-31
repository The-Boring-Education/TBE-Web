import axios, { type AxiosRequestConfig } from 'axios';
import type { NextApiRequest, NextApiResponse } from 'next';

import { envConfig } from '@/constant';
import type { APIMakeRquestProps, APIResponseType } from '@/interfaces';

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

const sendAPIResponse = ({
  status,
  error,
  message,
  data,
}: APIResponseType) => ({ status, error, message, data });

const applyCorsHeaders = (res: NextApiResponse, req: NextApiRequest) => {
  const origin = req.headers.origin;
  const allowedOrigins = [
    envConfig.PREPYATRA_APP_URL,
    envConfig.ONBOARDING_APP_URL,
    envConfig.QUIZES_APP_URL,
    envConfig.ADMIN_BASE_URL,
  ].filter(Boolean);

  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET,POST,PUT,DELETE,PATCH,OPTIONS'
  );
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type,Authorization,x-admin-secret'
  );
};

export { applyCorsHeaders, sendAPIResponse, sendRequest };
