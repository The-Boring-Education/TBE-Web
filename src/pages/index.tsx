import {
  LandingPageHero,
  CardContainerA,
  Testimonials,
  SEO,
  LinkButton,
  CardContainerB,
  Community,
  Banner,
  NotificationContainer,
  WeAlreadyTaughtAt,
} from '@/components';
import { PageProps } from '@/interfaces';
import { getPreFetchProps } from '@/utils';
import {
  LINKS,
  PRODUCTS,
  STATIC_FILE_PATH,
  USP,
  generateSectionPath,
  routes,
} from '@/constant';
import { useRouter } from 'next/router';
import { Fragment } from 'react';

const Home = ({ seoMeta }: PageProps) => {
  const router = useRouter();

  return (
    <Fragment>
      <SEO seoMeta={seoMeta} />
      <LandingPageHero
        sectionHeaderProps={{
          heading: 'Tech Education for',
          focusText: 'Everyone',
        }}
        heroText='Learn Tech Skills & Prepare yourself for a Tech Job.'
        primaryButton={
          <LinkButton
            href={generateSectionPath({
              basePath: router.basePath,
              sectionID: routes.internals.landing.products,
            })}
            className='w-full sm:w-fit'
            buttonProps={{
              variant: 'PRIMARY',
              text: 'Get Started',
              className: 'w-full',
            }}
          />
        }
        secondaryButton={
          <LinkButton
            href={LINKS.bookTechConsultation}
            className='w-full sm:w-fit'
            buttonProps={{
              variant: 'OUTLINE',
              text: 'Book Tech Session',
              className: 'w-full',
            }}
            target='_blank'
          />
        }
        backgroundImageUrl={`${STATIC_FILE_PATH.svg}/hero-image.svg`}
      />

      <CardContainerB
        id={routes.internals.landing.products}
        heading='Our'
        focusText='Products'
        cards={PRODUCTS}
        borderColour={2}
      />
      <NotificationContainer />
      <Banner
        title='Bring Your Idea Cohort 2 Starts Soon'
        description='Join our Cohort and learn how to Build Tech Products.'
        buttonText='Register Now'
        buttonLink={routes.cohort.bringYourIdea}
        imageSrc={`${STATIC_FILE_PATH.svg}/laptop.svg`}
        variant='VARIANT_A'
      />
      <Banner
        title='Join as DevRel Advocate'
        description='Join our Community as a DevRel Advocate and help us grow.'
        buttonText='Apply as DevRel Advocate'
        buttonLink={LINKS.joinDevRelAdvocate}
        imageSrc={`${STATIC_FILE_PATH.svg}/community.svg`}
        variant='VARIANT_B'
      />
      <Community />
      <CardContainerA
        heading='What We Do'
        focusText='Differently'
        cards={USP}
      />
      <Testimonials />
      <WeAlreadyTaughtAt />
    </Fragment>
  );
};

export const getServerSideProps = getPreFetchProps;

export default Home;
