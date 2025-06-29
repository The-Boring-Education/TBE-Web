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

// Component interfaces
export interface GitHubIssueCardProps {
  issue: GitHubIssue;
  repository: GitHubRepository;
}

export interface GitHubIssuesContainerProps {
  repository: GitHubRepository;
  maxIssues?: number;
}

export interface OpenSourceRepoCardProps {
  repository: GitHubRepository;
  issuesCount: number;
  onViewIssues: () => void;
}
