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
import { getPreFetchProps, mapCourseResponseToCard } from '@/utils';
import { routes } from '@/constant';

const MyCourses = ({ seoMeta }: PageProps) => {
  const session = useSession();
  const router = useRouter();

  const { user } = useUser();

  const userId = user?.id;

  const { response, loading } = useApi(
    'myCourses',
    {
      url: `${routes.api.myCourses}?userId=${userId}`,
    },
    { enabled: !!userId }
  );

  const courses: PrimaryCardWithCTAProps[] = useAPIResponseMapper(
    response?.data,
    mapCourseResponseToCard
  );

  if (session.status === 'loading') return null;
  if (session.status !== 'authenticated') {
    router.push('/');
    return null;
  }

  if (loading) return <LoadingSpinner />;

  const noCourseFoundUI = (!courses || courses.length === 0) && (
    <FlexContainer className='w-screen h-screen flex-col justify-center items-center'>
      <Text level='h1' className='heading-4 mb-3'>
        Oops! No Courses found.
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

export const getServerSideProps = getPreFetchProps;

export default MyCourses;
