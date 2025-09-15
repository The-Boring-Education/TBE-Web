import Head from 'next/head';
import { useRouter } from 'next/router';

import { favicons } from '@/constant';
import type { SEOProps } from '@/interfaces';

const DOMAIN = 'https://theboringeducation.com';

const SEO = ({ seoMeta }: SEOProps) => {
  const router = useRouter();

  const canonicalUrl = `${DOMAIN}${router.asPath === '/' ? '' : router.asPath}`;

  return (
    <Head>
      <title>{seoMeta.title}</title>
      <meta content={seoMeta.robots} name='robots' />
      <meta content={seoMeta.description} name='description' />
      <meta content={`${seoMeta.url}${router.asPath}`} property='og:url' />
      <link href={canonicalUrl} rel='canonical' />
      {/* Open Graph */}
      <meta content={seoMeta.type} property='og:type' />
      <meta content={seoMeta.siteName} property='og:site_name' />
      <meta content={seoMeta.description} property='og:description' />
      <meta content={seoMeta.title} property='og:title' />
      <meta content={seoMeta.image} name='image' property='og:image' />
      {/* Twitter */}
      {/* <meta name='twitter:card' content='summary_large_image' />
      <meta name='twitter:site' content='@' />
      <meta name='twitter:title' content={meta.title} />
      <meta name='twitter:description' content={meta.description} />
      <meta name='twitter:image' content={meta.image} /> */}

      {favicons.map((linkProps) => (
        <link key={linkProps.href} {...linkProps} />
      ))}
      <meta content='#ffffff' name='msapplication-TileColor' />
      <meta content='/favicon/browserconfig.xml' name='msapplication-config' />
      <meta content='#ff5757' name='theme-color' />
    </Head>
  );
};

export default SEO;
