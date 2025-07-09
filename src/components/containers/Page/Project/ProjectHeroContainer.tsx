import {
  Button,
  FlexContainer,
  LinkButton,
  LoginRedirectButton,
  PageHeroMetaContainer,
  Text,
} from '@/components';
import { projectGroupWhatsapp, routes } from '@/constant';
import { useAnalytics, useApi, useGamifiedAction, useUser } from '@/hooks';
import type { ProjectHeroContainerProps } from '@/interfaces';

const ProjectHeroContainer = ({
  id,
  name,
  roadmap,
  difficultyLevel,
  isEnrolled,
}: ProjectHeroContainerProps) => {
  const { user, isAuth } = useUser();
  const { trackEvent } = useAnalytics();
  const gamifiedAction = useGamifiedAction();
  const { makeRequest, loading } = useApi('projects/enrollProject');

  const enrollProject = async () => {
    try {
      await makeRequest({
        method: 'POST',
        url: routes.api.enrollProject,
        body: {
          userId: user?.id,
          projectId: id,
        },
      });

      await gamifiedAction.triggerGamifiedAction({
        gamificationAction: 'ENROLL_PROJECT',
        analytics: {
          action: 'PROJECT_ENROLL',
          category: 'Project',
          label: 'Project Enrolled',
        },
        customMessage: 'Project enrolled! Time to build something amazing!',
        metadata: {
          projectId: id,
          projectName: name,
          roadmap,
          difficultyLevel,
        },
      });

      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error('Failed to enroll in project', error);
    }
  };

  let headerActionButton;

  if (!isAuth) {
    headerActionButton = (
      <FlexContainer>
        <LoginRedirectButton text='Login to Get Started' />
      </FlexContainer>
    );
  } else if (isAuth && !isEnrolled) {
    headerActionButton = (
      <FlexContainer>
        <Button
          text='Enroll to Project'
          variant='PRIMARY'
          onClick={enrollProject}
        />
      </FlexContainer>
    );
  } else if (loading) {
    headerActionButton = (
      <Button isLoading text='Enrolling...' variant='PRIMARY' />
    );
  } else {
    headerActionButton = (
      <FlexContainer
        className='justify-start items-start gap-2'
        itemCenter={false}
        justifyCenter={false}
      >
        <LinkButton
          buttonProps={{
            variant: 'OUTLINE',
            text: 'Ask Question',
          }}
          href={projectGroupWhatsapp}
          target='_blank'
        />
        <LinkButton
          buttonProps={{
            variant: 'GHOST',
            text: 'Back to Projects',
          }}
          href={routes.projectsExplore}
        />
      </FlexContainer>
    );
  }

  return (
    <FlexContainer>
      <FlexContainer className='border gap-4 w-full p-2 justify-between rounded'>
        <FlexContainer
          className='items-start gap-1'
          direction='col'
          itemCenter={false}
        >
          <Text className='heading-4' level='h4'>
            Hello {user?.name ?? 'there'}!
          </Text>
          <Text className='paragraph text-greyDark' level='p'>
            Let's learn something today.
          </Text>
        </FlexContainer>
        <FlexContainer
          className='justify-start items-start gap-3'
          itemCenter={false}
          justifyCenter={false}
        >
          <PageHeroMetaContainer subtitle="YOU'RE BUILDING" title={name} />
          <PageHeroMetaContainer subtitle='ROADMAP' title={roadmap} />
          <PageHeroMetaContainer
            subtitle='DIFFICULTY LEVEL'
            title={difficultyLevel}
          />
        </FlexContainer>
        {headerActionButton}
      </FlexContainer>
    </FlexContainer>
  );
};

export default ProjectHeroContainer;
