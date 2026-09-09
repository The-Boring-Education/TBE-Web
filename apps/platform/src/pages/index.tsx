import {
  AppShowcaseSections,
  Banner,
  CollegeEventsSection,
  PlatformLandingHero,
  SEO,
  Testimonials,
  useColorTheme,
  WeAlreadyTaughtAt,
} from '@tbe/components';
import { PAGE_REFRESH_TIMEOUT, routes, STATIC_FILE_PATH } from '@tbe/constants';
import type { PageProps } from '@tbe/interface';
import { getPreFetchProps } from '@tbe/utils';
import { Fragment } from 'react';

const Home = ({ seoMeta }: PageProps) => {
  const pageTheme = useColorTheme();

  return (
    <Fragment>
      <SEO seoMeta={seoMeta} />
      <main className='relative min-h-screen w-full bg-background overflow-hidden'>
        <PlatformLandingHero
          ctaText='Start Learning Now →'
          ctaHref={routes.learn}
        />

        <AppShowcaseSections theme={pageTheme} />

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
