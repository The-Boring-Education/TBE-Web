import type { OnboardingProductConfig, BaseUser } from '@tbe/types';

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
    validation?: any;
    prefill?: any;
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
      transformPayload: (form: any, _userId: string, from?: string) => ({
        userName: form.userName,
        occupation: form.occupation,
        purpose: form.purpose,
        contactNo: form.contactNo,
        ...(from ? { from } : {}),
      }),
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
    ],
    api: {
      endpoint: () => `/api/v1/prepyatra/onboarding`,
      method: 'POST',
      transformPayload: (form: any, userId: string, from?: string) => ({
        userId,
        name: form.name,
        username: form.username,
        goal: form.goal,
        targetCompanies: form.targetCompanies,
        preferredCategories: form.preferredCategories,
        experienceLevel: form.experienceLevel,
        ...(form.linkedInUrl ? { linkedInUrl: form.linkedInUrl } : {}),
        ...(form.githubUrl ? { githubUrl: form.githubUrl } : {}),
        ...(from ? { from } : {}),
      }),
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
      endpoint: (userId: string) => `/api/v1/quiz/onboarding?userId=${userId}`,
      method: 'POST',
      transformPayload: (form: any, userId: string, from?: string) => ({
        userId,
        username: form.username,
        interests: form.interests,
        skillLevel: form.skillLevel,
        ...(from ? { from } : {}),
      }),
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
      endpoint: () => `/api/v1/onboarding/complete`,
      method: 'POST',
      transformPayload: (form: any, userId: string, from?: string) => ({
        userId,
        name: form.name,
        email: form.email,
        username: form.username,
        interests: form.interests,
        experience: form.experience,
        goals: form.goals,
        ...(from ? { from } : {}),
      }),
    },
    ui: {
      variant: 'onboarding',
      branding: {
        title: 'Welcome to TBE!',
        subtitle: "Let's set up your learning profile",
      },
    },
  },
};

// Helper functions
export const getOnboardingConfig = (productId: string): OnboardingProductConfig | null => {
  return ONBOARDING_CONFIGS[productId] || null;
};

export const getAvailableOnboardingProducts = (): string[] => {
  return Object.keys(ONBOARDING_CONFIGS);
};

export const isValidOnboardingProduct = (productId: string): boolean => {
  return productId in ONBOARDING_CONFIGS;
};
