import { Fragment } from 'react';

import { CardContainerB, LoadingSpinner, SEO } from '@tbe/components';
import { PAGE_REFRESH_TIMEOUT, routes } from '@tbe/constants';
import { useApi, useAPIResponseMapper } from '@tbe/hooks';
import type { PageProps } from '@tbe/interface';
import { getPreFetchProps, mapProjectResponseToCard } from '@tbe/utils';

const Home = ({ seoMeta }: PageProps) => {
  const { response, loading } = useApi('projects', {
    url: routes.api.projects,
  });

  const projects = useAPIResponseMapper(
    response?.data,
    mapProjectResponseToCard
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Fragment>
      <SEO seoMeta={seoMeta} />
      <CardContainerB
        borderColour={2}
        cards={projects}
        focusText='Projects'
        heading='Explore'
        sectionClassName='px-2 py-4'
        subtext='Pick A Real Life Project and Start Building'
      />
    </Fragment>
  );
};

export const getStaticProps = async () => ({
  ...(await getPreFetchProps({ slug: routes.projectsExplore })),
  revalidate: PAGE_REFRESH_TIMEOUT.long,
});

export default Home;
