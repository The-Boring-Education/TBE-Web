import { Fragment } from 'react';

import { ExplorePlaylistContainer, Section, SEO } from '@/components';
import { routes } from '@/constant';
import type { PageProps } from '@/interfaces';
import { getPreFetchProps } from '@/utils';

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
