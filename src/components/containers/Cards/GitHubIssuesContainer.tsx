import {
  FlexContainer,
  SectionHeaderContainer,
  Text,
  LinkButton,
} from '@/components';
import { REPOSITORY_TAB_CONFIG } from '@/constant';
import type { GitHubIssuesContainerProps } from '@/interfaces';

const GitHubIssuesContainer = ({
  repositories,
  className = '',
}: GitHubIssuesContainerProps) => {
  if (repositories.length === 0) {
    return (
      <div className={`py-8 md:py-16 px-4 md:px-0 ${className}`}>
        <FlexContainer
          direction='col'
          itemCenter
          justifyCenter
          className='gap-4'
        >
          <Text
            className='text-gray-600 text-center text-sm md:text-base'
            level='p'
          >
            No repositories configured yet.
          </Text>
        </FlexContainer>
      </div>
    );
  }

  return (
    <div className={`${className} px-4 md:px-0`}>
      <SectionHeaderContainer
        focusText='Issues'
        heading='Open Source'
        subtext='Browse and contribute to our open source projects. Click on a project to see its open issues on GitHub.'
        className='mb-6 md:mb-8'
      />

      <div className='max-w-7xl mx-auto'>
        <FlexContainer
          direction='col'
          className='gap-6 md:flex-row md:flex-wrap lg:flex-nowrap'
        >
          {repositories.map((repo) => {
            const config =
              REPOSITORY_TAB_CONFIG[
                repo.repo as keyof typeof REPOSITORY_TAB_CONFIG
              ];
            const issuesUrl = `${repo.url}/issues`;

            return (
              <div
                key={repo.repo}
                className='bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 flex-1 md:min-w-[300px] lg:min-w-[350px]'
              >
                <FlexContainer
                  className='gap-4 flex-col md:flex-row h-full'
                  itemCenter={false}
                >
                  <div className='flex-1 flex flex-col'>
                    <FlexContainer className='gap-2 mb-2' itemCenter>
                      <Text className='text-2xl' level='span'>
                        {config?.icon || '📂'}
                      </Text>
                      <Text
                        className='text-xl font-semibold text-gray-900'
                        level='h3'
                      >
                        {config?.displayName || repo.name}
                      </Text>
                    </FlexContainer>

                    <Text
                      className='text-gray-600 mb-3 flex-1'
                      level='p'
                      textCenter
                    >
                      {repo.description}
                    </Text>

                    <FlexContainer className='gap-2 flex-wrap mt-auto'>
                      <span className='px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium'>
                        {repo.language}
                      </span>
                      {repo.topics?.slice(0, 3).map((topic) => (
                        <span
                          key={topic}
                          className='px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs'
                        >
                          {topic}
                        </span>
                      ))}
                    </FlexContainer>
                  </div>

                  <FlexContainer
                    direction='col'
                    className='gap-2 md:min-w-[200px] mt-4 md:mt-0'
                  >
                    <LinkButton
                      buttonProps={{
                        variant: 'PRIMARY',
                        text: 'View Issues',
                        className: 'w-full',
                      }}
                      href={issuesUrl}
                      target='_blank'
                      className='w-full'
                    />
                    <LinkButton
                      buttonProps={{
                        variant: 'OUTLINE',
                        text: 'View Repository',
                        className: 'w-full',
                      }}
                      href={repo.url}
                      target='_blank'
                      className='w-full'
                    />
                  </FlexContainer>
                </FlexContainer>
              </div>
            );
          })}
        </FlexContainer>

        <div className='mt-8 text-center'>
          <Text className='text-gray-600 text-sm' level='p'>
            💡 Look for issues labeled "good first issue" or "help wanted" to
            get started!
          </Text>
        </div>
      </div>
    </div>
  );
};

export default GitHubIssuesContainer;
