import type { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useEffect } from 'react';

import {
  generateProductSEO,
  generateStructuredData,
  getProxyUrls,
  sanitizePath,
} from '@/utils/reverse-proxy';

interface PrepYatraPageProps {
  seoMeta: {
    title: string;
    description: string;
    url: string;
    image: string;
  };
  targetUrl: string;
  structuredData: string;
}

const PrepYatraPage = ({
  seoMeta,
  targetUrl,
  structuredData,
}: PrepYatraPageProps) => {
  useEffect(() => {
    // This will only run if the reverse proxy fails and falls back to Next.js
    // In normal operation, Vercel rewrites should handle the request
    window.location.href = targetUrl;
  }, [targetUrl]);

  return (
    <>
      <Head>
        <title>{seoMeta.title}</title>
        <meta name='description' content={seoMeta.description} />

        {/* Open Graph */}
        <meta property='og:title' content={seoMeta.title} />
        <meta property='og:description' content={seoMeta.description} />
        <meta property='og:url' content={seoMeta.url} />
        <meta property='og:image' content={seoMeta.image} />
        <meta property='og:type' content='website' />
        <meta property='og:site_name' content='The Boring Education' />

        {/* Twitter */}
        <meta name='twitter:card' content='summary_large_image' />
        <meta name='twitter:title' content={seoMeta.title} />
        <meta name='twitter:description' content={seoMeta.description} />
        <meta name='twitter:image' content={seoMeta.image} />
        <meta name='twitter:site' content='@theboringedu' />

        {/* Canonical URL */}
        <link rel='canonical' href={seoMeta.url} />

        {/* Structured Data */}
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{ __html: structuredData }}
        />

        {/* Preconnect for performance */}
        <link rel='preconnect' href={targetUrl} />
        <link rel='dns-prefetch' href={targetUrl} />

        {/* Additional SEO meta tags */}
        <meta name='robots' content='index, follow' />
        <meta name='author' content='The Boring Education' />
        <meta name='viewport' content='width=device-width, initial-scale=1.0' />
      </Head>

      {/* Loading state while redirecting */}
      <div className='min-h-screen flex items-center justify-center bg-gray-50'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4' />
          <h1 className='text-xl font-semibold text-gray-900 mb-2'>
            Redirecting to PrepYatra...
          </h1>
          <p className='text-gray-600'>
            You're being redirected to our interview preparation platform.
          </p>
        </div>
      </div>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const slug = (params?.slug as string[]) || [];
  const path = sanitizePath(slug.join('/'));

  // Get proxy URLs
  const proxyUrls = getProxyUrls();

  // Construct target URL
  const targetUrl = path
    ? `${proxyUrls.prepyatra}/${path}`
    : proxyUrls.prepyatra;

  // Generate route-specific SEO metadata
  const getSEOConfig = (path: string) => {
    const baseConfig = generateProductSEO('prepyatra', path);

    // Route-specific overrides
    switch (path) {
      case '':
        return {
          ...baseConfig,
          title: 'PrepYatra - Turn Hustle Into Hires | The Boring Education',
          description:
            'Complete interview preparation platform with personalized questions, mock interviews, and expert guidance.',
        };

      case 'dashboard':
        return {
          ...baseConfig,
          title: 'PrepYatra Dashboard - Track Your Interview Progress',
          description:
            'Monitor your interview preparation progress, track mock interviews, and manage your personalized questions.',
        };

      case 'onboarding':
        return {
          ...baseConfig,
          title: 'PrepYatra Onboarding - Start Your Interview Journey',
          description:
            'Complete your PrepYatra profile to get personalized interview questions and expert guidance.',
        };

      case 'pricing':
        return {
          ...baseConfig,
          title: 'PrepYatra Pricing - Choose Your Interview Prep Plan',
          description:
            'Select the perfect PrepYatra plan for your interview preparation needs. Start with free tier or upgrade for premium features.',
        };

      default:
        return baseConfig;
    }
  };

  const seoMeta = getSEOConfig(path);

  // Generate structured data
  const structuredData = generateStructuredData('prepyatra');

  return {
    props: {
      seoMeta,
      targetUrl,
      structuredData,
    },
  };
};

export default PrepYatraPage;
