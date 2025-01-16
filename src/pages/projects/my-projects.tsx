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
import { getPreFetchProps, mapProjectResponseToCard } from '@/utils';
import { routes } from '@/constant';

const MyProjects = ({ seoMeta }: PageProps) => {
  const session = useSession();
  const router = useRouter();

  const { user } = useUser();

  const userId = user?.id;

  const { response, loading } = useApi(
    'myProjects',
    {
      url: `${routes.api.myProjects}?userId=${userId}`,
    },
    { enabled: !!userId }
  );

  const projects: PrimaryCardWithCTAProps[] = useAPIResponseMapper(
    response?.data,
    mapProjectResponseToCard
  );

  if (session.status === 'loading') return null;
  if (session.status !== 'authenticated') {
    router.push('/');
    return null;
  }

  if (loading) return <LoadingSpinner />;

  const noProjectFoundUI = (!projects || projects.length === 0) && (
    <FlexContainer className='w-screen h-screen flex-col justify-center items-center'>
      <Text level='h1' className='heading-4 mb-3'>
        Oops! No Projects found.
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
        focusText='Projects'
        cards={projects}
        borderColour={2}
        subtext='Pick A Project and Start Working'
        sectionClassName='px-2 py-4'
      />
      {noProjectFoundUI}
    </Fragment>
  );
};

export const getServerSideProps = getPreFetchProps;

export default MyProjects;
