import { envConfig } from '@tbe/constants';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const unskilledUrl = envConfig.UNSKILLED_API_URL;
  if (!unskilledUrl) {
    return res
      .status(503)
      .json({ error: 'Unskilled API URL is not configured' });
  }

  try {
    const upstream = await fetch(`${unskilledUrl}/graph`);

    if (!upstream.ok) {
      const text = await upstream.text();
      console.error('Upstream graph error:', upstream.status, text);
      return res
        .status(upstream.status)
        .json({ error: 'Failed to fetch graph data from upstream service' });
    }

    const data = await upstream.json();
    return res.status(200).json(data);
  } catch (error: any) {
    console.error('Graph proxy error:', error);
    return res.status(502).json({
      error: 'Unable to reach the Unskilled API service',
      message: error.message,
    });
  }
}
