import { LandingPageHero, CardContainerA, SEO, LinkButton } from '@/components';
import { PageProps } from '@/interfaces';
import { getPreFetchProps } from '@/utils';
import { STATIC_FILE_PATH, TBP_FEATURES, routes } from '@/constant';
import { Fragment } from 'react';

const Home = ({ seoMeta }: PageProps) => {
  return (
    <Fragment>
      <SEO seoMeta={seoMeta} />
      <LandingPageHero
        sectionHeaderProps={{
          heading: 'Build Projects',
          focusText: 'without Tutorials',
        }}
        heroText='Come Out of Tutorial Hell & Build Real Life Projects.'
        primaryButton={
          <LinkButton
            href={routes.projectsExplore}
            className='w-full sm:w-fit'
            buttonProps={{
              variant: 'PRIMARY',
              text: 'Explore Projects',
              className: 'w-full',
            }}
          />
        }
        backgroundImageUrl={`${STATIC_FILE_PATH.svg}/projects.svg`}
      />
      <CardContainerA
        heading='What We Do'
        focusText='Differently'
        cards={TBP_FEATURES}
        borderColour={4}
      />
    </Fragment>
  );
};

export const getStaticProps = async () => {
  return {
    ...(await getPreFetchProps({ slug: routes.projects })),
    revalidate: 1000,
  };
};

export default Home;
