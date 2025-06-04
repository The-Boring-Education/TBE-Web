import { Fragment } from 'react';

import { useApi, useAPIResponseMapper } from '@/hooks';

import {
  CardContainerB,
  FlexContainer,
  LinkButton,
  LoadingSpinner,
  SEO,
  Text,
} from '@/components';

import { PAGE_REFRESH_TIMEOUT, routes } from '@/constant';
import type { PageProps, PrimaryCardWithCTAProps } from '@/interfaces';
import { getPreFetchProps, mapInterviewSheetResponseToCard } from '@/utils';

const Home = ({ seoMeta }: PageProps) => {
  const { response, loading } = useApi('interview-prep', {
    url: routes.api.interviewPrep,
  });

  const sheets: PrimaryCardWithCTAProps[] = useAPIResponseMapper(
    response?.data,
    mapInterviewSheetResponseToCard
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  const noSheetFoundUI = (!sheets || sheets.length === 0) && (
    <FlexContainer
      className='w-screen h-screen item-center justify-center flex-col'
      justifyCenter={true}
    >
      <Text className='heading-4 mb-3' level='h1'>
        Oops! No Sheets found.
      </Text>
      <LinkButton
        buttonProps={{
          variant: 'PRIMARY',
          text: 'Go Back To Home',
        }}
        href={routes.interviewPrep}
      ></LinkButton>
    </FlexContainer>
  );

  return (
    <Fragment>
      <SEO seoMeta={seoMeta} />
      <CardContainerB
        borderColour={2}
        cards={sheets}
        focusText='Sheets'
        heading='Explore'
        sectionClassName='px-2 py-4'
        subtext='Pick A Sheet and Start Preparing'
      />
      {noSheetFoundUI}
    </Fragment>
  );
};

export const getStaticProps = async () => {
  return {
    ...(await getPreFetchProps({ slug: routes.interviewPrepExplore })),
    revalidate: PAGE_REFRESH_TIMEOUT.long,
  };
};

export default Home;
