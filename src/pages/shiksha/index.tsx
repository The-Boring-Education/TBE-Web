import { Fragment } from 'react';

import { CardContainerA, LandingPageHero, LinkButton, SEO } from '@/components';
import { routes, STATIC_FILE_PATH, TBP_FEATURES } from '@/constant';
import type { PageProps } from '@/interfaces';
import { getPreFetchProps } from '@/utils';

const Home = ({ seoMeta }: PageProps) => (
    <Fragment>
      <SEO seoMeta={seoMeta} />
      <LandingPageHero
        backgroundImageUrl={`${STATIC_FILE_PATH.svg}/shiksha.svg`}
        heroText='Learn Tech with Free Bite-sized Courses'
        primaryButton={
          <LinkButton
            buttonProps={{
              variant: 'PRIMARY',
              text: 'Explore Courses',
              className: 'w-full',
            }}
            className='w-full sm:w-fit'
            href={routes.shikshaExplore}
          />
        }
        sectionHeaderProps={{
          heading: 'Learn Tech with',
          focusText: 'Mini Courses',
        }}
      />
      <CardContainerA
        borderColour={4}
        cards={TBP_FEATURES}
        focusText='Differently'
        heading='What We Do'
      />
    </Fragment>
  );

export const getStaticProps = async () => ({
    ...(await getPreFetchProps({ slug: routes.shiksha })),
  });

export default Home;
