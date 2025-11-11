import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { envConfig } from '@tbe/constants';

/**
 * Proxy API route to forward requests to the actual API server
 * This eliminates CORS issues by making all API calls from the same origin
 *
 * Usage: Instead of calling https://api.example.com/api/v1/users
 * Call: /api/proxy/v1/users
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Get the API URL from environment
  const apiUrl = envConfig.API_URL || process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    return res.status(500).json({
      error: 'API URL not configured',
      message: 'Please set NEXT_PUBLIC_API_URL environment variable',
    });
  }

  try {
    // Extract the path from the catch-all route
    const { path } = req.query;
    const apiPath = Array.isArray(path) ? path.join('/') : path || '';

    // Construct the full URL
    const url = `${apiUrl}/${apiPath}`;
    console.log('url', url);

    // Forward the request
    const response = await axios({
      method: req.method as any,
      url,
      headers: {
        ...req.headers,
        // Remove host header to avoid issues
        host: undefined,
        // Forward any auth headers
        authorization: req.headers.authorization,
        'x-admin-secret': req.headers['x-admin-secret'],
      },
      data: req.body,
      params: req.query,
      // Don't throw on error status codes
      validateStatus: () => true,
    });

    // Forward the response
    res.status(response.status).json(response.data);
  } catch (error: any) {
    console.error('Proxy error:', error);
    res.status(500).json({
      error: 'Proxy error',
      message: error.message,
    });
  }
}
