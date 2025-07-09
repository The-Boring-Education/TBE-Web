import type { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useEffect } from 'react';

import { envConfig } from '@/constant';

interface PrepYatraPageProps {
  seoMeta: {
    title: string;
    description: string;
    url: string;
    image: string;
  };
  targetUrl: string;
}

const PrepYatraPage = ({ seoMeta, targetUrl }: PrepYatraPageProps) => {
  useEffect(() => {
    // Redirect to the actual PrepYatra app
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

        {/* Twitter */}
        <meta name='twitter:card' content='summary_large_image' />
        <meta name='twitter:title' content={seoMeta.title} />
        <meta name='twitter:description' content={seoMeta.description} />
        <meta name='twitter:image' content={seoMeta.image} />

        {/* Canonical URL */}
        <link rel='canonical' href={seoMeta.url} />
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

export const getServerSideProps: GetServerSideProps = async ({
  params,
  req,
}) => {
  const slug = (params?.slug as string[]) || [];
  const path = slug.join('/');

  // Base PrepYatra URL
  const prepYatraBaseUrl =
    envConfig.PREPYATRA_APP_URL || 'https://prepyatra.netlify.app';

  // Construct target URL
  const targetUrl = path ? `${prepYatraBaseUrl}/${path}` : prepYatraBaseUrl;

  // SEO configuration based on the route
  const getSEOConfig = (path: string) => {
    const baseConfig = {
      title:
        'PrepYatra - Complete Interview Preparation Platform | The Boring Education',
      description:
        'Master your interviews with PrepYatra. Get personalized questions, mock interviews, and expert guidance to land your dream job.',
      url: `https://prepyatra.theboringeducation.com/${path}`,
      image: 'https://theboringeducation.com/images/prepyatra-og.png', // You'll need to create this image
    };

    // Route-specific SEO
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

  return {
    props: {
      seoMeta,
      targetUrl,
    },
  };
};

export default PrepYatraPage;
