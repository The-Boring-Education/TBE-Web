import {
  BanknotesIcon,
  BookOpenIcon,
  CheckCircleIcon,
  ClockIcon,
  CodeBracketIcon,
  LightBulbIcon,
  ShieldCheckIcon,
  StarIcon,
  UserGroupIcon,
} from '@heroicons/react/20/solid';

import type { ProductType  } from './database';
import {ProductConfigProps} from '@tbe/interface';

// export type ProductType = 'INTERVIEW_SHEET' | 'SHIKSHA' | 'PROJECTS' | 'PREPYATRA' | 'GENERAL';



export const PRODUCT_CONFIGS: Record<ProductType, ProductConfigProps> = {
  INTERVIEW_SHEET: {
    name: 'Interview Sheet',
    icon: ShieldCheckIcon,
    reasonsToBuy: [
      {
        icon: ShieldCheckIcon,
        title: 'Real Interview Questions',
        description: 'Questions asked in actual FAANG and top-tier companies',
      },
      {
        icon: StarIcon,
        title: 'Expert Solutions',
        description: 'Detailed explanations and optimal approaches for each question',
      },
      {
        icon: LightBulbIcon,
        title: 'Interview Insights',
        description: 'Pro tips and common mistakes to avoid during interviews',
      },
      {
        icon: ClockIcon,
        title: 'Save 100+ Hours',
        description: 'Curated content saves months of research and preparation',
      },
    ],
    defaultFeatures: [
      'Complete question bank',
      'Detailed solutions',
      'Interview tips',
      'Lifetime access',
    ],
    lockedMessage: {
      title: '🚀 This is a Premium Interview Sheet',
      description:
        'To access all the interview questions and detailed solutions, please complete the payment. Once payment is confirmed, all questions will be unlocked instantly.',
      buttonText: 'Pay Now to Unlock',
    },
  },
  SHIKSHA: {
    name: 'Course',
    icon: BookOpenIcon,
    reasonsToBuy: [
      {
        icon: BookOpenIcon,
        title: 'Comprehensive Learning',
        description: 'Complete hands-on course with practical projects',
      },
      {
        icon: StarIcon,
        title: 'Industry Relevant',
        description: 'Latest technologies and best practices used in industry',
      },
      {
        icon: CheckCircleIcon,
        title: 'Completion Certificate',
        description: 'Get verified certificate upon successful completion',
      },
      {
        icon: ClockIcon,
        title: 'Lifetime Access',
        description: 'Learn at your own pace with permanent access to content',
      },
    ],
    defaultFeatures: [
      'Video lectures',
      'Hands-on projects',
      'Completion certificate',
      'Lifetime access',
    ],
    lockedMessage: {
      title: '🚀 This is a Premium Course',
      description:
        'To access all course content, videos, and projects, please complete the payment. Once payment is confirmed, all chapters will be unlocked instantly.',
      buttonText: 'Pay Now to Unlock',
    },
  },
  PROJECTS: {
    name: 'Project',
    icon: CodeBracketIcon,
    reasonsToBuy: [
      {
        icon: CodeBracketIcon,
        title: 'Real-World Projects',
        description: 'Build industry-standard projects with complete source code',
      },
      {
        icon: StarIcon,
        title: 'Portfolio Ready',
        description: 'Projects you can showcase in your portfolio and resume',
      },
      {
        icon: CheckCircleIcon,
        title: 'Step-by-Step Guide',
        description: 'Detailed documentation and implementation guide',
      },
      {
        icon: UserGroupIcon,
        title: 'Community Support',
        description: 'Get help from community and expert mentors',
      },
    ],
    defaultFeatures: [
      'Complete source code',
      'Documentation',
      'Deployment guide',
      'Lifetime access',
    ],
    lockedMessage: {
      title: '🚀 This is a Premium Project',
      description:
        'To access the complete project source code, documentation, and deployment guide, please complete the payment. Once payment is confirmed, all resources will be unlocked instantly.',
      buttonText: 'Pay Now to Unlock',
    },
  },
  PREPYATRA: {
    name: 'PrepYatra Subscription',
    icon: StarIcon,
    reasonsToBuy: [
      {
        icon: StarIcon,
        title: 'Access to All Products',
        description: 'Unlock all courses, sheets, and projects with one subscription',
      },
      {
        icon: ShieldCheckIcon,
        title: 'Priority Support',
        description: 'Get priority support from our expert team',
      },
      {
        icon: CheckCircleIcon,
        title: 'Exclusive Content',
        description: 'Access to exclusive content and early features',
      },
      {
        icon: ClockIcon,
        title: 'Flexible Plans',
        description: 'Choose from monthly, yearly, or lifetime plans',
      },
    ],
    defaultFeatures: [
      'All courses access',
      'All interview sheets',
      'All projects',
      'Priority support',
    ],
    lockedMessage: {
      title: '🚀 Unlock Everything with PrepYatra',
      description:
        'Get access to all premium courses, interview sheets, and projects with a single subscription. Choose a plan that works for you.',
      buttonText: 'Subscribe Now',
    },
  },
  GENERAL: {
    name: 'Product',
    icon: BanknotesIcon,
    reasonsToBuy: [
      {
        icon: StarIcon,
        title: 'Premium Quality',
        description: 'High-quality content curated by industry experts',
      },
      {
        icon: CheckCircleIcon,
        title: 'Instant Access',
        description: 'Get immediate access after payment confirmation',
      },
      {
        icon: ClockIcon,
        title: 'Lifetime Access',
        description: 'Access content forever with no recurring fees',
      },
      {
        icon: ShieldCheckIcon,
        title: 'Secure Payment',
        description: 'Safe and secure payment processing',
      },
    ],
    defaultFeatures: [
      'Premium content',
      'Lifetime access',
      'Expert support',
      'Regular updates',
    ],
    lockedMessage: {
      title: '🚀 This is a Premium Product',
      description:
        'To access all premium content, please complete the payment. Once payment is confirmed, all features will be unlocked instantly.',
      buttonText: 'Pay Now to Unlock',
    },
  },
};

export const getProductConfig = (productType: ProductType | string): ProductConfigProps => {
  const config = PRODUCT_CONFIGS[productType as ProductType];
  return config || PRODUCT_CONFIGS.GENERAL as ProductConfigProps;
};

