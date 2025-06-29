import type { GitHubRepository } from '@/interfaces';

// The Boring Education Open Source Repositories
export const TBE_REPOSITORIES: GitHubRepository[] = [
  {
    owner: 'The-Boring-Education',
    repo: 'TBE-Web',
    name: 'TBE Web Application',
    description: 'Building Open Source Tech Education App For 🇮🇳',
    url: 'https://github.com/The-Boring-Education/TBE-Web',
    language: 'TypeScript',
    topics: ['nextjs', 'react', 'typescript', 'education', 'open-source'],
  },
];

// GitHub API Configuration
export const GITHUB_CONFIG = {
  BASE_URL: 'https://api.github.com',
  HEADERS: {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'TBE-WebApp',
  },
};

// Issue labels that we want to highlight for contributors
export const CONTRIBUTOR_FRIENDLY_LABELS = [
  'good first issue',
  'help wanted',
  'beginner friendly',
  'hacktoberfest',
  'documentation',
  'bug',
  'enhancement',
];

// Issue state colors for UI
export const ISSUE_COLORS = {
  open: '#28a745',
  closed: '#cb2431',
};

// Label color mapping for common labels
export const LABEL_COLOR_MAP: Record<string, string> = {
  'good first issue': '#7057ff',
  'help wanted': '#008672',
  bug: '#d73a49',
  enhancement: '#a2eeef',
  documentation: '#0075ca',
  'beginner friendly': '#7057ff',
  hacktoberfest: '#ff6b35',
};
