import { AppProps } from 'next/app';
import { PageLayout } from '@/components';
import { SessionProvider } from 'next-auth/react';
import Script from 'next/script';
import { googleAnalyticsScript, gtag } from '@/constant';
import '@/styles/globals.css';
import '@/styles/colors.css';

const TheBoringEducation = ({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) => {
  return (
    <>
      <Script async src={gtag}></Script>
      <Script id='google-analytics'>{googleAnalyticsScript}</Script>
      <SessionProvider session={session}>
        <PageLayout>
          <Component {...pageProps} />
        </PageLayout>
      </SessionProvider>
    </>
  );
};

export default TheBoringEducation;
