import { useCallback, useEffect, useState } from 'react';

import { FlexContainer, SectionHeaderContainer, Text } from '@/components';
import { IssuesTable, RepositoryTabBar } from '@/components';
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
  const [activeRepository, setActiveRepository] = useState<GitHubRepository>(
    repositories[0]
  );
  const [issues, setIssues] = useState<GitHubIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIssuesForRepository = useCallback(
    async (repository: GitHubRepository) => {
      try {
        setLoading(true);
        setError(null);

        const repoIssues = await fetchContributorFriendlyIssues(
          repository,
          maxIssuesPerRepo
        );

        // Sort by creation date (newest first)
        repoIssues.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        setIssues(repoIssues);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Error fetching GitHub issues:', err);
        setError('Failed to load GitHub issues. Please try again later.');
      } finally {
        setLoading(false);
      }
    },
    [maxIssuesPerRepo]
  );

  const handleRepositoryChange = useCallback(
    (repository: GitHubRepository) => {
      setActiveRepository(repository);
      fetchIssuesForRepository(repository);
    },
    [fetchIssuesForRepository]
  );

  const handleRetry = useCallback(() => {
    fetchIssuesForRepository(activeRepository);
  }, [activeRepository, fetchIssuesForRepository]);

  useEffect(() => {
    if (repositories.length > 0) {
      fetchIssuesForRepository(activeRepository);
    }
  }, [repositories, activeRepository, fetchIssuesForRepository]);

  if (repositories.length === 0) {
    return (
      <div className={`py-16 ${className}`}>
        <FlexContainer
          direction='col'
          itemCenter
          justifyCenter
          className='gap-4'
        >
          <Text className='text-gray-600 text-center' level='p'>
            No repositories configured yet.
          </Text>
        </FlexContainer>
      </div>
    );
  }

  return (
    <div className={className}>
      <SectionHeaderContainer
        focusText='Issues'
        heading='Open Source'
        subtext='Browse and contribute to our open source projects. Click on any repository tab to see its open issues.'
        className='mb-8'
      />

      <div className='max-w-7xl mx-auto'>
        <RepositoryTabBar
          repositories={repositories}
          activeRepository={activeRepository}
          onRepositoryChange={handleRepositoryChange}
        />

        <IssuesTable
          issues={issues}
          repository={activeRepository}
          loading={loading}
          error={error}
          onRetry={handleRetry}
        />
      </div>
    </div>
  );
};

export default GitHubIssuesContainer;
