import React, { Fragment } from 'react';
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
import { getPreFetchProps, mapInterviewSheetResponseToCard } from '@/utils';
import { routes } from '@/constant';

const Home = ({ seoMeta }: PageProps) => {
  const { response, loading } = useApi('interview-prep', {
    url: routes.api.interviewPrep,
  });

  const courses: PrimaryCardWithCTAProps[] = useAPIResponseMapper(
    response?.data,
    mapInterviewSheetResponseToCard
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  const noSheetFoundUI = (!courses || courses.length === 0) && (
    <FlexContainer
      justifyCenter={true}
      className='w-screen h-screen item-center justify-center flex-col'
    >
      <Text level='h1' className='heading-4 mb-3'>
        Oops! No Sheets found.
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
        focusText='Sheets'
        cards={courses}
        borderColour={2}
        subtext='Pick A Sheet and Start Preparing'
        sectionClassName='px-2 py-4'
      />
      {noSheetFoundUI}
    </Fragment>
  );
};

export const getServerSideProps = getPreFetchProps;

export default Home;
