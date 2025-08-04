import type { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useEffect } from 'react';

import {
  generateProductSEO,
  generateStructuredData,
  getProxyUrls,
  sanitizePath,
} from '@/utils/reverse-proxy';

interface QuizzesPageProps {
  seoMeta: {
    title: string;
    description: string;
    url: string;
    image: string;
  };
  targetUrl: string;
  structuredData: string;
}

const QuizzesPage = ({
  seoMeta,
  targetUrl,
  structuredData,
}: QuizzesPageProps) => {
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
      <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-100'>
        <div className='text-center max-w-md mx-auto px-4'>
          <div className='animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-6' />
          <h1 className='text-2xl font-bold text-gray-900 mb-4'>
            Loading The Boring Quizzes...
          </h1>
          <p className='text-gray-600 mb-6'>
            Preparing your interactive quiz experience. This should only take a
            moment.
          </p>
          <div className='bg-white rounded-lg p-4 shadow-sm'>
            <p className='text-sm text-gray-500'>
              If this takes longer than expected, please{' '}
              <a
                href='mailto:support@theboringeducation.com'
                className='text-purple-600 hover:underline'
              >
                contact our support team
              </a>
              .
            </p>
          </div>
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
  const targetUrl = path ? `${proxyUrls.quiz}/${path}` : proxyUrls.quiz;

  // Generate SEO metadata
  const seoMeta = generateProductSEO('quiz', path);

  // Generate structured data
  const structuredData = generateStructuredData('quiz');

  return {
    props: {
      seoMeta,
      targetUrl,
      structuredData,
    },
  };
};

export default QuizzesPage;
