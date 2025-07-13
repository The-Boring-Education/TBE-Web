import type { GitHubRepository } from '@/interfaces';

// The Boring Education Open Source Repositories
export const TBE_REPOSITORIES: GitHubRepository[] = [
  {
    owner: 'The-Boring-Education',
    repo: 'TBE-Web',
    name: 'TBE Web Application',
    description: 'TBE Web Application',
    url: 'https://github.com/The-Boring-Education/TBE-Web',
    language: 'Next.js',
    topics: [
      'React.js',
      'Typescript',
      'Tailwind CSS',
      'MongoDB',
      'Open Source',
    ],
  },
  {
    owner: 'The-Boring-Education',
    repo: 'Prep-Yatra',
    name: 'Prep Yatra',
    description: 'For Interview Preparation',
    url: 'https://github.com/The-Boring-Education/Prep-Yatra',
    language: 'React.js',
    topics: ['Typescript', 'Tailwind CSS', 'Open Source'],
  },
  {
    owner: 'The-Boring-Education',
    repo: 'The-Boring-Agents',
    name: 'The Boring Agents',
    description: 'AI Agent for The Boring Education',
    url: 'https://github.com/The-Boring-Education/The-Boring-Agents',
    language: 'Python',
    topics: ['Langchain', 'Open Source', 'AI Agent'],
  },
];

// Repository display configurations for tabs
export const REPOSITORY_TAB_CONFIG = {
  'TBE-Web': {
    displayName: 'Web App',
    icon: '🌐',
    description: 'Main web application',
  },
  'Prep-Yatra': {
    displayName: 'Prep Yatra',
    icon: '🚗',
    description: 'For Interview Preparation',
  },
  'The-Boring-Agents': {
    displayName: 'The Boring Agents',
    icon: '🤖',
    description: 'AI Agent for The Boring Education',
  },
};

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
  feature: '#0052cc',
  'ui/ux': '#f9d0c4',
  backend: '#5319e7',
  frontend: '#fbca04',
};

// Open source encouragement content
export const OPEN_SOURCE_STATS = [
  {
    number: '500+',
    label: 'Contributors Worldwide',
    icon: '👥',
  },
  {
    number: '1000+',
    label: 'Issues Resolved',
    icon: '✅',
  },
  {
    number: '50+',
    label: 'Active Projects',
    icon: '🚀',
  },
  {
    number: '24/7',
    label: 'Community Support',
    icon: '💬',
  },
];

export const OPEN_SOURCE_BENEFITS = [
  {
    title: 'Learn by Doing',
    description: 'Work on real projects used by thousands of students',
    icon: '📚',
  },
  {
    title: 'Build Your Portfolio',
    description: 'Showcase your contributions to potential employers',
    icon: '💼',
  },
  {
    title: 'Get Mentorship',
    description: 'Learn from experienced developers in our community',
    icon: '🎓',
  },
  {
    title: 'Make Impact',
    description: 'Help democratize tech education in India',
    icon: '🇮🇳',
  },
];
