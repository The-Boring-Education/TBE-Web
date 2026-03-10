import {
  CardContainerA,
  LandingPageHero,
  LinkButton,
  SEO,
} from '@tbe/components';
import { routes, STATIC_FILE_PATH, TBIP_FEATURES } from '@tbe/constants';
import type { PageProps } from '@tbe/interface';
import { getPreFetchProps } from '@tbe/utils';
import { Fragment } from 'react';

const Home = ({ seoMeta }: PageProps) => (
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

export const getStaticProps = async () => ({
  ...(await getPreFetchProps({ slug: routes.interviewPrep })),
});

export default Home;
