import { useRouter } from 'next/router';
import { Fragment } from 'react';

import {
  Banner,
  CardContainerB,
  FlexContainer,
  Leaderboard,
  LinkButton,
  LoadingSpinner,
  NotificationContainer,
  Section,
  SEO,
  Text,
} from '@/components';
import { LINKS, routes, STATIC_FILE_PATH } from '@/constant';
import { useApi, useAPIResponseMapper, useUser } from '@/hooks';
import type { PageProps, PrimaryCardWithCTAProps } from '@/interfaces';
import {
  getPreFetchProps,
  mapCourseResponseToCard,
  mapInterviewSheetResponseToCard,
  mapProjectResponseToCard,
  mapUserPlaylistResponseToCard,
} from '@/utils';

const UserDashboard = ({ seoMeta }: PageProps) => {
  const router = useRouter();
  const { user, isAuth, loading: loadingUser } = useUser();

  const { response, loading } = useApi(
    'user-dashboard',
    {
      url: `${routes.api.userDashboard}?userId=${user?.id}`,
    },
    { enabled: !!user?.id }
  );

  const courses: PrimaryCardWithCTAProps[] = useAPIResponseMapper(
    response?.data.enrolledCourses,
    mapCourseResponseToCard
  );

  const projects: PrimaryCardWithCTAProps[] = useAPIResponseMapper(
    response?.data.enrolledProjects,
    mapProjectResponseToCard,
    { isEnrolled: true }
  );

  const interviewSheets: PrimaryCardWithCTAProps[] = useAPIResponseMapper(
    response?.data.enrolledSheets,
    mapInterviewSheetResponseToCard
  );

  const userPlaylist: PrimaryCardWithCTAProps[] = useAPIResponseMapper(
    response?.data.enrolledPlaylists,
    mapUserPlaylistResponseToCard
  );

  if (loadingUser) return;
  if (!isAuth) {
    router.push(routes.home);
    return;
  }

  if (loading) return <LoadingSpinner />;

  const noCourseFoundUI = !courses.length &&
    !projects.length &&
    !interviewSheets.length &&
    !userPlaylist.length && (
      <FlexContainer className='w-screen flex-col justify-center items-center'>
        <Text className='heading-5 mb-3' level='h5'>
          Oops! No Courses, Projects, Interview Sheet or Playlists found.
        </Text>
        <LinkButton
          buttonProps={{ variant: 'PRIMARY', text: 'Go Back To Home' }}
          href={routes.home}
        />
      </FlexContainer>
    );

  return (
    <Fragment>
      <SEO seoMeta={seoMeta} />
      <Section className='md:py-4 px-2'>
        <CardContainerB
          borderColour={2}
          cards={courses
            .concat(projects)
            .concat(interviewSheets)
            .concat(userPlaylist)}
          focusText='Learning Space'
          heading='Your'
          sectionClassName='md:px-2 px-0 py-4'
          subtext='Continue Learning From Where You Left'
        />
        {noCourseFoundUI}
        <Leaderboard />
        <NotificationContainer />
        <Banner
          buttonLink={LINKS.contributeOpenSource}
          buttonText='Start Contributing'
          description='We’re an Open Source Tech Ed Startup. Feel free to contribute to Building Tech Education for Everyone'
          imageSrc={`${STATIC_FILE_PATH.svg}/community.svg`}
          title='Contribute at The Boring Education'
          variant='VARIANT_B'
        />
      </Section>
    </Fragment>
  );
};

export const getServerSideProps = async () => ({
  ...(await getPreFetchProps({ slug: routes.user.dashboard })),
});

export default UserDashboard;
