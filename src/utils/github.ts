// Simple utility functions for GitHub-related formatting

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
