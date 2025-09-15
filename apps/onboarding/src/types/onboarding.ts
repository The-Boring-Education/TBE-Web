/* eslint-disable no-unused-vars */
// Base types for all onboarding products
export interface BaseOnboardingFields {
  [key: string]: unknown;
}

// Specific product field types
export interface WebappOnboardingFields extends BaseOnboardingFields {
  userName: string;
  occupation: string;
  purpose: string[];
  contactNo: string;
}

export interface PrepYatraOnboardingFields extends BaseOnboardingFields {
  userId: string;
  name: string;
  username: string;
  goal: string;
  targetCompanies: string[];
  preferredCategories: string[];
  experienceLevel: string;
  linkedInUrl?: string;
  githubUrl?: string;
  leetCodeUrl?: string;
}

// User data structure
export interface User {
  _id: string;
  name?: string;
  email?: string;
  image?: string;
  provider?: string;
  providerAccountId?: string;
  createdAt?: string;
  updatedAt?: string;
  contactNo?: string;
  isOnboarded?: boolean;
  occupation?: string;
  purpose?: string[];
  userName?: string;
  prepYatra?: any;
}

// Field configuration for dynamic rendering
export interface OnboardingFieldConfig {
  name: string;
  label: string;
  type: 'text' | 'select' | 'multiselect' | 'tel' | 'email' | 'url';
  required: boolean;
  options?: string[];
  step: number;
  placeholder?: string;
  checkAvailability?: boolean;
  optional?: boolean;
  validation?: {
    pattern?: RegExp;
    minLength?: number;
    maxLength?: number;
    custom?: (value: unknown) => boolean | string;
  };
  prefill?: {
    fromUser: (user: User) => unknown;
    defaultValue?: unknown;
  };
}

// Product configuration
export interface OnboardingProductConfig {
  id: string;
  name: string;
  description?: string;
  fields: OnboardingFieldConfig[];
  api: {
    endpoint: string | ((userId: string) => string);
    method: 'POST' | 'PUT' | 'PATCH';
    transformPayload: (form: unknown, userId: string, from?: string) => unknown;
  };
  validation?: {
    custom?: (form: unknown) => boolean | string;
  };
  ui?: {
    theme?: 'default' | 'dark' | 'minimal';
    branding?: {
      logo?: string;
      title?: string;
      subtitle?: string;
    };
  };
}

// API response types
export interface APIResponse<T = unknown> {
  status: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Onboarding state
export interface OnboardingState {
  user: User | null;
  step: number;
  form: unknown;
  loading: boolean;
  error: string;
  submitting: boolean;
  config: OnboardingProductConfig | null;
  totalSteps: number;
}

// Hook return type
export interface UseOnboardingReturn extends OnboardingState {
  handleNext: () => void;
  handleBack: () => void;
  handleFinish: () => Promise<void>;
  isFieldValid: boolean;
  // eslint-disable-next-line no-unused-vars
  setForm: (form: unknown) => void;
  setUsernameAvailability: (available: boolean) => void;
  setUsernameChecking: (checking: boolean) => void;
}
