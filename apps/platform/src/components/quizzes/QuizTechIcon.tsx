import React, { useState } from 'react';

export interface TechMeta {
  type: string;
  category:
    | 'Backend'
    | 'Programming'
    | 'Database'
    | 'Frontend'
    | 'Tools'
    | 'Core Subjects';
  categoryColor: string;
  filterTab: 'Web Development' | 'Programming' | 'Databases' | 'Core Subjects';
  defaultQuestions: number;
  defaultMinutes: number;
  defaultPopularity: string;
}

// Mapping of canonical tech type to simpleicons.org slug or direct icon URL & label
export const TECH_SIMPLE_ICONS: Record<
  string,
  { slug?: string; url?: string; name: string }
> = {
  nodejs: { slug: 'nodedotjs', name: 'Node.js' },
  node: { slug: 'nodedotjs', name: 'Node.js' },
  cpp: { slug: 'cplusplus', name: 'C++' },
  cplusplus: { slug: 'cplusplus', name: 'C++' },
  c: { slug: 'c', name: 'C' },
  sql: { slug: 'mysql', name: 'MySQL' },
  mysql: { slug: 'mysql', name: 'MySQL' },
  postgres: { slug: 'postgresql', name: 'PostgreSQL' },
  postgresql: { slug: 'postgresql', name: 'PostgreSQL' },
  javascript: { slug: 'javascript', name: 'JavaScript' },
  js: { slug: 'javascript', name: 'JavaScript' },
  react: { slug: 'react', name: 'React' },
  reactjs: { slug: 'react', name: 'React' },
  java: {
    url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg',
    name: 'Java',
  },
  openjdk: {
    url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg',
    name: 'Java',
  },
  python: { slug: 'python', name: 'Python' },
  git: { slug: 'git', name: 'Git' },
  github: { slug: 'github', name: 'GitHub' },
  typescript: { slug: 'typescript', name: 'TypeScript' },
  ts: { slug: 'typescript', name: 'TypeScript' },
  mongodb: { slug: 'mongodb', name: 'MongoDB' },
  mongo: { slug: 'mongodb', name: 'MongoDB' },
  docker: { slug: 'docker', name: 'Docker' },
  htmlcss: { slug: 'html5', name: 'HTML5' },
};

export const getTechMeta = (nameOrIcon: string = ''): TechMeta => {
  const lower = nameOrIcon.toLowerCase();

  if (lower.includes('node') || lower.includes('express')) {
    return {
      type: 'nodejs',
      category: 'Backend',
      categoryColor: 'bg-[#E7F8EE] text-[#0F9548]',
      filterTab: 'Web Development',
      defaultQuestions: 20,
      defaultMinutes: 20,
      defaultPopularity: '1.2K',
    };
  }
  if (
    lower.includes('c++') ||
    lower.includes('cpp') ||
    lower.includes('cplusplus')
  ) {
    return {
      type: 'cpp',
      category: 'Programming',
      categoryColor: 'bg-[#EAF3FF] text-[#2F80ED]',
      filterTab: 'Programming',
      defaultQuestions: 25,
      defaultMinutes: 25,
      defaultPopularity: '890',
    };
  }
  if (
    lower === 'c' ||
    lower.includes('c programming') ||
    lower.includes(' c ') ||
    lower.startsWith('c ') ||
    lower.endsWith(' c')
  ) {
    return {
      type: 'c',
      category: 'Programming',
      categoryColor: 'bg-[#EAF3FF] text-[#2F80ED]',
      filterTab: 'Programming',
      defaultQuestions: 20,
      defaultMinutes: 20,
      defaultPopularity: '820',
    };
  }
  if (
    lower.includes('sql') ||
    lower.includes('mysql') ||
    lower.includes('postgres') ||
    lower.includes('dbms')
  ) {
    return {
      type: 'sql',
      category: 'Database',
      categoryColor: 'bg-[#F3EAFF] text-[#8C3BE2]',
      filterTab: 'Databases',
      defaultQuestions: 20,
      defaultMinutes: 20,
      defaultPopularity: '1.1K',
    };
  }
  if (
    lower.includes('javascript') ||
    lower.includes(' js') ||
    lower.startsWith('js')
  ) {
    return {
      type: 'javascript',
      category: 'Frontend',
      categoryColor: 'bg-[#FFF6E5] text-[#D9822B]',
      filterTab: 'Web Development',
      defaultQuestions: 25,
      defaultMinutes: 25,
      defaultPopularity: '1.5K',
    };
  }
  if (lower.includes('react')) {
    return {
      type: 'react',
      category: 'Frontend',
      categoryColor: 'bg-[#FFF6E5] text-[#D9822B]',
      filterTab: 'Web Development',
      defaultQuestions: 20,
      defaultMinutes: 20,
      defaultPopularity: '980',
    };
  }
  if (
    lower.includes('java ') ||
    lower.endsWith('java') ||
    lower === 'java' ||
    lower.includes('java mastery') ||
    lower.includes('openjdk')
  ) {
    return {
      type: 'java',
      category: 'Programming',
      categoryColor: 'bg-[#EAF3FF] text-[#2F80ED]',
      filterTab: 'Programming',
      defaultQuestions: 25,
      defaultMinutes: 25,
      defaultPopularity: '1.3K',
    };
  }
  if (lower.includes('python')) {
    return {
      type: 'python',
      category: 'Programming',
      categoryColor: 'bg-[#EAF3FF] text-[#2F80ED]',
      filterTab: 'Programming',
      defaultQuestions: 20,
      defaultMinutes: 20,
      defaultPopularity: '1.2K',
    };
  }
  if (lower.includes('github')) {
    return {
      type: 'github',
      category: 'Tools',
      categoryColor: 'bg-[#FEEAEA] text-[#EB5757]',
      filterTab: 'Core Subjects',
      defaultQuestions: 20,
      defaultMinutes: 20,
      defaultPopularity: '1.0K',
    };
  }
  if (lower.includes('git')) {
    return {
      type: 'git',
      category: 'Tools',
      categoryColor: 'bg-[#FEEAEA] text-[#EB5757]',
      filterTab: 'Core Subjects',
      defaultQuestions: 20,
      defaultMinutes: 20,
      defaultPopularity: '1.0K',
    };
  }
  if (lower.includes('typescript') || lower.includes(' ts')) {
    return {
      type: 'typescript',
      category: 'Frontend',
      categoryColor: 'bg-[#FFF6E5] text-[#D9822B]',
      filterTab: 'Web Development',
      defaultQuestions: 20,
      defaultMinutes: 20,
      defaultPopularity: '950',
    };
  }
  if (lower.includes('mongo')) {
    return {
      type: 'mongodb',
      category: 'Database',
      categoryColor: 'bg-[#F3EAFF] text-[#8C3BE2]',
      filterTab: 'Databases',
      defaultQuestions: 20,
      defaultMinutes: 20,
      defaultPopularity: '850',
    };
  }
  if (lower.includes('docker') || lower.includes('devops')) {
    return {
      type: 'docker',
      category: 'Tools',
      categoryColor: 'bg-[#FEEAEA] text-[#EB5757]',
      filterTab: 'Core Subjects',
      defaultQuestions: 15,
      defaultMinutes: 15,
      defaultPopularity: '720',
    };
  }
  if (
    lower.includes('dsa') ||
    lower.includes('algorithm') ||
    lower.includes('data structure')
  ) {
    return {
      type: 'dsa',
      category: 'Core Subjects',
      categoryColor: 'bg-[#EEF2FF] text-[#4F46E5]',
      filterTab: 'Core Subjects',
      defaultQuestions: 25,
      defaultMinutes: 25,
      defaultPopularity: '1.6K',
    };
  }
  if (
    lower.includes('html') ||
    lower.includes('css') ||
    lower.includes('web')
  ) {
    return {
      type: 'htmlcss',
      category: 'Frontend',
      categoryColor: 'bg-[#FFF6E5] text-[#D9822B]',
      filterTab: 'Web Development',
      defaultQuestions: 20,
      defaultMinutes: 20,
      defaultPopularity: '1.1K',
    };
  }

  // Default fallback
  return {
    type: 'generic',
    category: 'Programming',
    categoryColor: 'bg-[#EAF3FF] text-[#2F80ED]',
    filterTab: 'Programming',
    defaultQuestions: 20,
    defaultMinutes: 20,
    defaultPopularity: '800',
  };
};

interface QuizTechIconProps {
  nameOrIcon: string;
  className?: string;
}

export const QuizTechIcon: React.FC<QuizTechIconProps> = ({
  nameOrIcon,
  className = 'w-8 h-8',
}) => {
  const [error, setError] = useState(false);

  // If already an absolute image URL, render directly
  if (
    nameOrIcon &&
    (nameOrIcon.startsWith('http://') ||
      nameOrIcon.startsWith('https://') ||
      nameOrIcon.startsWith('data:'))
  ) {
    return (
      <img
        src={nameOrIcon}
        alt='Tech icon'
        className={`${className} object-contain`}
        loading='lazy'
      />
    );
  }

  const meta = getTechMeta(nameOrIcon);
  const iconConfig =
    TECH_SIMPLE_ICONS[meta.type] || TECH_SIMPLE_ICONS[nameOrIcon.toLowerCase()];
  const iconUrl = iconConfig?.url
    ? iconConfig.url
    : iconConfig?.slug
      ? `https://cdn.simpleicons.org/${iconConfig.slug}`
      : meta.type !== 'generic'
        ? `https://cdn.simpleicons.org/${meta.type}`
        : null;

  if (error || !iconUrl) {
    return (
      <div className='w-full h-full rounded-lg bg-red-50 text-[#EF4444] font-extrabold flex items-center justify-center text-xs'>
        {nameOrIcon?.slice(0, 2).toUpperCase() || '💻'}
      </div>
    );
  }

  return (
    <img
      src={iconUrl}
      alt={iconConfig?.name || meta.type}
      className={`${className} object-contain`}
      loading='lazy'
      onError={() => setError(true)}
    />
  );
};
