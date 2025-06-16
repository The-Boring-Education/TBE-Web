import { useRouter } from 'next/router';
import { Fragment } from 'react';

import {
  Banner,
  CardContainerA,
  CardContainerB,
  Community,
  LandingPageHero,
  LinkButton,
  NotificationContainer,
  SEO,
  Testimonials,
  WeAlreadyTaughtAt,
} from '@/components';
import {
  generateSectionPath,
  LINKS,
  PAGE_REFRESH_TIMEOUT,
  PRODUCTS,
  routes,
  STATIC_FILE_PATH,
  USP,
} from '@/constant';
import type { PageProps } from '@/interfaces';
import { getPreFetchProps } from '@/utils';

const Home = ({ seoMeta }: PageProps) => {
  const router = useRouter();

  return (
    <Fragment>
      <SEO seoMeta={seoMeta} />
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

      <CardContainerB
        borderColour={2}
        cards={PRODUCTS}
        focusText='Products'
        heading='Our'
        id={routes.internals.landing.products}
      />
      <NotificationContainer />
      <Banner
        buttonLink={routes.cohort.bringYourIdea}
        buttonText='Register Now'
        description='Join our Cohort and learn how to Build Tech Products.'
        imageSrc={`${STATIC_FILE_PATH.svg}/laptop.svg`}
        title='Bring Your Idea Cohort 2 Starts Soon'
        variant='VARIANT_A'
      />
      <Community />
      <CardContainerA
        cards={USP}
        focusText='Differently'
        heading='What We Do'
      />
      <Testimonials />
      <WeAlreadyTaughtAt />
    </Fragment>
  );
};

export const getStaticProps = async () => {
  return {
    ...(await getPreFetchProps({ slug: routes.home })),
    revalidate: PAGE_REFRESH_TIMEOUT.medium,
  };
};

export default Home;
