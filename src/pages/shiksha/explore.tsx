import { Fragment } from 'react';

import {
  CardContainerB,
  FlexContainer,
  LinkButton,
  LoadingSpinner,
  SEO,
  Text,
} from '@/components';
import { PAGE_REFRESH_TIMEOUT, routes } from '@/constant';
import { useApi, useAPIResponseMapper } from '@/hooks';
import type { PageProps, PrimaryCardWithCTAProps } from '@/interfaces';
import { getPreFetchProps, mapCourseResponseToCard } from '@/utils';

const Home = ({ seoMeta }: PageProps) => {
  const { response, loading } = useApi('shiksha', {
    url: routes.api.shiksha,
  });

  const courses: PrimaryCardWithCTAProps[] = useAPIResponseMapper(
    response?.data,
    mapCourseResponseToCard
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  const noCourseFoundUI = (!courses || courses.length === 0) && (
    <FlexContainer
      className='w-screen h-screen item-center justify-center flex-col'
      justifyCenter
    >
      <Text className='heading-4 mb-3' level='h1'>
        Oops! No Courses found.
      </Text>
      <LinkButton
        buttonProps={{
          variant: 'PRIMARY',
          text: 'Go Back To Home',
        }}
        href={routes.shiksha}
       />
    </FlexContainer>
  );

  return (
    <Fragment>
      <SEO seoMeta={seoMeta} />
      <CardContainerB
        borderColour={2}
        cards={courses}
        focusText='Courses'
        heading='Explore'
        sectionClassName='px-2 py-4'
        subtext='Pick A Course and Start Learning'
      />
      {noCourseFoundUI}
    </Fragment>
  );
};

export const getStaticProps = async () => ({
    ...(await getPreFetchProps({ slug: routes.shikshaExplore })),
    revalidate: PAGE_REFRESH_TIMEOUT.long,
  });

export default Home;
