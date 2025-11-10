import { ExplorePlaylistContainer, Section, SEO } from '@tbe/components';
import { routes } from '@tbe/constants';
import type { PageProps } from '@tbe/interface';
import { getPreFetchProps } from '@tbe/utils';
import { Fragment } from 'react';

const Home = ({ seoMeta }: PageProps) => (
  <Fragment>
    <SEO seoMeta={seoMeta} />
    <Section>
      <ExplorePlaylistContainer
        focusText='Skill'
        heading='Pick An'
        isCenterAligned
        subtext='What Do You Want to Learn?'
      />
    </Section>
  </Fragment>
);

export const getStaticProps = async () => ({
  ...(await getPreFetchProps({ slug: routes.explorePlaylist })),
});

export default Home;
