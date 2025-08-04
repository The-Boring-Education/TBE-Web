import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import { envConfig } from '@/constant/envConfig';

interface QuizzesFallbackProps {
  targetUrl: string;
  seoMeta: {
    title: string;
    description: string;
    url: string;
    image: string;
  };
}

const QuizzesFallback = ({ targetUrl, seoMeta }: QuizzesFallbackProps) => {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (countdown === 0) {
      setRedirecting(true);
      window.location.href = targetUrl;
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, targetUrl]);

  const handleManualRedirect = () => {
    setRedirecting(true);
    window.location.href = targetUrl;
  };

  const handleGoBack = () => {
    router.back();
  };

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

        {/* Twitter */}
        <meta name='twitter:card' content='summary_large_image' />
        <meta name='twitter:title' content={seoMeta.title} />
        <meta name='twitter:description' content={seoMeta.description} />
        <meta name='twitter:image' content={seoMeta.image} />

        {/* Canonical URL */}
        <link rel='canonical' href={seoMeta.url} />

        {/* Preconnect to target domain for performance */}
        <link rel='preconnect' href={targetUrl} />
        <link rel='dns-prefetch' href={targetUrl} />
      </Head>

      <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-100'>
        <div className='max-w-md w-full mx-4'>
          <div className='bg-white rounded-xl shadow-lg p-8 text-center'>
            {/* Icon */}
            <div className='w-16 h-16 mx-auto mb-6 bg-purple-100 rounded-full flex items-center justify-center'>
              {redirecting ? (
                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600' />
              ) : (
                <svg
                  className='w-8 h-8 text-purple-600'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                  />
                </svg>
              )}
            </div>

            {/* Content */}
            <h1 className='text-2xl font-bold text-gray-900 mb-4'>
              {redirecting ? 'Redirecting...' : 'Preparing Quizzes'}
            </h1>

            <p className='text-gray-600 mb-6'>
              {redirecting
                ? 'Taking you to our interactive quiz platform...'
                : `We're preparing your quiz platform. Redirecting in ${countdown} seconds.`}
            </p>

            {/* Progress bar */}
            <div className='w-full bg-gray-200 rounded-full h-2 mb-6'>
              <div
                className='bg-purple-600 h-2 rounded-full transition-all duration-1000 ease-out'
                style={{ width: `${((5 - countdown) / 5) * 100}%` }}
              />
            </div>

            {/* Action buttons */}
            <div className='space-y-3'>
              <button
                onClick={handleManualRedirect}
                disabled={redirecting}
                className='w-full bg-purple-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {redirecting ? 'Redirecting...' : 'Go to Quizzes Now'}
              </button>

              <button
                onClick={handleGoBack}
                className='w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors'
              >
                Go Back
              </button>
            </div>

            {/* Additional info */}
            <p className='text-xs text-gray-500 mt-4'>
              Having trouble? Contact us at{' '}
              <a
                href='mailto:support@theboringeducation.com'
                className='text-purple-600 hover:underline'
              >
                support@theboringeducation.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export const getServerSideProps = async ({
  query,
}: {
  query: { path?: string };
}) => {
  const path = query.path || '';

  // Base Quiz URL
  const quizBaseUrl = envConfig.QUIZ_APP_URL || 'https://quiz-tbe.netlify.app/';

  // Construct target URL
  const targetUrl = path ? `${quizBaseUrl}/${path}` : quizBaseUrl;

  // SEO configuration
  const seoMeta = {
    title:
      'The Boring Quizzes - Interactive Learning Platform | The Boring Education',
    description:
      'Test your knowledge with our interactive quizzes. From programming to general knowledge, challenge yourself and learn with fun.',
    url: `https://theboringeducation.com/quizzes/${path}`,
    image: 'https://theboringeducation.com/images/quizzes-og.png',
  };

  return {
    props: {
      targetUrl,
      seoMeta,
    },
  };
};

export default QuizzesFallback;
