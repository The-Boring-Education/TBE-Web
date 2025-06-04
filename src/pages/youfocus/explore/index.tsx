import { ExplorePlaylistContainer, Section, SEO } from '@/components';
import { routes } from '@/constant';
import { PageProps } from '@/interfaces';
import { getPreFetchProps } from '@/utils';
import { Fragment } from 'react';

const Home = ({ seoMeta }: PageProps) => {
  return (
    <Fragment>
      <SEO seoMeta={seoMeta} />
      <Section>
        <ExplorePlaylistContainer
          heading='Pick An'
          focusText='Skill'
          subtext='What Do You Want to Learn?'
          isCenterAligned={true}
        />
      </Section>
    </Fragment>
  );
};

export const getStaticProps = async () => {
  return {
    ...(await getPreFetchProps({ slug: routes.explorePlaylist })),
  };
};

export default Home;
