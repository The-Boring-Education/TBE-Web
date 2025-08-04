import type { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useEffect } from 'react';

interface PrepYatraPageProps {
  targetUrl: string;
}

const PrepYatraPage = ({ targetUrl }: PrepYatraPageProps) => {
  useEffect(() => {
    window.location.href = targetUrl;
  }, [targetUrl]);

  return (
    <>
      <Head>
        <title>PrepYatra - Interview Preparation</title>
        <meta name='description' content='Interview preparation platform' />
      </Head>
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4' />
          <h1 className='text-xl font-semibold text-gray-900 mb-2'>
            Redirecting to PrepYatra...
          </h1>
        </div>
      </div>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const slug = (params?.slug as string[]) || [];
  const path = slug.join('/');
  console.log('path', path);

  const baseUrl =
    process.env.PREPYATRA_APP_URL ||
    'https://prep-yatra-git-development-tbe.vercel.app';
  const targetUrl = path ? `${baseUrl}/${path}` : baseUrl;

  return {
    props: {
      targetUrl,
    },
  };
};

export default PrepYatraPage;
