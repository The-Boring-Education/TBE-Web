import { CardContainerB, LoadingSpinner, SEO } from '@tbe/components';
import { PAGE_REFRESH_TIMEOUT, routes } from '@tbe/constants';
import { useAPIResponseMapper } from '@tbe/hooks';
import type { PageProps } from '@tbe/interface';
import { CACHE_TIMES, queryKeys, useQuery } from '@tbe/query';
import {
  getPreFetchProps,
  mapProjectResponseToCard,
  sendRequest,
} from '@tbe/utils';
import { Fragment } from 'react';

const Home = ({ seoMeta }: PageProps) => {
  const { data: response, isLoading: loading } = useQuery<any>({
    queryKey: queryKeys.projects.lists(),
    queryFn: () => sendRequest({ url: routes.api.projects }),
    ...CACHE_TIMES.STATIC,
  });

  const projects = useAPIResponseMapper(
    response?.data,
    mapProjectResponseToCard,
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
