import {
  Button,
  FlexContainer,
  LinkButton,
  LoginRedirectButton,
  PageHeroMetaContainer,
  Text,
} from '@/components';
import { routes } from '@/constant';
import { useAnalytics, useUser } from '@/hooks';
import { useApi } from '@/hooks';
import type { CourseHeroContainerProps } from '@/interfaces';

const CourseHeroContainer = ({
  id,
  name,
  isEnrolled,
  isPremium,
}: CourseHeroContainerProps) => {
  const { user, isAuth } = useUser();
  const { trackEvent } = useAnalytics();

  const { makeRequest, loading } = useApi('shiksha/enrollCourse');

  const enrollCourse = () => {
    makeRequest({
      method: 'POST',
      url: routes.api.enrollCourse,
      body: {
        userId: user?.id,
        courseId: id,
      },
    })
      .then(() => {
        trackEvent({
          action: 'COURSE_ENROLL',
          category: 'User',
          label: 'Course Enrolled',
          value: {
            userId: user?.id,
            courseId: id,
          },
        });

        window.location.reload();
      })
      .catch((error) => {
        console.error('Failed to enroll', error);
      });
  };

  let headerActionButton;

  if (!isAuth) {
    headerActionButton = (
      <FlexContainer>
        <LoginRedirectButton text='Login to Get Started' />
      </FlexContainer>
    );
  } else if (isAuth && !isEnrolled && !isPremium) {
    headerActionButton = (
      <FlexContainer>
        <Button
          text='Enroll to Course'
          variant='PRIMARY'
          onClick={enrollCourse}
        />
      </FlexContainer>
    );
  }

  if (loading) {
    headerActionButton = (
      <Button isLoading={true} text='Enrolling...' variant='PRIMARY' />
    );
  }

  return (
    <FlexContainer>
      <FlexContainer className='border md:w-4/5 gap-4 w-full p-2 justify-between rounded'>
        <FlexContainer
          className='items-start gap-1'
          direction='col'
          itemCenter={false}
        >
          <Text className='heading-4' level='h4'>
            Hello {user?.name ?? 'there'}!
          </Text>
          <Text className='paragraph text-greyDark' level='p'>
            Let's Learn Something Today.
          </Text>
        </FlexContainer>
        <FlexContainer
          className='justify-start items-start gap-3'
          itemCenter={false}
          justifyCenter={false}
        >
          <PageHeroMetaContainer subtitle="YOU'RE LEARNING" title={name} />
        </FlexContainer>
        <FlexContainer className='gap-2'>
          {headerActionButton}
          <LinkButton
            buttonProps={{
              variant: 'GHOST',
              text: 'Back to Course',
            }}
            href={routes.shikshaExplore}
          />
        </FlexContainer>
      </FlexContainer>
    </FlexContainer>
  );
};

export default CourseHeroContainer;
