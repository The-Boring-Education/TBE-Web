import React, { Fragment } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { PageProps, PrimaryCardWithCTAProps } from '@/interfaces';
import {
  CardContainerB,
  LoadingSpinner,
  FlexContainer,
  Text,
  LinkButton,
  SEO,
} from '@/components';
import { useAPIResponseMapper, useApi, useUser } from '@/hooks';
import { getPreFetchProps, mapInterviewSheetResponseToCard } from '@/utils';
import { routes } from '@/constant';

const MySheets = ({ seoMeta }: PageProps) => {
  const session = useSession();
  const router = useRouter();

  const { user } = useUser();

  const userId = user?.id;

  const { response, loading } = useApi(
    'mySheets',
    {
      url: `${routes.api.mySheets}?userId=${userId}`,
    },
    { enabled: !!userId }
  );

  const sheets: PrimaryCardWithCTAProps[] = useAPIResponseMapper(
    response?.data,
    mapInterviewSheetResponseToCard
  );

  if (session.status === 'loading') return null;
  if (session.status !== 'authenticated') {
    router.push('/');
    return null;
  }

  if (loading) return <LoadingSpinner />;

  const noSheetsFoundUI = (!sheets || sheets.length === 0) && (
    <FlexContainer className='w-screen h-screen flex-col justify-center items-center'>
      <Text level='h1' className='heading-4 mb-3'>
        Oops! No Sheets found.
      </Text>
      <LinkButton
        buttonProps={{ variant: 'PRIMARY', text: 'Go Back To Home' }}
        href={routes.shiksha}
      />
    </FlexContainer>
  );

  return (
    <Fragment>
      <SEO seoMeta={seoMeta} />
      <CardContainerB
        heading='My'
        focusText='Sheets'
        cards={sheets}
        borderColour={2}
        subtext='Pick A Sheet and Start Learning'
        sectionClassName='px-2 py-4'
      />
      {noSheetsFoundUI}
    </Fragment>
  );
};

export const getServerSideProps = getPreFetchProps;

export default MySheets;
