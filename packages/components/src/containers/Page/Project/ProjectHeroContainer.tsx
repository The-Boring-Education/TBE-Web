import { FaBolt,FaCode, FaRocket } from 'react-icons/fa';

import {
  Button,
  LinkButton,
  LoginRedirectButton,
  Section,
  Text,
} from '@tbe/components';
import { projectGroupWhatsapp, routes } from '@tbe/constants';
import { useAnalytics, useApi, useUser } from '@tbe/hooks';
import { useGamifiedAction } from '@tbe/components';
import type { ProjectHeroContainerProps } from '@tbe/interface';

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

  const getDifficultyColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'beginner': return 'text-green-400';
      case 'intermediate': return 'text-yellow-400';
      case 'advanced': return 'text-red-400';
      default: return 'text-blue-400';
    }
  };

  const getDifficultyIcon = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'beginner': return <FaBolt />;
      case 'intermediate': return <FaRocket />;
      case 'advanced': return <FaCode />;
      default: return <FaCode />;
    }
  };

  let headerActionButton;

  if (!isAuth) {
    headerActionButton = <LoginRedirectButton text='Login to Get Started' />;
  } else if (isAuth && !isEnrolled) {
    headerActionButton = (
      <Button
        text='Enroll to Project'
        variant='PRIMARY'
        onClick={enrollProject}
        className='bg-orange-600 hover:bg-orange-700 text-white px-6 py-2'
      />
    );
  } else if (loading) {
    headerActionButton = (
      <Button 
        isLoading 
        text='Enrolling...' 
        variant='PRIMARY' 
        className='bg-orange-600 hover:bg-orange-700 text-white px-6 py-2'
      />
    );
  }

  return (
    <Section className='bg-gradient-to-r from-orange-600 to-purple-700 text-white'>
      <div className='max-w-7xl mx-auto px-4 py-8'>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 items-center'>
          
          {/* Left: Greeting & Project Info */}
          <div className='lg:col-span-2 space-y-4'>
            {/* Navigation */}
            <div className='flex items-center gap-2 text-purple-200'>
              <LinkButton
                buttonProps={{
                  variant: 'GHOST',
                  text: '← Back to Projects',
                  className: 'text-black ',
                }}
                href={routes.projectsExplore}
              />
              <span>•</span>
              <Text level='p' className='text-sm uppercase tracking-wide'>{roadmap} Track</Text>
            </div>
            
            {/* Welcome Message */}
            <div className='space-y-2'>
              <Text className='text-2xl lg:text-3xl font-bold' level='h2'>
                Hello {user?.name ?? 'there'}! 🚀
              </Text>
              <Text level='p' className='text-purple-100 text-lg'>
                Ready to build something amazing today?
              </Text>
            </div>

            {/* Project Title */}
            <div className='bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20'>
              <Text level='p' className='text-purple-200 text-sm uppercase tracking-wide mb-1'>
                YOU'RE BUILDING
              </Text>
              <Text className='text-xl lg:text-2xl font-bold text-white' level='h3'>
                {name}
              </Text>
            </div>

            {/* Project Stats */}
            <div className='grid grid-cols-2 gap-4'>
              <div className='bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20'>
                <Text level='p' className='text-purple-200 text-xs uppercase tracking-wide mb-1'>
                  ROADMAP
                </Text>
                <Text className='text-white font-semibold' level='p'>
                  {roadmap}
                </Text>
              </div>
              
              <div className='bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20'>
                <Text level='p' className='text-purple-200 text-xs uppercase tracking-wide mb-1'>
                  DIFFICULTY
                </Text>
                <div className='flex items-center gap-2'>
                  <span className={getDifficultyColor(difficultyLevel)}>
                    {getDifficultyIcon(difficultyLevel)}
                  </span>
                  <Text className='text-white font-semibold' level='p'>
                    {difficultyLevel}
                  </Text>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className='flex flex-wrap gap-3 pt-2'>
              {headerActionButton}
              {isEnrolled && (
                <>
                  <LinkButton
                    buttonProps={{
                      variant: 'OUTLINE',
                      text: 'Ask Question',
                      className: 'border-white text-white hover:bg-white hover:text-orange-600',
                    }}
                    href={projectGroupWhatsapp}
                    target='_blank'
                  />
                  <Button
                    text='Project Overview'
                    variant='OUTLINE'
                    className='border-white text-white hover:bg-white hover:text-orange-600'
                    onClick={() => {
                      const contentSection = document.getElementById('project-content');
                      if (contentSection) {
                        contentSection.scrollIntoView({ 
                          behavior: 'smooth',
                          block: 'start'
                        });
                      }
                    }}
                  />
                </>
              )}
            </div>
          </div>

          {/* Right: Progress Card */}
          <div className='lg:col-span-1'>
            <div className='bg-white rounded-lg shadow-xl p-6 text-gray-900'>
              <div className='text-center space-y-3'>
                <div className='w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto'>
                  <FaCode className='text-2xl text-orange-600' />
                </div>
                <Text level='p' className='font-semibold text-lg'>Start Building</Text>
                <Text level='p' className='text-sm text-gray-600'>
                  Begin your project journey with guided steps
                </Text>
                {isEnrolled ? (
                  <Button
                    text='Continue Building'
                    variant='PRIMARY'
                    className='w-full bg-orange-600 hover:bg-orange-700'
                  />
                ) : (
                  <Text level='p' className='text-orange-600 text-sm font-medium'>
                    Enroll to get started
                  </Text>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
};

export default ProjectHeroContainer;
