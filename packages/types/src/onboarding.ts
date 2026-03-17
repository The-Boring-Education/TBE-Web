/**
 * Onboarding Types - Used across ALL TBE apps
 *
 * Types for onboarding flows that can be used by any TBE application
 * including field configurations, product configs, and onboarding state
 */

import type { BaseUser } from "./common";

// ================================
// ONBOARDING FIELD TYPES
// ================================

export interface BaseOnboardingFields {
  [key: string]: unknown;
}

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

export interface QuizOnboardingFields extends BaseOnboardingFields {
  username: string;
  interests: string[];
  skillLevel: string;
  learningGoals: string[];
}

// ================================
// ONBOARDING CONFIGURATION TYPES
// ================================

export interface OnboardingFieldConfig {
  name: string;
  label: string;
  type:
    | "text"
    | "select"
    | "multiselect"
    | "tel"
    | "email"
    | "url"
    | "textarea"
    | "checkbox";
  required: boolean;
  options?: Array<{ value: string; label: string }>;
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
    fromUser: (user: BaseUser) => unknown;
    defaultValue?: unknown;
  };
}

export interface OnboardingProductConfig {
  id: string;
  name: string;
  description?: string;
  fields: OnboardingFieldConfig[];
  api: {
    endpoint: string | ((userId: string) => string);
    method: "POST" | "PUT" | "PATCH";
    transformPayload: (form: unknown, userId: string, from?: string) => unknown;
  };
  validation?: {
    custom?: (form: unknown) => boolean | string;
  };
  ui?: {
    theme?: "default" | "dark" | "minimal";
    variant?: "platform" | "prep-yatra" | "quizes" | "onboarding";
    branding?: {
      logo?: string;
      title?: string;
      subtitle?: string;
    };
  };
}

// ================================
// ONBOARDING STATE TYPES
// ================================

export interface OnboardingState {
  user: BaseUser | null;
  step: number;
  form: Record<string, unknown>;
  loading: boolean;
  error: string;
  submitting: boolean;
  config: OnboardingProductConfig | null;
  totalSteps: number;
}

export interface UseOnboardingReturn extends OnboardingState {
  handleNext: () => void;
  handleBack: () => void;
  handleFinish: () => Promise<void>;
  isFieldValid: boolean;
  setForm: (
    form:
      | Record<string, unknown>
      | ((prev: Record<string, unknown>) => Record<string, unknown>),
  ) => void;
  setUsernameAvailability: (available: boolean) => void;
  setUsernameChecking: (checking: boolean) => void;
}

export interface UseOnboardingProps {
  userId: string;
  productId: string;
  redirect: string;
  token?: string;
  from?: string;
}

// ================================
// ONBOARDING FLOW TYPES
// ================================

export interface OnboardingStep {
  id: number;
  title: string;
  description?: string;
  fields: OnboardingFieldConfig[];
  isRequired: boolean;
  canSkip: boolean;
  validation?: (form: Record<string, unknown>) => boolean | string;
}

export interface OnboardingFlow {
  id: string;
  name: string;
  description: string;
  steps: OnboardingStep[];
  totalSteps: number;
  estimatedTime: number;
  completionRate: number;
}

export interface OnboardingProgress {
  userId: string;
  flowId: string;
  currentStep: number;
  completedSteps: number[];
  skippedSteps: number[];
  formData: Record<string, unknown>;
  startedAt: string;
  lastUpdatedAt: string;
  completedAt?: string;
  isCompleted: boolean;
}

// ================================
// ONBOARDING ANALYTICS TYPES
// ================================

export interface OnboardingAnalytics {
  userId?: string;
  flowId: string;
  stepId: number;
  action: "view" | "next" | "back" | "skip" | "complete" | "abandon";
  timestamp: string;
  timeSpent: number;
  formData?: Record<string, unknown>;
  errorMessage?: string;
  deviceInfo?: {
    platform: string;
    browser: string;
    screenSize: string;
  };
}

export interface OnboardingMetrics {
  flowId: string;
  totalStarted: number;
  totalCompleted: number;
  completionRate: number;
  averageTimeToComplete: number;
  mostAbandonedStep: number;
  averageStepsCompleted: number;
  conversionByStep: Array<{
    step: number;
    started: number;
    completed: number;
    conversionRate: number;
  }>;
  commonDropOffPoints: number[];
  userFeedback: {
    rating: number;
    comments: string[];
  };
}
