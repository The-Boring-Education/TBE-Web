import type { EnvHealthResponse, EnvVarCheck } from '@tbe/utils';
import { buildEnvHealthResponse } from '@tbe/utils';
import type { NextApiRequest, NextApiResponse } from 'next';

const envChecks: EnvVarCheck[] = [
  // Authentication & core URLs (required)
  { name: 'NEXTAUTH_SECRET' },
  { name: 'NEXTAUTH_URL' },
  { name: 'NEXT_PUBLIC_API_URL' },
  { name: 'GOOGLE_AUTH_CLIENT_ID' },
  { name: 'GOOGLE_AUTH_CLIENT_SECRET' },

  // Database & admin
  { name: 'MONGODB_URI' },
  { name: 'ADMIN_SECRET' },
  { name: 'ADMIN_BASE_URL' },

  // App URLs
  { name: 'NEXT_PUBLIC_PLATFORM_URL', optional: true },
  { name: 'NEXT_PUBLIC_PREPYATRA_URL', optional: true },
  { name: 'NEXT_PUBLIC_QUIZES_URL', optional: true },
  { name: 'NEXT_PUBLIC_ONBOARDING_APP_URL', optional: true },

  // External APIs / AI integrations
  { name: 'OPENAI_API_KEY', optional: true },
  { name: 'YOUTUBE_API_KEY', optional: true },

  // Payment gateway
  { name: 'NEXT_PUBLIC_CASHFREE_MODE', optional: true },
  { name: 'CASHFREE_BASE_URL', optional: true },
  { name: 'CASHFREE_CLIENT_ID', optional: true },
  { name: 'CASHFREE_SECRET_KEY', optional: true },

  // Monitoring & analytics
  { name: 'NEXT_PUBLIC_ANALYTICS_ID', optional: true },
  { name: 'NEXT_PUBLIC_SENTRY_DSN', optional: true },
  { name: 'SENTRY_AUTH_TOKEN', optional: true },

  // Email service (Chitthi). Legacy EMAIL_* names remain optional so older
  // deployments continue to pass the health check while migrating.
  { name: 'CHITTHI_URL', optional: true },
  { name: 'CHITTHI_API_KEY', optional: true },
  { name: 'CHITTHI_FROM_EMAIL', optional: true },
  { name: 'EMAIL_SERVICE_URL', optional: true },
  { name: 'EMAIL_API_KEY', optional: true },
  { name: 'FROM_EMAIL', optional: true },

  // Environment flag
  { name: 'NODE_ENV', optional: true },
];

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<EnvHealthResponse>,
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end();
  }

  const { httpStatus, report } = buildEnvHealthResponse(envChecks, {
    serviceName: 'environment',
  });

  return res.status(httpStatus).json(report);
}
