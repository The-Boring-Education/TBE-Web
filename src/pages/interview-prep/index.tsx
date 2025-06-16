import { Fragment } from 'react';

import { CardContainerA, LandingPageHero, LinkButton, SEO } from '@/components';
import { routes, STATIC_FILE_PATH, TBIP_FEATURES } from '@/constant';
import type { PageProps } from '@/interfaces';
import { getPreFetchProps } from '@/utils';

const Home = ({ seoMeta }: PageProps) => {
  return (
    <Fragment>
      <SEO seoMeta={seoMeta} />
      <LandingPageHero
        backgroundImageUrl={`${STATIC_FILE_PATH.svg}/interview.svg`}
        heroText='Crack Tech Interview with Questions Asked in Real Interviews.'
        primaryButton={
          <LinkButton
            buttonProps={{
              variant: 'PRIMARY',
              text: 'Explore Sheets',
              className: 'w-full',
            }}
            className='w-full sm:w-fit'
            href={routes.interviewPrepExplore}
          />
        }
        sectionHeaderProps={{
          heading: 'Preparing for',
          focusText: 'Tech Interviews??',
        }}
      />
      <CardContainerA
        borderColour={4}
        cards={TBIP_FEATURES}
        focusText='Differently'
        heading='What We Do'
      />
    </Fragment>
  );
};

export const getStaticProps = async () => {
  return {
    ...(await getPreFetchProps({ slug: routes.interviewPrep })),
  };
};

export default Home;
