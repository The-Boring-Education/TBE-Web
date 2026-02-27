import axios from 'axios';
import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * Proxy API route to forward requests to the actual API server
 * This eliminates CORS issues by making all API calls from the same origin
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Get the API URL from environment
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3004/api/v1';

  try {
    // Extract the path from the catch-all route
    const { path } = req.query;
    const apiPath = Array.isArray(path) ? path.join('/') : path || '';

    // Construct the full URL
    const url = `${apiUrl}/${apiPath}`;
    
    // Forward the request
    const response = await axios({
      method: req.method as any,
      url,
      headers: {
        ...req.headers,
        host: undefined,
        authorization: req.headers.authorization,
        'x-admin-secret': req.headers['x-admin-secret'],
      },
      data: req.body,
      params: { ...req.query, path: undefined }, // Remove path from query params
      validateStatus: () => true,
    });

    res.status(response.status).json(response.data);
  } catch (error: any) {
    console.error('Proxy error:', error);
    res.status(500).json({
      error: 'Proxy error',
      message: error.message,
    });
  }
}
