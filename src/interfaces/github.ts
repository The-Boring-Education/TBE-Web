// GitHub Repository interface
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
export interface GitHubIssuesContainerProps {
  repositories: GitHubRepository[];
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
