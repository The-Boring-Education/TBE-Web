import { Fragment, useMemo } from 'react';

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
import { getPreFetchProps, mapInterviewSheetResponseToCard } from '@/utils';

const Home = ({ seoMeta }: PageProps) => {
  const { response, loading } = useApi('interview-prep', {
    url: routes.api.interviewPrep,
  });

  const sheets: PrimaryCardWithCTAProps[] = useAPIResponseMapper(
    response?.data,
    mapInterviewSheetResponseToCard
  );

  // Group by roadmap/domain for structured sections
  const groupedByRoadmap = useMemo(() => {
    const groups: Record<string, PrimaryCardWithCTAProps[]> = {};
    (response?.data || []).forEach((sheet: any) => {
      const roadmap = sheet?.roadmap || 'Tech';
      if (!groups[roadmap]) groups[roadmap] = [];
      const card = (sheets || []).find((c) => c.id === sheet._id);
      if (card) groups[roadmap].push(card);
    });
    return groups;
  }, [response?.data, sheets]);

  if (loading) {
    return <LoadingSpinner />;
  }

  const noSheetFoundUI = (!sheets || sheets.length === 0) && (
    <FlexContainer
      className='w-screen h-screen item-center justify-center flex-col'
      justifyCenter
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
      />
    </FlexContainer>
  );

  return (
    <Fragment>
      <SEO seoMeta={seoMeta} />
      {Object.entries(groupedByRoadmap).map(([roadmap, cards]) => (
        <CardContainerB
          key={roadmap}
          borderColour={2}
          cards={cards}
          focusText={`${roadmap} Sheets`}
          heading={`Explore ${roadmap}`}
          sectionClassName='px-2 py-4'
          subtext={`Pick a ${roadmap} sheet and start preparing`}
        />
      ))}
      {noSheetFoundUI}
    </Fragment>
  );
};

export const getStaticProps = async () => ({
  ...(await getPreFetchProps({ slug: routes.interviewPrepExplore })),
  revalidate: PAGE_REFRESH_TIMEOUT.long,
});

export default Home;
