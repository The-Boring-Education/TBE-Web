import { ExplorePlaylistContainer, Section, SEO } from '@/components';
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

export const getStaticProps = async (context: any) => {
  return {
    ...(await getPreFetchProps(context)),
    revalidate: 60,
  };
};
export default Home;
