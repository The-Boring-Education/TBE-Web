import { getEnvironmentConfig } from './env-validation';

/**
 * Configuration for reverse proxy environments
 */
export interface ProxyEnvironmentConfig {
  prepyatra: string;
  quiz: string;
  onboarding: string;
}

/**
 * Get environment-specific URLs for reverse proxy
 */
export const getProxyUrls = (): ProxyEnvironmentConfig => {
  const envConfig = getEnvironmentConfig();

  return {
    prepyatra: envConfig.prepyatraUrl,
    quiz: envConfig.quizUrl,
    onboarding: envConfig.onboardingUrl,
  };
};

/**
 * Generate SEO metadata for embedded products
 */
export const generateProductSEO = (
  product: 'prepyatra' | 'quiz' | 'onboarding',
  path = ''
) => {
  const baseUrl = 'https://theboringeducation.com';

  const seoConfigs = {
    prepyatra: {
      title:
        'PrepYatra - Complete Interview Preparation Platform | The Boring Education',
      description:
        'Master your interviews with PrepYatra. Get personalized questions, mock interviews, and expert guidance to land your dream job.',
      image: '/images/prepyatra-og.png',
    },
    quiz: {
      title:
        'The Boring Quizzes - Interactive Learning Platform | The Boring Education',
      description:
        'Test your knowledge with our interactive quizzes. From programming to general knowledge, challenge yourself and learn with fun.',
      image: '/images/quizzes-og.png',
    },
    onboarding: {
      title: 'Onboarding - Get Started with The Boring Education',
      description:
        'Complete your profile setup and start your learning journey with The Boring Education.',
      image: '/images/onboarding-og.png',
    },
  };

  const config = seoConfigs[product];
  const productPath = path ? `/${path}` : '';

  return {
    title: config.title,
    description: config.description,
    url: `${baseUrl}/${product}${productPath}`,
    image: `${baseUrl}${config.image}`,
  };
};

/**
 * Health check utility for reverse proxied services
 */
export const checkServiceHealth = async (
  service: keyof ProxyEnvironmentConfig
): Promise<boolean> => {
  try {
    const urls = getProxyUrls();
    const response = await fetch(`${urls[service]}/api/health`, {
      method: 'GET',
      timeout: 5000,
    } as RequestInit);
    return response.ok;
  } catch (error) {
    console.error(`Health check failed for ${service}:`, error);
    return false;
  }
};

/**
 * Sanitize and validate paths for security
 */
export const sanitizePath = (path: string): string => {
  if (!path) return '';

  // Remove any potentially dangerous characters
  const sanitized = path
    .replace(/\.\./g, '') // Remove path traversal attempts
    .replace(/\/+/g, '/') // Remove multiple slashes
    .replace(/^\//, '') // Remove leading slash
    .trim();

  return sanitized;
};

/**
 * Generate structured data for SEO
 */
export const generateStructuredData = (
  product: 'prepyatra' | 'quiz' | 'onboarding'
) => {
  const baseUrl = 'https://theboringeducation.com';

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name:
      product === 'prepyatra'
        ? 'PrepYatra'
        : product === 'quiz'
        ? 'The Boring Quizzes'
        : 'TBE Onboarding',
    url: `${baseUrl}/${product}`,
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'Web',
    provider: {
      '@type': 'Organization',
      name: 'The Boring Education',
      url: baseUrl,
    },
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  };

  return JSON.stringify(structuredData);
};
