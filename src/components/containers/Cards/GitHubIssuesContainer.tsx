import { useEffect, useState } from 'react';

import {
  FlexContainer,
  GridContainer,
  LoadingSpinner,
  SectionHeaderContainer,
  Text,
} from '@/components';
import { GitHubIssueCard } from './Items';
import type { GitHubIssue, GitHubRepository } from '@/interfaces';
import { fetchContributorFriendlyIssues } from '@/utils/github';

interface GitHubIssuesContainerProps {
  repositories: GitHubRepository[];
  maxIssuesPerRepo?: number;
  className?: string;
}

const GitHubIssuesContainer = ({
  repositories,
  maxIssuesPerRepo = 6,
  className = '',
}: GitHubIssuesContainerProps) => {
  const [issues, setIssues] = useState<
    Array<{ issue: GitHubIssue; repository: GitHubRepository }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllIssues = async () => {
      try {
        setLoading(true);
        setError(null);

        const allIssuesPromises = repositories.map(async (repo) => {
          const repoIssues = await fetchContributorFriendlyIssues(
            repo,
            maxIssuesPerRepo
          );
          return repoIssues.map((issue) => ({ issue, repository: repo }));
        });

        const allIssuesArrays = await Promise.all(allIssuesPromises);
        const flattenedIssues = allIssuesArrays.flat();

        // Sort by creation date (newest first)
        flattenedIssues.sort(
          (a, b) =>
            new Date(b.issue.created_at).getTime() -
            new Date(a.issue.created_at).getTime()
        );

        setIssues(flattenedIssues);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Error fetching GitHub issues:', err);
        setError('Failed to load GitHub issues. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchAllIssues();
  }, [repositories, maxIssuesPerRepo]);

  if (loading) {
    return (
      <div className={`py-16 ${className}`}>
        <FlexContainer
          direction='col'
          itemCenter
          justifyCenter
          className='gap-4'
        >
          <LoadingSpinner height={8} width={8} className='text-primary' />
          <Text className='text-gray-600' level='p'>
            Loading open issues...
          </Text>
        </FlexContainer>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`py-16 ${className}`}>
        <FlexContainer
          direction='col'
          itemCenter
          justifyCenter
          className='gap-4'
        >
          <Text className='text-red-600 text-center' level='p'>
            {error}
          </Text>
          <button
            onClick={() => window.location.reload()}
            className='bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors'
          >
            Try Again
          </button>
        </FlexContainer>
      </div>
    );
  }

  if (issues.length === 0) {
    return (
      <div className={`py-16 ${className}`}>
        <FlexContainer
          direction='col'
          itemCenter
          justifyCenter
          className='gap-4'
        >
          <Text className='text-gray-600 text-center' level='p'>
            No open issues found at the moment. Check back later!
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
        subtext='Start contributing by picking up any of these open issues. Perfect for beginners and experienced developers alike.'
        className='mb-8'
      />

      <GridContainer className='grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {issues.map(({ issue, repository }) => (
          <GitHubIssueCard
            key={`${repository.repo}-${issue.id}`}
            issue={issue}
            repository={repository}
          />
        ))}
      </GridContainer>

      {issues.length >= maxIssuesPerRepo && (
        <FlexContainer justifyCenter className='mt-8'>
          <Text className='text-gray-600 text-center' level='p'>
            Want to see more issues?{' '}
            <a
              href={`${repositories[0]?.url}/issues`}
              target='_blank'
              rel='noopener noreferrer'
              className='text-primary hover:underline font-medium'
            >
              Visit our GitHub repository
            </a>
          </Text>
        </FlexContainer>
      )}
    </div>
  );
};

export default GitHubIssuesContainer;
