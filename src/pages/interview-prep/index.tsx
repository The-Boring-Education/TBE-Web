import React from 'react';
import { LandingPageHero, CardContainerA, SEO, LinkButton } from '@/components';
import { PageProps } from '@/interfaces';
import { getPreFetchProps } from '@/utils';
import { STATIC_FILE_PATH, TBIP_FEATURES, routes } from '@/constant';

const Home = ({ seoMeta }: PageProps) => {
  return (
    <React.Fragment>
      <SEO seoMeta={seoMeta} />
      <LandingPageHero
        sectionHeaderProps={{
          heading: 'Preparing for',
          focusText: 'Tech Interviews??',
        }}
        heroText='Crack Tech Interview with Questions Asked in Real Interviews.'
        primaryButton={
          <LinkButton
            href={routes.shikshaExplore}
            className='w-full sm:w-fit'
            buttonProps={{
              variant: 'PRIMARY',
              text: 'Explore Sheets',
              className: 'w-full',
            }}
          />
        }
        backgroundImageUrl={`${STATIC_FILE_PATH.svg}/hero-image.svg`}
      />
      <CardContainerA
        heading='What We Do'
        focusText='Differently'
        cards={TBIP_FEATURES}
        borderColour={4}
      />
    </React.Fragment>
  );
};

export const getServerSideProps = getPreFetchProps;

export default Home;
