/**
 * Environment variable validation and fallback utility
 * Ensures proper configuration for reverse proxy setup
 */

export interface EnvironmentConfig {
  prepyatraUrl: string;
  quizUrl: string;
  onboardingUrl: string;
  isProduction: boolean;
  isDevelopment: boolean;
}

/**
 * Validate and get environment configuration with proper fallbacks
 */
export const getEnvironmentConfig = (): EnvironmentConfig => {
  const isProduction = process.env.NODE_ENV === 'production';
  const isDevelopment = process.env.NODE_ENV === 'development';

  // Define fallback URLs for different environments
  const fallbacks = {
    production: {
      prepyatra: 'https://prepyatra.theboringeducation.com',
      quiz: 'https://quiz.theboringeducation.com',
      onboarding: 'https://onboarding.theboringeducation.com',
    },
    development: {
      prepyatra: 'https://prep-yatra-git-development-tbe.vercel.app',
      quiz: 'https://the-boring-quizes-git-development-tbe.vercel.app',
      onboarding:
        'https://the-boring-onboarding-git-development-tbe.vercel.app',
    },
    local: {
      prepyatra: 'http://localhost:5173',
      quiz: 'http://localhost:5174',
      onboarding: 'http://localhost:5175',
    },
  };

  const environmentFallbacks = isProduction
    ? fallbacks.production
    : isDevelopment
    ? fallbacks.development
    : fallbacks.local;

  // Get URLs with fallbacks
  const prepyatraUrl =
    process.env.PREPYATRA_APP_URL || environmentFallbacks.prepyatra;
  const quizUrl = process.env.QUIZ_APP_URL || environmentFallbacks.quiz;
  const onboardingUrl =
    process.env.NEXT_PUBLIC_ONBOARDING_APP_URL ||
    environmentFallbacks.onboarding;

  // Validate URLs
  const validateUrl = (url: string, serviceName: string): string => {
    if (!url || url === 'undefined' || url === 'null') {
      console.warn(
        `⚠️  ${serviceName} URL not configured, using fallback: ${
          environmentFallbacks[
            serviceName.toLowerCase() as keyof typeof environmentFallbacks
          ]
        }`
      );
      return environmentFallbacks[
        serviceName.toLowerCase() as keyof typeof environmentFallbacks
      ];
    }

    // Basic URL validation
    try {
      new URL(url);
      return url;
    } catch (error) {
      console.error(`❌ Invalid ${serviceName} URL: ${url}, using fallback`);
      return environmentFallbacks[
        serviceName.toLowerCase() as keyof typeof environmentFallbacks
      ];
    }
  };

  return {
    prepyatraUrl: validateUrl(prepyatraUrl, 'prepyatra'),
    quizUrl: validateUrl(quizUrl, 'quiz'),
    onboardingUrl: validateUrl(onboardingUrl, 'onboarding'),
    isProduction,
    isDevelopment,
  };
};

/**
 * Log environment configuration for debugging
 */
export const logEnvironmentConfig = (): void => {
  const config = getEnvironmentConfig();

  if (process.env.NODE_ENV !== 'production') {
    console.log('🔧 Reverse Proxy Configuration:');
    console.log(`   Environment: ${process.env.NODE_ENV}`);
    console.log(`   PrepYatra: ${config.prepyatraUrl}`);
    console.log(`   Quizzes: ${config.quizUrl}`);
    console.log(`   Onboarding: ${config.onboardingUrl}`);
  }
};

/**
 * Check if all required environment variables are set
 */
export const validateEnvironmentVariables = (): {
  isValid: boolean;
  missingVars: string[];
  warnings: string[];
} => {
  const requiredVars = [
    'PREPYATRA_APP_URL',
    'QUIZ_APP_URL',
    'NEXT_PUBLIC_ONBOARDING_APP_URL',
  ];

  const missingVars: string[] = [];
  const warnings: string[] = [];

  requiredVars.forEach((varName) => {
    const value = process.env[varName];
    if (!value || value === 'undefined' || value === 'null') {
      missingVars.push(varName);
    } else {
      try {
        new URL(value);
      } catch (error) {
        warnings.push(`${varName} contains invalid URL: ${value}`);
      }
    }
  });

  return {
    isValid: missingVars.length === 0 && warnings.length === 0,
    missingVars,
    warnings,
  };
};
