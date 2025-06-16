import { Fragment } from 'react';

import { CardContainerA, LandingPageHero, LinkButton, SEO } from '@/components';
import { routes, STATIC_FILE_PATH, TBP_FEATURES } from '@/constant';
import type { PageProps } from '@/interfaces';
import { getPreFetchProps } from '@/utils';

const Home = ({ seoMeta }: PageProps) => (
    <Fragment>
      <SEO seoMeta={seoMeta} />
      <LandingPageHero
        backgroundImageUrl={`${STATIC_FILE_PATH.svg}/projects.svg`}
        heroText='Come Out of Tutorial Hell & Build Real Life Projects.'
        primaryButton={
          <LinkButton
            buttonProps={{
              variant: 'PRIMARY',
              text: 'Explore Projects',
              className: 'w-full',
            }}
            className='w-full sm:w-fit'
            href={routes.projectsExplore}
          />
        }
        sectionHeaderProps={{
          heading: 'Build Projects',
          focusText: 'without Tutorials',
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
    ...(await getPreFetchProps({ slug: routes.projects })),
  });

export default Home;
