import type { BaseUser, OnboardingFieldConfig, OnboardingProductConfig } from '@tbe/types';

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
): OnboardingFieldConfig => ({
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

/**
 * Unified 4-Step Onboarding Fields
 * Consolidates all questions asked across the TBE ecosystem into 4 cohesive, structured steps.
 */
export const UNIFIED_ONBOARDING_FIELDS: OnboardingFieldConfig[] = [
  // Step 1: Identity & Current Role
  createField('name', 'Full Name', 'text', 1, {
    placeholder: 'Enter your full name (e.g. Alex Kumar)',
    prefill: {
      fromUser: (user: BaseUser) => user.name || '',
    },
  }),
  createField('userName', 'Choose your username', 'text', 1, {
    placeholder: 'Enter unique username (e.g. alpha_dev)',
    checkAvailability: true,
    prefill: {
      fromUser: (user: BaseUser) => user.userName || '',
    },
  }),
  createField('contactNo', 'Mobile / WhatsApp Number', 'tel', 1, {
    placeholder: 'Enter your 10-digit mobile number',
    prefill: {
      fromUser: (user: BaseUser) => user.contactNo || '',
    },
  }),
  createField('occupation', 'What is your current occupation / role?', 'select', 1, {
    placeholder: 'Select your current status',
    options: [
      { value: 'TECH_STUDENT', label: '🎓 Tech Student / College' },
      { value: 'WORKING_PROFESSIONAL', label: '💼 Working Professional' },
      { value: 'CAREER_SWITCHER', label: '🚀 Self-Taught / Career Switcher' },
      { value: 'OTHER', label: '⚡ Other / Enthusiast' },
    ],
    prefill: {
      fromUser: (user: BaseUser) => user.occupation || '',
    },
  }),

  // Step 2: Learning Focus & Primary Goals
  createField('purpose', 'What topics do you want to master?', 'multiselect', 2, {
    placeholder: 'Select learning topics',
    options: [
      { value: 'web_dev', label: '🌐 Web Development (Full-Stack)' },
      { value: 'dsa', label: '🧩 Data Structures & Algorithms' },
      { value: 'ai_ml', label: '🤖 AI & Machine Learning' },
      { value: 'core_cs', label: '🏛️ System Design & Core CS' },
      { value: 'mobile_dev', label: '📱 Mobile App Development' },
      { value: 'devops', label: '☁️ Cloud & DevOps' },
    ],
    prefill: {
      fromUser: (user: BaseUser) => user.purpose || [],
    },
  }),
  createField('goal', 'What is your primary career goal?', 'select', 2, {
    placeholder: 'Select your main objective',
    options: [
      { value: 'crack_placements', label: '🎯 Crack Tech Placements & Job Search' },
      { value: 'build_projects', label: '🛠️ Build Production-Ready Projects' },
      { value: 'job_skill', label: '📈 Upskill & Level Up for Current Job' },
      { value: 'fun_school', label: '📚 Learn for Fun / College Exams' },
    ],
  }),

  // Step 3: Experience Level, Timeline & Language
  createField('experienceLevel', 'How much coding experience do you have?', 'select', 3, {
    placeholder: 'Select your experience level',
    options: [
      { value: 'beginner', label: '🌱 Beginner (0–1 yr) — Learning basics' },
      { value: 'intermediate', label: '⚡ Intermediate (1–3 yrs) — Building projects' },
      { value: 'advanced', label: '🚀 Advanced (3+ yrs) — Production experience' },
    ],
    prefill: {
      fromUser: (user: BaseUser) =>
        user.dsaYatra?.experienceLevel || user.prepYatra?.experienceLevel || '',
    },
  }),
  createField('timeline', 'Target Preparation Timeline', 'select', 3, {
    placeholder: 'Select your timeline',
    options: [
      { value: '3_months', label: '⏱️ 1–3 Months (Fast-Track Sprint)' },
      { value: '6_months', label: '📅 4–6 Months (Structured Roadmap)' },
      { value: '1_year', label: '🗓️ 6–12 Months (Long-Term Mastery)' },
    ],
    prefill: {
      fromUser: (user: BaseUser) => user.dsaYatra?.timeline || '',
    },
  }),
  createField('preferredLanguage', 'Preferred Programming Language', 'select', 3, {
    placeholder: 'Select your language',
    options: [
      { value: 'C++', label: 'C++' },
      { value: 'Java', label: 'Java' },
      { value: 'Python', label: 'Python' },
      { value: 'JavaScript', label: 'JavaScript / TypeScript' },
    ],
    prefill: {
      fromUser: (user: BaseUser) => user.dsaYatra?.preferredLanguage || '',
    },
  }),

  // Step 4: Target Companies & Social Profiles (Optional)
  createField('targetCompanies', 'Target Company Types', 'multiselect', 4, {
    required: false,
    placeholder: 'Select target companies',
    options: [
      { value: 'startup', label: '🦄 High-Growth Startups' },
      { value: 'faang', label: '🏢 Product Companies / FAANG' },
      { value: 'mnc', label: '🌐 Top Tech MNCs & Enterprise' },
      { value: 'oncampus', label: '🎓 On-Campus College Placements' },
    ],
  }),
  createField('linkedInUrl', 'LinkedIn URL', 'url', 4, {
    required: false,
    placeholder: 'https://linkedin.com/in/yourprofile',
    prefill: {
      fromUser: (user: BaseUser) => user.linkedInUrl || '',
    },
  }),
  createField('githubUrl', 'GitHub URL', 'url', 4, {
    required: false,
    placeholder: 'https://github.com/yourusername',
    prefill: {
      fromUser: (user: BaseUser) => user.githubUrl || '',
    },
  }),
  createField('leetCodeUrl', 'LeetCode URL', 'url', 4, {
    required: false,
    placeholder: 'https://leetcode.com/yourusername',
    prefill: {
      fromUser: (user: BaseUser) => user.leetCodeUrl || '',
    },
  }),
];

/**
 * Unified transformer that prepares all user fields for backend storage.
 */
export const unifiedTransformPayload = (form: any, userId: string, from?: string) => {
  const origin = (from || '').toLowerCase().replace(/[-_]/g, '');

  const isPrep = origin === 'prepyatra';
  const isDsa = origin === 'dsayatra';
  const isOncampus = origin === 'oncampus';
  const isTech = origin === 'techyatra';
  const isResume = origin === 'resumeyatra';

  return {
    userId,
    name: form.name,
    userName: form.userName,
    occupation: form.occupation || 'TECH_STUDENT',
    purpose: Array.isArray(form.purpose) ? form.purpose : [form.purpose].filter(Boolean),
    contactNo: form.contactNo || '+91',
    goal: form.goal || 'crack_placements',
    experienceLevel: form.experienceLevel || 'beginner',
    timeline: form.timeline || '6_months',
    preferredLanguage: form.preferredLanguage || 'JavaScript',
    targetCompanies: Array.isArray(form.targetCompanies) ? form.targetCompanies : [],
    linkedInUrl: form.linkedInUrl || '',
    githubUrl: form.githubUrl || '',
    leetCodeUrl: form.leetCodeUrl || '',
    isOnboarded: true,
    ...(from ? { from } : {}),

    // Prep Yatra placement & interview prep details
    prepYatra: {
      pyOnboarded: Boolean(form.prepYatra?.pyOnboarded ?? isPrep),
      goal: form.goal || 'crack_placements',
      experienceLevel: form.experienceLevel || 'fresher',
      targetCompanies: Array.isArray(form.targetCompanies) ? form.targetCompanies : [],
      preferences: {
        interviewCategories: Array.isArray(form.preferredCategories)
          ? form.preferredCategories
          : [],
        focusAreas: Array.isArray(form.purpose) ? form.purpose : [form.purpose].filter(Boolean),
      },
    },

    // DSA Yatra algorithm preparation details
    dsaYatra: {
      dyOnboarded: Boolean(form.dsaYatra?.dyOnboarded ?? isDsa),
      experienceLevel:
        form.experienceLevel === 'advanced'
          ? 'Experienced (3+ yrs)'
          : form.experienceLevel === 'intermediate'
            ? 'Intermediate (1-3 yrs)'
            : 'Fresher (0-1 yr)',
      timeline:
        form.timeline === '1_year' ? '1Year' : form.timeline === '3_months' ? '3Months' : '6Months',
      target: form.targetCompanies?.includes('faang')
        ? 'Product-based'
        : form.targetCompanies?.includes('startup')
          ? 'Startups'
          : 'Product-based',
      preferredLanguage: form.preferredLanguage || 'JavaScript',
      targetTopics: Array.isArray(form.purpose) ? form.purpose : [form.purpose].filter(Boolean),
    },

    // OnCampus placement details
    oncampus: {
      onboardingCompleted: Boolean(form.oncampus?.onboardingCompleted ?? isOncampus),
      duration:
        form.timeline === '1_year' ? '1Year' : form.timeline === '3_months' ? '3Months' : '6Months',
      experienceLevel: form.experienceLevel || 'Fresher (0-1 yr)',
      offCampus: !form.targetCompanies?.includes('oncampus'),
    },

    // Tech Yatra roadmap focus details
    techYatra: {
      tyOnboarded: Boolean(form.techYatra?.tyOnboarded ?? isTech),
      focus: form.purpose?.[0] || 'roadmaps',
    },

    // Resume Yatra ATS builder details
    resumeYatra: {
      ryOnboarded: Boolean(form.resumeYatra?.ryOnboarded ?? isResume),
      experienceBand: form.experienceLevel || 'student',
    },
  };
};

// TBE Platform Onboarding Configurations
export const ONBOARDING_CONFIGS: Record<string, OnboardingProductConfig> = {
  platform: {
    id: 'platform',
    name: 'TBE Platform',
    description: 'Main TBE platform unified onboarding',
    fields: UNIFIED_ONBOARDING_FIELDS,
    api: {
      endpoint: (userId: string) => `/user/onboarding?userId=${userId}`,
      method: 'POST',
      transformPayload: unifiedTransformPayload,
    },
    ui: {
      variant: 'platform',
      branding: {
        title: 'Welcome to The Boring Education!',
        subtitle: "Let's personalize your learning & career journey in 4 quick steps.",
      },
    },
  },

  'prep-yatra': {
    id: 'prep-yatra',
    name: 'Prep Yatra',
    description: 'Career navigation platform onboarding',
    fields: UNIFIED_ONBOARDING_FIELDS,
    api: {
      endpoint: (userId: string) => `/user/onboarding?userId=${userId}`,
      method: 'POST',
      transformPayload: (form: any, userId: string, from?: string) => ({
        ...unifiedTransformPayload(form, userId, from || 'prepyatra'),
      }),
    },
    ui: {
      variant: 'prep-yatra',
      branding: {
        title: 'Welcome to Prep Yatra!',
        subtitle: 'Navigate your tech interview prep & placement roadmap.',
      },
    },
  },

  quizes: {
    id: 'quizes',
    name: 'Quiz Platform',
    description: 'Quiz platform onboarding',
    fields: UNIFIED_ONBOARDING_FIELDS,
    api: {
      endpoint: (userId: string) => `/user/onboarding?userId=${userId}`,
      method: 'POST',
      transformPayload: (form: any, userId: string, from?: string) => ({
        ...unifiedTransformPayload(form, userId, from || 'quiz'),
      }),
    },
    ui: {
      variant: 'quizes',
      branding: {
        title: 'Welcome to TBE Quizes!',
        subtitle: 'Test and improve your coding skills with daily challenges.',
      },
    },
  },

  onboarding: {
    id: 'onboarding',
    name: 'General Onboarding',
    description: 'General TBE unified onboarding flow',
    fields: UNIFIED_ONBOARDING_FIELDS,
    api: {
      endpoint: (userId: string) => `/user/onboarding?userId=${userId}`,
      method: 'POST',
      transformPayload: unifiedTransformPayload,
    },
    ui: {
      variant: 'onboarding',
      branding: {
        title: 'Welcome to TBE!',
        subtitle: "Let's set up your personalized learning & career roadmap.",
      },
    },
  },

  dsayatra: {
    id: 'dsayatra',
    name: 'DSA Yatra',
    description: 'DSA preparation platform onboarding',
    fields: UNIFIED_ONBOARDING_FIELDS,
    api: {
      endpoint: (userId: string) => `/user/onboarding?userId=${userId}`,
      method: 'POST',
      transformPayload: (form: any, userId: string, from?: string) => ({
        ...unifiedTransformPayload(form, userId, from || 'dsayatra'),
      }),
    },
    ui: {
      variant: 'prep-yatra',
      branding: {
        title: 'Welcome to DSA Yatra!',
        subtitle: 'Master Data Structures and Algorithms with curated patterns.',
      },
    },
  },

  oncampus: {
    id: 'oncampus',
    name: 'OnCampus',
    description: 'Campus placement preparation onboarding',
    fields: UNIFIED_ONBOARDING_FIELDS,
    api: {
      endpoint: (userId: string) => `/user/onboarding?userId=${userId}`,
      method: 'POST',
      transformPayload: (form: any, userId: string, from?: string) => ({
        ...unifiedTransformPayload(form, userId, from || 'oncampus'),
      }),
    },
    ui: {
      variant: 'platform',
      branding: {
        title: 'Welcome to OnCampus!',
        subtitle: "Let's personalize your campus placement prep & mock assessments.",
      },
    },
  },

  'tech-yatra': {
    id: 'tech-yatra',
    name: 'Tech Yatra',
    description: 'Tech learning roadmap onboarding',
    fields: UNIFIED_ONBOARDING_FIELDS,
    api: {
      endpoint: (userId: string) => `/user/onboarding?userId=${userId}`,
      method: 'POST',
      transformPayload: (form: any, userId: string, from?: string) => ({
        ...unifiedTransformPayload(form, userId, from || 'techyatra'),
      }),
    },
    ui: {
      variant: 'platform',
      branding: {
        title: 'Welcome to Tech Yatra!',
        subtitle: 'Your personalized engineering roadmaps from scratch to production.',
      },
    },
  },

  'resume-yatra': {
    id: 'resume-yatra',
    name: 'Resume Yatra',
    description: 'Resume builder onboarding',
    fields: UNIFIED_ONBOARDING_FIELDS,
    api: {
      endpoint: (userId: string) => `/user/onboarding?userId=${userId}`,
      method: 'POST',
      transformPayload: (form: any, userId: string, from?: string) => ({
        ...unifiedTransformPayload(form, userId, from || 'resumeyatra'),
      }),
    },
    ui: {
      variant: 'platform',
      branding: {
        title: 'Welcome to Resume Yatra!',
        subtitle: 'Build ATS-optimized tech resumes that get you interviews.',
      },
    },
  },

  /** Same wizard as platform — used by quiz app deep links */
  quizapp: {
    id: 'quizapp',
    name: 'Quiz App',
    description: 'Quiz App onboarding',
    fields: UNIFIED_ONBOARDING_FIELDS,
    api: {
      endpoint: (userId: string) => `/user/onboarding?userId=${userId}`,
      method: 'POST',
      transformPayload: (form: any, userId: string, from?: string) => ({
        ...unifiedTransformPayload(form, userId, from || 'quiz'),
      }),
    },
    ui: {
      variant: 'platform',
      branding: {
        title: 'Welcome to The Boring Quiz!',
        subtitle: "Let's personalize your daily quizzes & assessments.",
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
  return ONBOARDING_CONFIGS[resolved] ?? ONBOARDING_CONFIGS.platform ?? null;
};

export const getAvailableOnboardingProducts = (): string[] => {
  return Object.keys(ONBOARDING_CONFIGS);
};

export const isValidOnboardingProduct = (productId: string): boolean => {
  const resolved = resolveOnboardingProductId(productId);
  return resolved in ONBOARDING_CONFIGS;
};
