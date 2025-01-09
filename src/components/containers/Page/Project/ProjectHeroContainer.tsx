import {
  LinkButton,
  FlexContainer,
  PageHeroMetaContainer,
  Text,
  Button,
  LoginWithGoogleButton,
} from '@/components';
import { projectGroupWhatsapp, routes } from '@/constant';
import { useUser } from '@/hooks';
import useApi from '@/hooks/useApi';
import { ProjectHeroContainerProps } from '@/interfaces';

const ProjectHeroContainer = ({
  id,
  name,
  roadmap,
  difficultyLevel,
  isEnrolled,
}: ProjectHeroContainerProps) => {
  const { user, isAuth } = useUser();
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
      window.location.reload();
    } catch (error) {
      console.error('Failed to enroll in project', error);
    }
  };

  let headerActionButton;

  if (!isAuth) {
    headerActionButton = (
      <FlexContainer>
        <LoginWithGoogleButton text='Login to Get Started' />
      </FlexContainer>
    );
  } else if (isAuth && !isEnrolled) {
    headerActionButton = (
      <FlexContainer>
        <Button
          variant='PRIMARY'
          text='Enroll to Project'
          onClick={enrollProject}
        />
      </FlexContainer>
    );
  } else if (loading) {
    headerActionButton = (
      <Button variant='PRIMARY' text='Enrolling...' isLoading={true} />
    );
  } else {
    headerActionButton = (
      <FlexContainer
        justifyCenter={false}
        itemCenter={false}
        className='justify-start items-start gap-2'
      >
        <LinkButton
          href={projectGroupWhatsapp}
          target='_blank'
          buttonProps={{
            variant: 'OUTLINE',
            text: 'Ask Question',
          }}
        />
        <LinkButton
          href={routes.projectsExplore}
          buttonProps={{
            variant: 'GHOST',
            text: 'Back to Projects',
          }}
        />
      </FlexContainer>
    );
  }

  return (
    <FlexContainer>
      <FlexContainer className='border gap-4 w-full p-2 justify-between rounded'>
        <FlexContainer
          itemCenter={false}
          direction='col'
          className='items-start gap-1'
        >
          <Text level='h4' className='heading-4'>
            Hello {user?.name ?? 'there'}!
          </Text>
          <Text level='p' className='paragraph text-greyDark'>
            Let's learn something today.
          </Text>
        </FlexContainer>
        <FlexContainer
          justifyCenter={false}
          itemCenter={false}
          className='justify-start items-start gap-3'
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
