// GitHub API interfaces
export interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  body: string;
  state: 'open' | 'closed';
  html_url: string;
  created_at: string;
  updated_at: string;
  labels: GitHubLabel[];
  user: {
    login: string;
    avatar_url: string;
    html_url: string;
  };
  assignees: GitHubUser[];
  comments: number;
}

export interface GitHubLabel {
  id: number;
  name: string;
  color: string;
  description?: string;
}

export interface GitHubUser {
  login: string;
  avatar_url: string;
  html_url: string;
}

export interface GitHubRepository {
  owner: string;
  repo: string;
  name: string;
  description: string;
  url: string;
  language?: string;
  topics?: string[];
}

// Component interfaces for new tab-based structure
export interface RepositoryTabBarProps {
  repositories: GitHubRepository[];
  activeRepository: GitHubRepository;
  onRepositoryChange: (repository: GitHubRepository) => void;
}

export interface IssuesTableProps {
  issues: GitHubIssue[];
  repository: GitHubRepository;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

export interface GitHubIssuesContainerProps {
  repositories: GitHubRepository[];
  maxIssuesPerRepo?: number;
  className?: string;
}

export interface OpenSourceStatsProps {
  stats: Array<{
    number: string;
    label: string;
    icon: string;
  }>;
}

export interface OpenSourceBenefitsProps {
  benefits: Array<{
    title: string;
    description: string;
    icon: string;
  }>;
}

// Legacy interfaces (keeping for backward compatibility)
export interface GitHubIssueCardProps {
  issue: GitHubIssue;
  repository: GitHubRepository;
}

export interface OpenSourceRepoCardProps {
  repository: GitHubRepository;
  issuesCount: number;
  onViewIssues: () => void;
}
