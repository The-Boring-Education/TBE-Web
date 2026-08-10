import {
  AppShowcaseSections,
  Banner,
  CollegeEventsSection,
  PlatformLandingHero,
  SEO,
  Testimonials,
  WeAlreadyTaughtAt,
} from '@tbe/components';
import {
  generateSectionPath,
  PAGE_REFRESH_TIMEOUT,
  routes,
  STATIC_FILE_PATH,
} from '@tbe/constants';
import type { PageProps } from '@tbe/interface';
import { getPreFetchProps } from '@tbe/utils';
import { useRouter } from 'next/router';
import { Fragment } from 'react';

const Home = ({ seoMeta }: PageProps) => {
  const router = useRouter();

  return (
    <Fragment>
      <SEO seoMeta={seoMeta} />
      <main className='relative min-h-screen w-full bg-[#FAFAFC] overflow-hidden'>
        <PlatformLandingHero
          ctaText='Start Learning Now →'
          ctaHref={generateSectionPath({
            basePath: router.basePath,
            sectionID: routes.internals.landing.products,
          })}
        />

        <AppShowcaseSections theme='light' />

        <Banner
          buttonLink={routes.devRels}
          buttonText='Apply Now'
          description='Join The Boring Education Campus Connect & DevRel Program. Build, Lead, and Learn as a tech ambassador at your college.'
          imageSrc={`${STATIC_FILE_PATH.svg}/tech-yatra.svg`}
          title='Be the Face of Tech in Your College 🚀'
          variant='VARIANT_C'
        />

        <CollegeEventsSection />

        <Testimonials />

        <WeAlreadyTaughtAt />
      </main>
    </Fragment>
  );
};

export const getStaticProps = async () => ({
  ...(await getPreFetchProps({ slug: routes.home })),
  revalidate: PAGE_REFRESH_TIMEOUT.veryVeryLong,
});

export default Home;
