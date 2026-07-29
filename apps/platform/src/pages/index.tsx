import {
  AppShowcaseSections,
  Banner,
  CollegeEventsSection,
  LandingPageHero,
  LinkButton,
  SEO,
  SolarEcosystem,
  Testimonials,
  WeAlreadyTaughtAt,
} from '@tbe/components';
import {
  generateSectionPath,
  LINKS,
  PAGE_REFRESH_TIMEOUT,
  routes,
  STATIC_FILE_PATH,
} from '@tbe/constants';
import type { PageProps } from '@tbe/interface';
import { getPreFetchProps } from '@tbe/utils';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { Fragment } from 'react';

const Home = ({ seoMeta }: PageProps) => {
  const router = useRouter();

  return (
    <Fragment>
      <SEO seoMeta={seoMeta} />
      <main className='relative min-h-screen w-full bg-[#FFF8F8] overflow-hidden'>
        {/* Single unified page-wide reddish background light ambient glow - NO SEAMS OR CROPS */}
        <div
          aria-hidden
          className='pointer-events-none absolute inset-0 overflow-hidden z-0'
        >
          <motion.div
            className='absolute -top-20 left-1/2 -translate-x-1/2 h-[750px] w-full max-w-7xl rounded-full blur-[160px] bg-[#FF5757]/16'
            animate={{ y: [0, 25, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className='absolute top-[28%] right-[-12%] h-[750px] w-[750px] rounded-full blur-[170px] bg-[#FF5757]/14'
            animate={{ y: [0, -35, 0] }}
            transition={{
              duration: 14,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 1,
            }}
          />
          <motion.div
            className='absolute top-[58%] left-[-12%] h-[750px] w-[750px] rounded-full blur-[170px] bg-[#FF5757]/14'
            animate={{ y: [0, 35, 0] }}
            transition={{
              duration: 16,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 2,
            }}
          />
          <motion.div
            className='absolute top-[82%] right-[-10%] h-[600px] w-[600px] rounded-full blur-[160px] bg-[#FF5757]/12'
            animate={{ y: [0, -25, 0] }}
            transition={{
              duration: 18,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 3,
            }}
          />
          <div className='absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,87,87,0.13),transparent_60%)]' />
        </div>

        <LandingPageHero
          backgroundImageUrl={`${STATIC_FILE_PATH.svg}/hero-image.svg`}
          heroText='Learn Tech Skills & Prepare yourself for a Tech Job.'
          primaryButton={
            <LinkButton
              buttonProps={{
                variant: 'PRIMARY',
                text: 'Get Started',
                className: 'w-full',
              }}
              className='w-full sm:w-fit'
              href={generateSectionPath({
                basePath: router.basePath,
                sectionID: routes.internals.landing.products,
              })}
            />
          }
          secondaryButton={
            <LinkButton
              buttonProps={{
                variant: 'OUTLINE',
                text: 'Book Free Session',
                className: 'w-full',
              }}
              className='w-full sm:w-fit'
              href={LINKS.bookTechConsultation}
              target='_blank'
            />
          }
          sectionHeaderProps={{
            heading: 'Tech Education for',
            focusText: 'Everyone',
          }}
        />

        <SolarEcosystem theme='light' />

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
