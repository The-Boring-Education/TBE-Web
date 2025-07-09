import { GITHUB_CONFIG } from '@/constant';
import type { GitHubIssue, GitHubRepository } from '@/interfaces';

// Fetch GitHub issues for a repository
export const fetchGitHubIssues = async (
  repository: GitHubRepository,
  options: {
    state?: 'open' | 'closed' | 'all';
    labels?: string;
    per_page?: number;
    page?: number;
  } = {}
): Promise<GitHubIssue[]> => {
  const { owner, repo } = repository;
  const { state = 'open', labels = '', per_page = 10, page = 1 } = options;

  const queryParams = new URLSearchParams({
    state,
    per_page: per_page.toString(),
    page: page.toString(),
    sort: 'created',
    direction: 'desc',
  });

  if (labels) {
    queryParams.append('labels', labels);
  }

  const url = `${GITHUB_CONFIG.BASE_URL}/repos/${owner}/${repo}/issues?${queryParams}`;

  try {
    const response = await fetch(url, {
      headers: GITHUB_CONFIG.HEADERS,
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const issues: GitHubIssue[] = await response.json();

    // Filter out pull requests (GitHub API returns PRs as issues)
    return issues.filter((issue) => !issue.html_url.includes('/pull/'));
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching GitHub issues:', error);
    return [];
  }
};

// Fetch repository information
export const fetchRepositoryInfo = async (
  owner: string,
  repo: string
): Promise<any> => {
  const url = `${GITHUB_CONFIG.BASE_URL}/repos/${owner}/${repo}`;

  try {
    const response = await fetch(url, {
      headers: GITHUB_CONFIG.HEADERS,
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching repository info:', error);
    return null;
  }
};

// Get contributor-friendly issues
export const fetchContributorFriendlyIssues = async (
  repository: GitHubRepository,
  maxIssues = 6
): Promise<GitHubIssue[]> => {
  // First try to get good first issues
  let issues = await fetchGitHubIssues(repository, {
    labels: 'good first issue',
    per_page: maxIssues,
  });

  // If not enough good first issues, get help wanted issues
  if (issues.length < maxIssues) {
    const helpWanted = await fetchGitHubIssues(repository, {
      labels: 'help wanted',
      per_page: maxIssues - issues.length,
    });
    issues = [...issues, ...helpWanted];
  }

  // If still not enough, get general open issues
  if (issues.length < maxIssues) {
    const generalIssues = await fetchGitHubIssues(repository, {
      per_page: maxIssues - issues.length,
    });
    issues = [...issues, ...generalIssues];
  }

  // Remove duplicates and limit to maxIssues
  const uniqueIssues = issues.filter(
    (issue, index, self) => index === self.findIndex((i) => i.id === issue.id)
  );

  return uniqueIssues.slice(0, maxIssues);
};

// Format issue creation date
export const formatIssueDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return '1 day ago';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  } else {
    const months = Math.floor(diffDays / 30);
    return `${months} month${months > 1 ? 's' : ''} ago`;
  }
};

// Get label color
export const getLabelColor = (labelName: string): string => {
  const commonColors: Record<string, string> = {
    'good first issue': '#7057ff',
    'help wanted': '#008672',
    bug: '#d73a49',
    enhancement: '#a2eeef',
    documentation: '#0075ca',
    'beginner friendly': '#7057ff',
    hacktoberfest: '#ff6b35',
  };

  return commonColors[labelName.toLowerCase()] || '#6b7280';
};
