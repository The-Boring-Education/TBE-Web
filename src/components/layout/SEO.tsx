import { favicons } from '@/constant';
import { SEOProps } from '@/interfaces';
import Head from 'next/head';
import { useRouter } from 'next/router';

export default function SEO({ seoMeta }: SEOProps) {
  const router = useRouter();

  return (
    <Head>
      <title>{seoMeta.title}</title>
      <meta name='robots' content={seoMeta.robots} />
      <meta content={seoMeta.description} name='description' />
      <meta property='og:url' content={`${seoMeta.url}${router.asPath}`} />
      <link rel='canonical' href={`${seoMeta.url}${router.asPath}`} />
      {/* Open Graph */}
      <meta property='og:type' content={seoMeta.type} />
      <meta property='og:site_name' content={seoMeta.siteName} />
      <meta property='og:description' content={seoMeta.description} />
      <meta property='og:title' content={seoMeta.title} />
      <meta name='image' property='og:image' content={seoMeta.image} />
      {/* Twitter */}
      {/* <meta name='twitter:card' content='summary_large_image' />
      <meta name='twitter:site' content='@' />
      <meta name='twitter:title' content={meta.title} />
      <meta name='twitter:description' content={meta.description} />
      <meta name='twitter:image' content={meta.image} /> */}

      {favicons.map((linkProps) => (
        <link key={linkProps.href} {...linkProps} />
      ))}
      <meta name='msapplication-TileColor' content='#ffffff' />
      <meta name='msapplication-config' content='/favicon/browserconfig.xml' />
      <meta name='theme-color' content='#ff5757' />
    </Head>
  );
}
