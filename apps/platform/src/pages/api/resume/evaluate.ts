import { envConfig } from '@tbe/constants';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ status: false, message: 'Method not allowed' });
  }

  const unskilledUrl = envConfig.UNSKILLED_API_URL;
  if (!unskilledUrl) {
    return res.status(503).json({
      status: false,
      message: 'Evaluation service is not configured',
    });
  }

  try {
    const upstream = await fetch(`${unskilledUrl}/resume/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });

    const contentType = upstream.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      const text = await upstream.text();
      console.error('Non-JSON response from unskilled backend:', text);
      return res.status(502).json({
        status: false,
        message: 'Evaluation service returned an unexpected response. Please try again later.',
      });
    }

    const data = await upstream.json();
    return res.status(upstream.status).json(data);
  } catch (error: any) {
    console.error('Resume evaluation proxy error:', error);
    return res.status(502).json({
      status: false,
      message: 'Unable to reach the evaluation service. Please try again later.',
    });
  }
}
