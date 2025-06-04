import { Fragment } from 'react';
import { PageProps, PrimaryCardWithCTAProps } from '@/interfaces';
import {
  SEO,
  CardContainerB,
  LoadingSpinner,
  FlexContainer,
  Text,
  LinkButton,
} from '@/components';
import { useAPIResponseMapper, useApi } from '@/hooks';
import { getPreFetchProps, mapCourseResponseToCard } from '@/utils';
import { PAGE_REFRESH_TIMEOUT, routes } from '@/constant';

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
      justifyCenter={true}
      className='w-screen h-screen item-center justify-center flex-col'
    >
      <Text level='h1' className='heading-4 mb-3'>
        Oops! No Courses found.
      </Text>
      <LinkButton
        buttonProps={{
          variant: 'PRIMARY',
          text: 'Go Back To Home',
        }}
        href={routes.shiksha}
      ></LinkButton>
    </FlexContainer>
  );

  return (
    <Fragment>
      <SEO seoMeta={seoMeta} />
      <CardContainerB
        heading='Explore'
        focusText='Courses'
        cards={courses}
        borderColour={2}
        subtext='Pick A Course and Start Learning'
        sectionClassName='px-2 py-4'
      />
      {noCourseFoundUI}
    </Fragment>
  );
};

export const getStaticProps = async () => {
  return {
    ...(await getPreFetchProps({ slug: routes.shikshaExplore })),
    revalidate: PAGE_REFRESH_TIMEOUT.long,
  };
};

export default Home;
