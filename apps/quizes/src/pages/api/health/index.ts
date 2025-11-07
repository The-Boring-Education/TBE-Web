import type { NextApiRequest, NextApiResponse } from 'next';

import type { EnvHealthResponse, EnvVarCheck } from '@tbe/utils';
import { buildEnvHealthResponse } from '@tbe/utils';

const envChecks: EnvVarCheck[] = [
    { name: 'NEXTAUTH_SECRET' },
    { name: 'NEXTAUTH_URL' },
    { name: 'NEXT_PUBLIC_API_URL' },
    { name: 'GOOGLE_AUTH_CLIENT_ID' },
    { name: 'GOOGLE_AUTH_CLIENT_SECRET' },
    { name: 'NEXT_PUBLIC_ONBOARDING_URL' },
    { name: 'NEXT_PUBLIC_GA_MEASUREMENT_ID' },
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

