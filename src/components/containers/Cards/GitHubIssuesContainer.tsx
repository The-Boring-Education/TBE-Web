import { useCallback, useEffect, useState } from 'react';

import {
  FlexContainer,
  IssuesTable,
  SectionHeaderContainer,
  TabComponent,
  Text,
} from '@/components';
import { REPOSITORY_TAB_CONFIG } from '@/constant';
import type {
  GitHubIssue,
  GitHubIssuesContainerProps,
  GitHubRepository,
} from '@/interfaces';
import { fetchContributorFriendlyIssues } from '@/utils/github';

const GitHubIssuesContainer = ({
  repositories,
  maxIssuesPerRepo = 10,
  className = '',
}: GitHubIssuesContainerProps) => {
  const [repositoryIssues, setRepositoryIssues] = useState<
    Record<
      string,
      {
        issues: GitHubIssue[];
        loading: boolean;
        error: string | null;
      }
    >
  >({});

  const fetchIssuesForRepository = useCallback(
    async (repository: GitHubRepository) => {
      const repoKey = repository.repo;

      // Set loading state
      setRepositoryIssues((prev) => ({
        ...prev,
        [repoKey]: { issues: [], loading: true, error: null },
      }));

      try {
        const repoIssues = await fetchContributorFriendlyIssues(
          repository,
          maxIssuesPerRepo
        );

        // Sort by creation date (newest first)
        repoIssues.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        setRepositoryIssues((prev) => ({
          ...prev,
          [repoKey]: { issues: repoIssues, loading: false, error: null },
        }));
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Error fetching GitHub issues:', err);
        setRepositoryIssues((prev) => ({
          ...prev,
          [repoKey]: {
            issues: [],
            loading: false,
            error: 'Failed to load GitHub issues. Please try again later.',
          },
        }));
      }
    },
    [maxIssuesPerRepo]
  );

  // Initialize first repository on mount
  useEffect(() => {
    if (repositories.length > 0) {
      fetchIssuesForRepository(repositories[0]);
    }
  }, [repositories, fetchIssuesForRepository]);

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

  // Prepare tab labels with icons
  const tabLabels = repositories.map((repo) => {
    const config =
      REPOSITORY_TAB_CONFIG[repo.repo as keyof typeof REPOSITORY_TAB_CONFIG];
    return `${config?.icon || '📂'} ${config?.displayName || repo.name}`;
  });

  // Prepare tab panels with IssuesTable for each repository
  const tabPanels = repositories.map((repo, index) => {
    const repoKey = repo.repo;
    const repoData = repositoryIssues[repoKey] || {
      issues: [],
      loading: true,
      error: null,
    };

    // Lazy load issues when tab is accessed
    if (!repositoryIssues[repoKey] && index > 0) {
      fetchIssuesForRepository(repo);
    }

    return (
      <IssuesTable
        key={repoKey}
        issues={repoData.issues}
        repository={repo}
        loading={repoData.loading}
        error={repoData.error}
        onRetry={() => fetchIssuesForRepository(repo)}
      />
    );
  });

  return (
    <div className={`${className} px-4 md:px-0`}>
      <SectionHeaderContainer
        focusText='Issues'
        heading='Open Source'
        subtext='Browse and contribute to our open source projects. Select a project to see its open issues.'
        className='mb-6 md:mb-8'
      />

      <div className='max-w-7xl mx-auto'>
        <TabComponent tabLabels={tabLabels} tabPanels={tabPanels} vertical />
      </div>
    </div>
  );
};

export default GitHubIssuesContainer;
