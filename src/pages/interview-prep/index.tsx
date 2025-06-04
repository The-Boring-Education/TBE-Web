import { LandingPageHero, CardContainerA, SEO, LinkButton } from '@/components';
import { PageProps } from '@/interfaces';
import { getPreFetchProps } from '@/utils';
import { STATIC_FILE_PATH, TBIP_FEATURES, routes } from '@/constant';
import { Fragment } from 'react';

const Home = ({ seoMeta }: PageProps) => {
  return (
    <Fragment>
      <SEO seoMeta={seoMeta} />
      <LandingPageHero
        sectionHeaderProps={{
          heading: 'Preparing for',
          focusText: 'Tech Interviews??',
        }}
        heroText='Crack Tech Interview with Questions Asked in Real Interviews.'
        primaryButton={
          <LinkButton
            href={routes.interviewPrepExplore}
            className='w-full sm:w-fit'
            buttonProps={{
              variant: 'PRIMARY',
              text: 'Explore Sheets',
              className: 'w-full',
            }}
          />
        }
        backgroundImageUrl={`${STATIC_FILE_PATH.svg}/interview.svg`}
      />
      <CardContainerA
        heading='What We Do'
        focusText='Differently'
        cards={TBIP_FEATURES}
        borderColour={4}
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
