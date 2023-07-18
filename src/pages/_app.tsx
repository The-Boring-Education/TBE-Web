import { AppProps } from 'next/app';
import Script from 'next/script';
import { PageLayout } from '@/components';
import '@/styles/globals.css';
import '@/styles/colors.css';
import { googleAnalyticsScript, gtag } from '@/constant';

const TheBoringEducation = ({ Component, pageProps }: AppProps) => {
  return (
    <>
      <Script async src={gtag}></Script>
      <Script id='google-analytics'>{googleAnalyticsScript}</Script>
      <PageLayout>
        <Component {...pageProps} />
      </PageLayout>
    </>
  );
};

export default TheBoringEducation;
