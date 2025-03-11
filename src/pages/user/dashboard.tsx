import { Fragment } from 'react';
import { useRouter } from 'next/router';
import { PageProps, PrimaryCardWithCTAProps } from '@/interfaces';
import {
  CardContainerB,
  LoadingSpinner,
  FlexContainer,
  Text,
  LinkButton,
  SEO,
  Section,
  Banner,
  NotificationContainer,
} from '@/components';
import { useAPIResponseMapper, useApi, useUser } from '@/hooks';
import {
  getPreFetchProps,
  mapCourseResponseToCard,
  mapInterviewSheetResponseToCard,
  mapProjectResponseToCard,
  mapUserPlaylistResponseToCard,
} from '@/utils';
import { LINKS, routes, STATIC_FILE_PATH } from '@/constant';

const MyCourses = ({ seoMeta }: PageProps) => {
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
      <FlexContainer className='w-screen h-screen flex-col justify-center items-center'>
        <Text level='h1' className='heading-4 mb-3'>
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
          heading='Your'
          focusText='Learning Space'
          cards={courses
            .concat(projects)
            .concat(interviewSheets)
            .concat(userPlaylist)}
          borderColour={2}
          subtext='Continue Learning From Where You Left'
          sectionClassName='md:px-2 px-0 py-4'
        />
        {noCourseFoundUI}
        <NotificationContainer />
        <Banner
          title='Contribute at The Boring Education'
          description='We’re an Open Source Tech Ed Startup. Feel free to contribute to Building Tech Education for Everyone'
          buttonText='Start Contributing'
          buttonLink={LINKS.contributeOpenSource}
          imageSrc={`${STATIC_FILE_PATH.svg}/community.svg`}
          variant='VARIANT_B'
        />
      </Section>
    </Fragment>
  );
};

export const getServerSideProps = getPreFetchProps;

export default MyCourses;
