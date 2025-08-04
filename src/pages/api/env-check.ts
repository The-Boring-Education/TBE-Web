import type { NextApiRequest, NextApiResponse } from 'next';

import {
  getEnvironmentConfig,
  validateEnvironmentVariables,
} from '@/utils/env-validation';

interface EnvironmentCheckResponse {
  environment: string;
  isValid: boolean;
  config: {
    prepyatraUrl: string;
    quizUrl: string;
    onboardingUrl: string;
  };
  validation: {
    missingVars: string[];
    warnings: string[];
  };
  timestamp: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<EnvironmentCheckResponse>
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end();
  }

  // Only allow in non-production environments for security
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({
      environment: 'production',
      isValid: false,
      config: {
        prepyatraUrl: '[HIDDEN]',
        quizUrl: '[HIDDEN]',
        onboardingUrl: '[HIDDEN]',
      },
      validation: {
        missingVars: [],
        warnings: ['Environment check disabled in production'],
      },
      timestamp: new Date().toISOString(),
    });
  }

  try {
    const config = getEnvironmentConfig();
    const validation = validateEnvironmentVariables();

    const response: EnvironmentCheckResponse = {
      environment: process.env.NODE_ENV || 'unknown',
      isValid: validation.isValid,
      config: {
        prepyatraUrl: config.prepyatraUrl,
        quizUrl: config.quizUrl,
        onboardingUrl: config.onboardingUrl,
      },
      validation: {
        missingVars: validation.missingVars,
        warnings: validation.warnings,
      },
      timestamp: new Date().toISOString(),
    };

    // Set appropriate status code
    const statusCode = validation.isValid ? 200 : 422;

    res.status(statusCode).json(response);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';

    res.status(500).json({
      environment: process.env.NODE_ENV || 'unknown',
      isValid: false,
      config: {
        prepyatraUrl: 'error',
        quizUrl: 'error',
        onboardingUrl: 'error',
      },
      validation: {
        missingVars: [],
        warnings: [`Error checking environment: ${errorMessage}`],
      },
      timestamp: new Date().toISOString(),
    });
  }
}
