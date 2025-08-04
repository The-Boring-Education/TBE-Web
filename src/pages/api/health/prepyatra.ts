import type { NextApiRequest, NextApiResponse } from 'next';

import { envConfig } from '@/constant/envConfig';

interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy' | 'unknown';
  service: string;
  timestamp: string;
  responseTime?: number;
  url: string;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<HealthCheckResponse>
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({
      status: 'unhealthy',
      service: 'prepyatra',
      timestamp: new Date().toISOString(),
      url: envConfig.PREPYATRA_APP_URL || 'not-configured',
      error: 'Method not allowed',
    });
  }

  const startTime = Date.now();
  const prepyatraUrl = envConfig.PREPYATRA_APP_URL;

  if (!prepyatraUrl) {
    return res.status(500).json({
      status: 'unhealthy',
      service: 'prepyatra',
      timestamp: new Date().toISOString(),
      url: 'not-configured',
      error: 'PREPYATRA_APP_URL environment variable not configured',
    });
  }

  try {
    // Try to fetch the health endpoint or root of the service
    const healthUrl = `${prepyatraUrl}/api/health`;
    const fallbackUrl = prepyatraUrl;

    let response;
    try {
      // First try the dedicated health endpoint
      response = await fetch(healthUrl, {
        method: 'GET',
        timeout: 10000, // 10 second timeout
        headers: {
          'User-Agent': 'TBE-Health-Check/1.0',
        },
      } as RequestInit);
    } catch (healthError) {
      // If health endpoint fails, try the root URL
      response = await fetch(fallbackUrl, {
        method: 'GET',
        timeout: 10000,
        headers: {
          'User-Agent': 'TBE-Health-Check/1.0',
        },
      } as RequestInit);
    }

    const responseTime = Date.now() - startTime;

    if (response.ok) {
      res.status(200).json({
        status: 'healthy',
        service: 'prepyatra',
        timestamp: new Date().toISOString(),
        responseTime,
        url: prepyatraUrl,
      });
    } else {
      res.status(503).json({
        status: 'unhealthy',
        service: 'prepyatra',
        timestamp: new Date().toISOString(),
        responseTime,
        url: prepyatraUrl,
        error: `HTTP ${response.status}: ${response.statusText}`,
      });
    }
  } catch (error) {
    const responseTime = Date.now() - startTime;
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';

    res.status(503).json({
      status: 'unhealthy',
      service: 'prepyatra',
      timestamp: new Date().toISOString(),
      responseTime,
      url: prepyatraUrl,
      error: errorMessage,
    });
  }
}
