import type { BaseUser, OnboardingProductConfig } from '@tbe/types';

// Helper to create field configurations
const createField = (
  name: string,
  label: string,
  type: 'text' | 'select' | 'multiselect' | 'tel' | 'email' | 'url' | 'textarea' | 'checkbox',
  step: number,
  options?: {
    required?: boolean;
    placeholder?: string;
    checkAvailability?: boolean;
    options?: Array<{ value: string; label: string }>;
    validation?: Record<string, unknown>;
    prefill?: {
      fromUser: (user: BaseUser) => unknown;
      defaultValue?: unknown;
    };
  }
) => ({
  name,
  label,
  type,
  step,
  required: options?.required ?? true,
  placeholder: options?.placeholder,
  checkAvailability: options?.checkAvailability,
  options: options?.options,
  validation: options?.validation,
  prefill: options?.prefill,
});

// TBE Platform Onboarding Configurations
export const ONBOARDING_CONFIGS: Record<string, OnboardingProductConfig> = {
  platform: {
    id: 'platform',
    name: 'TBE Platform',
    description: 'Main TBE platform onboarding',
    fields: [
      createField('userName', 'Username', 'text', 1, {
        placeholder: 'Enter your username',
        checkAvailability: true,
        prefill: {
          fromUser: (user: BaseUser) => user.userName || '',
        },
      }),
      createField('occupation', 'Occupation', 'select', 2, {
        placeholder: 'Select your occupation',
        options: [
          { value: 'TECH_STUDENT', label: 'Tech Student' },
          { value: 'WORKING_PROFESSIONAL', label: 'Working Professional' },
          { value: 'ENTREPRENEUR', label: 'Entrepreneur' },
          { value: 'OTHER', label: 'Other' },
        ],
        prefill: {
          fromUser: (user: BaseUser) => user.occupation || '',
        },
      }),
      createField('purpose', 'Purpose', 'multiselect', 3, {
        placeholder: 'Select your purpose(s)',
        options: [
          { value: 'BUILDING_PROJECTS', label: 'Building Projects' },
          { value: 'LEARNING', label: 'Learning' },
          { value: 'NETWORKING', label: 'Networking' },
          { value: 'JOB_SEARCH', label: 'Job Search' },
        ],
        prefill: {
          fromUser: (user: BaseUser) => user.purpose || [],
        },
      }),
      createField('contactNo', 'Contact Number', 'tel', 4, {
        placeholder: '+91 9876543210',
        prefill: {
          fromUser: (user: BaseUser) => user.contactNo || '',
        },
      }),
    ],
    api: {
      endpoint: (userId: string) => `/user/onboarding?userId=${userId}`,
      method: 'POST',
      transformPayload: (form: unknown, _userId: string, from?: string) => {
        const f = form as Record<string, unknown>;
        return {
          userName: f.userName,
          occupation: f.occupation,
          purpose: f.purpose,
          contactNo: f.contactNo,
          ...(from ? { from } : {}),
        };
      },
    },
    ui: {
      variant: 'platform',
      branding: {
        title: 'Welcome to The Boring Education!',
        subtitle: "Let's start your tech journey.",
      },
    },
  },

  'prep-yatra': {
    id: 'prep-yatra',
    name: 'Prep Yatra',
    description: 'Career navigation platform onboarding',
    fields: [
      createField('name', 'Full Name', 'text', 1, {
        placeholder: 'Enter your full name',
        prefill: {
          fromUser: (user: BaseUser) => user.name || '',
        },
      }),
      createField('username', 'Username', 'text', 2, {
        placeholder: 'Choose a username',
        checkAvailability: true,
        prefill: {
          fromUser: (user: BaseUser) => user.userName || '',
        },
      }),
      createField('goal', 'Career Goal Timeline', 'select', 3, {
        placeholder: 'Select your goal timeline',
        options: [
          { value: '3_months', label: '3 Months' },
          { value: '6_months', label: '6 Months' },
          { value: '1_year', label: '1 Year' },
        ],
      }),
      createField('targetCompanies', 'Target Company Types', 'multiselect', 4, {
        placeholder: 'Select target company types',
        options: [
          { value: 'startup', label: 'Startup' },
          { value: 'mnc', label: 'MNC' },
          { value: 'faang', label: 'FAANG' },
          { value: 'midsize', label: 'Mid-Size' },
        ],
      }),
      createField('preferredCategories', 'Interview Categories', 'multiselect', 5, {
        placeholder: 'Select preferred interview categories',
        options: [
          { value: 'mnc', label: 'MNC Interviews' },
          { value: 'mern', label: 'MERN Stack' },
          { value: 'placement', label: 'College Placement' },
          { value: 'dsa', label: 'Data Structures & Algorithms' },
          { value: 'system_design', label: 'System Design' },
          { value: 'general', label: 'General Tech' },
        ],
      }),
      createField('experienceLevel', 'Experience Level', 'select', 6, {
        placeholder: 'Select your experience level',
        options: [
          { value: 'fresher', label: 'Fresher (0-1 yr)' },
          { value: 'junior', label: 'Junior (1-3 yr)' },
          { value: 'mid', label: 'Mid (3-5 yr)' },
          { value: 'senior', label: 'Senior (5+ yrs)' },
        ],
      }),
      createField('linkedInUrl', 'LinkedIn URL', 'url', 7, {
        required: false,
        placeholder: 'Paste your LinkedIn profile URL',
      }),
      createField('githubUrl', 'GitHub URL', 'url', 7, {
        required: false,
        placeholder: 'Paste your GitHub profile URL',
      }),
      createField('leetCodeUrl', 'LeetCode URL', 'url', 7, {
        required: false,
        placeholder: 'Paste your LeetCode profile URL',
      }),
    ],
    api: {
      endpoint: () => `/prepyatra/onboarding`,
      method: 'POST',
      transformPayload: (form: unknown, userId: string, from?: string) => {
        const f = form as Record<string, unknown>;
        return {
          userId,
          name: f.name,
          username: f.username,
          goal: f.goal,
          targetCompanies: f.targetCompanies,
          preferredCategories: f.preferredCategories,
          experienceLevel: f.experienceLevel,
          ...(f.linkedInUrl ? { linkedInUrl: f.linkedInUrl } : {}),
          ...(f.githubUrl ? { githubUrl: f.githubUrl } : {}),
          ...(f.leetCodeUrl ? { leetCodeUrl: f.leetCodeUrl } : {}),
          ...(from ? { from } : {}),
        };
      },
    },
    ui: {
      variant: 'prep-yatra',
      branding: {
        title: 'Welcome to Prep Yatra!',
        subtitle: 'Navigate your career journey',
      },
    },
  },

  quizes: {
    id: 'quizes',
    name: 'Quiz Platform',
    description: 'Quiz platform onboarding',
    fields: [
      createField('username', 'Username', 'text', 1, {
        placeholder: 'Choose a username',
        checkAvailability: true,
        prefill: {
          fromUser: (user: BaseUser) => user.userName || '',
        },
      }),
      createField('interests', 'Learning Interests', 'multiselect', 2, {
        placeholder: 'Select your interests',
        options: [
          { value: 'web_dev', label: 'Web Development' },
          { value: 'mobile_dev', label: 'Mobile Development' },
          { value: 'data_science', label: 'Data Science' },
          { value: 'ai_ml', label: 'AI/Machine Learning' },
          { value: 'devops', label: 'DevOps' },
          { value: 'cybersecurity', label: 'Cybersecurity' },
        ],
      }),
      createField('skillLevel', 'Current Skill Level', 'select', 3, {
        placeholder: 'Select your skill level',
        options: [
          { value: 'beginner', label: 'Beginner' },
          { value: 'intermediate', label: 'Intermediate' },
          { value: 'advanced', label: 'Advanced' },
        ],
      }),
    ],
    api: {
      endpoint: (userId: string) => `/quiz/onboarding?userId=${userId}`,
      method: 'POST',
      transformPayload: (form: unknown, userId: string, from?: string) => {
        const f = form as Record<string, unknown>;
        return {
          userId,
          username: f.username,
          interests: f.interests,
          skillLevel: f.skillLevel,
          ...(from ? { from } : {}),
        };
      },
    },
    ui: {
      variant: 'quizes',
      branding: {
        title: 'Welcome to TBE Quizes!',
        subtitle: 'Test and improve your skills',
      },
    },
  },

  onboarding: {
    id: 'onboarding',
    name: 'General Onboarding',
    description: 'General TBE onboarding flow',
    fields: [
      createField('name', 'Full Name', 'text', 1, {
        placeholder: 'Enter your full name',
        prefill: {
          fromUser: (user: BaseUser) => user.name || '',
        },
      }),
      createField('email', 'Email Address', 'email', 1, {
        placeholder: 'Enter your email',
        prefill: {
          fromUser: (user: BaseUser) => user.email || '',
        },
      }),
      createField('username', 'Username', 'text', 2, {
        placeholder: 'Choose a unique username',
        checkAvailability: true,
      }),
      createField('interests', 'Learning Interests', 'select', 2, {
        placeholder: 'What interests you most?',
        options: [
          { value: 'web-dev', label: 'Web Development' },
          { value: 'data-science', label: 'Data Science' },
          { value: 'mobile-dev', label: 'Mobile Development' },
          { value: 'devops', label: 'DevOps' },
          { value: 'ai-ml', label: 'AI/Machine Learning' },
        ],
      }),
      createField('experience', 'Experience Level', 'select', 3, {
        placeholder: 'Select your experience level',
        options: [
          { value: 'beginner', label: 'Beginner (0-1 years)' },
          { value: 'intermediate', label: 'Intermediate (1-3 years)' },
          { value: 'advanced', label: 'Advanced (3+ years)' },
        ],
      }),
      createField('goals', 'Learning Goals', 'textarea', 3, {
        placeholder: 'What do you want to achieve?',
        required: false,
      }),
    ],
    api: {
      endpoint: () => `/onboarding/complete`,
      method: 'POST',
      transformPayload: (form: unknown, userId: string, from?: string) => {
        const f = form as Record<string, unknown>;
        return {
          userId,
          name: f.name,
          email: f.email,
          username: f.username,
          interests: f.interests,
          experience: f.experience,
          goals: f.goals,
          ...(from ? { from } : {}),
        };
      },
    },
    ui: {
      variant: 'onboarding',
      branding: {
        title: 'Welcome to TBE!',
        subtitle: "Let's set up your learning profile",
      },
    },
  },

  dsayatra: {
    id: 'dsayatra',
    name: 'DSA Yatra',
    description: 'DSA preparation platform onboarding',
    fields: [
      createField('name', 'Full Name', 'text', 1, {
        placeholder: 'Enter your full name',
        prefill: {
          fromUser: (user: BaseUser) => user.name || '',
        },
      }),
      createField('username', 'Username', 'text', 2, {
        placeholder: 'Choose a username',
        checkAvailability: true,
        prefill: {
          fromUser: (user: BaseUser) => user.userName || '',
        },
      }),
      createField('preferredLanguage', 'Preferred Language', 'select', 3, {
        placeholder: 'Select your preferred language',
        options: [
          { value: 'C++', label: 'C++' },
          { value: 'Java', label: 'Java' },
          { value: 'Python', label: 'Python' },
          { value: 'JavaScript', label: 'JavaScript' },
        ],
        prefill: {
          fromUser: (user: BaseUser) => user.dsaYatra?.preferredLanguage || '',
        },
      }),
      createField('timeline', 'Choose your timeline', 'select', 4, {
        placeholder: 'Select your timeline',
        options: [
          { value: '2-3 months', label: '2-3 months' },
          { value: '4-6 months', label: '4-6 months' },
          { value: '8-12 months', label: '8-12 months' },
        ],
        prefill: {
          fromUser: (user: BaseUser) => user.dsaYatra?.timeline || '',
        },
      }),
      createField('experienceLevel', 'Experience Level', 'select', 5, {
        placeholder: 'Select your experience level',
        options: [
          { value: 'Fresher (0-1 yr)', label: 'Fresher (0-1 yr)' },
          { value: 'Junior (1-3 yr)', label: 'Junior (1-3 yr)' },
          { value: 'Mid (3-5 yr)', label: 'Mid (3-5 yr)' },
          { value: 'Senior (5+ yrs)', label: 'Senior (5+ yrs)' },
        ],
        prefill: {
          fromUser: (user: BaseUser) => user.dsaYatra?.experienceLevel || '',
        },
      }),
      createField('target', 'Choose your target', 'select', 6, {
        placeholder: 'Select target',
        options: [
          { value: 'Product-based', label: 'Product-based' },
          { value: 'Startups', label: 'Startups' },
        ],
        prefill: {
          fromUser: (user: BaseUser) => user.dsaYatra?.target || '',
        },
      }),
      createField('targetTopics', 'Target DSA Topics', 'multiselect', 7, {
        placeholder: 'Select topics you want to focus on',
        options: [
          { value: 'ARRAY', label: 'Array' },
          { value: 'HASHMAP', label: 'Hashmap' },
          { value: 'TWO_POINTERS', label: 'Two pointers' },
          { value: 'SLIDING_WINDOW', label: 'Sliding window' },
          { value: 'BINARY_SEARCH', label: 'Binary search' },
          { value: 'LINKED_LIST', label: 'Linked list' },
          { value: 'STACK', label: 'Stack' },
          { value: 'QUEUE', label: 'Queue' },
          { value: 'TREE', label: 'Tree' },
          { value: 'GRAPH', label: 'Graph' },
          { value: 'DYNAMIC_PROGRAMMING', label: 'Dynamic programming' },
          { value: 'GREEDY', label: 'Greedy' },
          { value: 'STRING', label: 'String' },
          { value: 'MATH', label: 'Math' },
          { value: 'BIT_MANIPULATION', label: 'Bit manipulation' },
        ],
        prefill: {
          fromUser: (user: BaseUser) => user.dsaYatra?.targetTopics || [],
        },
      }),
      createField('linkedInUrl', 'LinkedIn URL', 'url', 8, {
        required: false,
        placeholder: 'Paste your LinkedIn profile URL',
        prefill: {
          fromUser: (user: BaseUser) => user.linkedInUrl || '',
        },
      }),
      createField('githubUrl', 'GitHub URL', 'url', 8, {
        required: false,
        placeholder: 'Paste your GitHub profile URL',
        prefill: {
          fromUser: (user: BaseUser) => user.githubUrl || '',
        },
      }),
      createField('leetCodeUrl', 'LeetCode URL', 'url', 8, {
        required: false,
        placeholder: 'Paste your LeetCode profile URL',
        prefill: {
          fromUser: (user: BaseUser) => user.leetCodeUrl || '',
        },
      }),
    ],
    api: {
      endpoint: () => `/dsayatra/onboarding`,
      method: 'POST',
      transformPayload: (form: unknown, userId: string, from?: string) => {
        const f = form as Record<string, unknown>;
        return {
          userId,
          name: f.name,
          username: f.username,
          preferredLanguage: f.preferredLanguage,
          timeline: f.timeline,
          experienceLevel: f.experienceLevel,
          target: f.target,
          targetTopics: f.targetTopics,
          ...(f.linkedInUrl ? { linkedInUrl: f.linkedInUrl } : {}),
          ...(f.githubUrl ? { githubUrl: f.githubUrl } : {}),
          ...(f.leetCodeUrl ? { leetCodeUrl: f.leetCodeUrl } : {}),
          ...(from ? { from } : {}),
        };
      },
    },
    ui: {
      variant: 'prep-yatra',
      branding: {
        title: 'Welcome to DSA Yatra!',
        subtitle: 'Master Data Structures and Algorithms',
      },
    },
  },

  oncampus: {
    id: 'oncampus',
    name: 'OnCampus',
    description: 'Campus placement preparation onboarding',
    fields: [
      createField('duration', 'When will your On Campus Placements will start?', 'select', 1, {
        options: [
          { value: '1 Month', label: '1 Month' },
          { value: '3 Months', label: '3 Months' },
          { value: '6 Months', label: '6 Months' },
          { value: '1 Year', label: '1 Year' },
        ],
      }),
      createField('offCampus', 'Are you also going to apply Off Campus Jobs?', 'select', 2, {
        options: [
          { value: 'Yes', label: 'Yes' },
          { value: 'No', label: 'No' },
        ],
      }),
    ],
    api: {
      endpoint: () => `/user/oncampus/onboarding`,
      method: 'POST',
      transformPayload: (form: unknown, userId: string, from?: string) => {
        const f = form as Record<string, unknown>;
        return {
          userId,
          duration: String(f.duration || '').replace(/\s+/g, ''),
          offCampus: f.offCampus === 'Yes',
          ...(from ? { from } : {}),
        };
      },
    },
    ui: {
      variant: 'platform',
      branding: {
        title: 'Welcome to OnCampus!',
        subtitle: "Let's personalize your campus placement prep",
      },
    },
  },

  'tech-yatra': {
    id: 'tech-yatra',
    name: 'Tech Yatra',
    description: 'Tech learning roadmap onboarding',
    fields: [
      createField('focus', 'What do you want to focus on first?', 'select', 1, {
        placeholder: 'Select one',
        options: [
          { value: 'roadmaps', label: 'Learning roadmaps' },
          { value: 'projects', label: 'Hands-on projects' },
          { value: 'interviews', label: 'Interview prep' },
        ],
        prefill: {
          fromUser: (user: BaseUser) => user.techYatra?.focus || '',
        },
      }),
    ],
    api: {
      endpoint: () => `/techyatra/onboarding`,
      method: 'POST',
      transformPayload: (form: unknown, userId: string, from?: string) => {
        const f = form as Record<string, unknown>;
        return {
          userId,
          focus: f.focus,
          ...(from ? { from } : {}),
        };
      },
    },
    ui: {
      variant: 'platform',
      branding: {
        title: 'Welcome to Tech Yatra!',
        subtitle: 'Your personalized tech learning path',
      },
    },
  },

  'resume-yatra': {
    id: 'resume-yatra',
    name: 'Resume Yatra',
    description: 'Resume builder onboarding',
    fields: [
      createField('experienceBand', 'How much experience do you have?', 'select', 1, {
        placeholder: 'Select one',
        options: [
          { value: 'student', label: 'Student / fresher' },
          { value: 'early', label: '1–3 years' },
          { value: 'mid', label: '3–7 years' },
          { value: 'senior', label: '7+ years' },
        ],
        prefill: {
          fromUser: (user: BaseUser) => user.resumeYatra?.experienceBand || '',
        },
      }),
    ],
    api: {
      endpoint: () => `/resumeyatra/onboarding`,
      method: 'POST',
      transformPayload: (form: unknown, userId: string, from?: string) => {
        const f = form as Record<string, unknown>;
        return {
          userId,
          experienceBand: f.experienceBand,
          ...(from ? { from } : {}),
        };
      },
    },
    ui: {
      variant: 'platform',
      branding: {
        title: 'Welcome to Resume Yatra!',
        subtitle: 'Build a resume that gets interviews',
      },
    },
  },

  /** Same wizard as platform — used by quiz app deep links */
  quizapp: {
    id: 'quizapp',
    name: 'Quiz App',
    description: 'Quiz App onboarding',
    fields: [
      createField('userName', 'Username', 'text', 1, {
        placeholder: 'Enter your username',
        checkAvailability: true,
        prefill: {
          fromUser: (user: BaseUser) => user.userName || '',
        },
      }),
      createField('occupation', 'Occupation', 'select', 2, {
        placeholder: 'Select your occupation',
        options: [
          { value: 'TECH_STUDENT', label: 'Tech Student' },
          { value: 'WORKING_PROFESSIONAL', label: 'Working Professional' },
          { value: 'ENTREPRENEUR', label: 'Entrepreneur' },
          { value: 'OTHER', label: 'Other' },
        ],
        prefill: {
          fromUser: (user: BaseUser) => user.occupation || '',
        },
      }),
      createField('purpose', 'Purpose', 'multiselect', 3, {
        placeholder: 'Select your purpose(s)',
        options: [
          { value: 'BUILDING_PROJECTS', label: 'Building Projects' },
          { value: 'LEARNING', label: 'Learning' },
          { value: 'NETWORKING', label: 'Networking' },
          { value: 'JOB_SEARCH', label: 'Job Search' },
        ],
        prefill: {
          fromUser: (user: BaseUser) => user.purpose || [],
        },
      }),
      createField('contactNo', 'Contact Number', 'tel', 4, {
        placeholder: '+91 9876543210',
        prefill: {
          fromUser: (user: BaseUser) => user.contactNo || '',
        },
      }),
    ],
    api: {
      endpoint: (userId: string) => `/user/onboarding?userId=${userId}`,
      method: 'POST',
      transformPayload: (form: unknown, _userId: string, from?: string) => {
        const f = form as Record<string, unknown>;
        return {
          userName: f.userName,
          occupation: f.occupation,
          purpose: f.purpose,
          contactNo: f.contactNo,
          ...(from ? { from } : {}),
        };
      },
    },
    ui: {
      variant: 'platform',
      branding: {
        title: 'Welcome to The Boring Quiz!',
        subtitle: "Let's start your tech journey.",
      },
    },
  },
};

/** Legacy query-param IDs from older clients → canonical @tbe/config keys */
export const ONBOARDING_PRODUCT_ALIASES: Record<string, string> = {
  webapp: 'platform',
  prepyatra: 'prep-yatra',
};

export const resolveOnboardingProductId = (productId: string): string =>
  ONBOARDING_PRODUCT_ALIASES[productId] ?? productId;

// Helper functions
export const getOnboardingConfig = (productId: string): OnboardingProductConfig | null => {
  const resolved = resolveOnboardingProductId(productId);
  return ONBOARDING_CONFIGS[resolved] || null;
};

export const getAvailableOnboardingProducts = (): string[] => {
  return Object.keys(ONBOARDING_CONFIGS);
};

export const isValidOnboardingProduct = (productId: string): boolean => {
  const resolved = resolveOnboardingProductId(productId);
  return resolved in ONBOARDING_CONFIGS;
};
