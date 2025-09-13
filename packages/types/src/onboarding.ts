// Onboarding types for TBE Platform
// Extracted from apps/onboarding and standardized

// Base types for all onboarding products
export interface BaseOnboardingFields {
    [key: string]: unknown
}

// Specific product field types
export interface WebappOnboardingFields extends BaseOnboardingFields {
    userName: string
    occupation: string
    purpose: string[]
    contactNo: string
}

export interface PrepYatraOnboardingFields extends BaseOnboardingFields {
    userId: string
    name: string
    username: string
    goal: string
    targetCompanies: string[]
    preferredCategories: string[]
    experienceLevel: string
    linkedInUrl?: string
    githubUrl?: string
    leetCodeUrl?: string
}

export interface QuizOnboardingFields extends BaseOnboardingFields {
    username: string
    interests: string[]
    skillLevel: string
    learningGoals: string[]
}

// Field configuration for dynamic rendering
export interface OnboardingFieldConfig {
    name: string
    label: string
    type:
        | "text"
        | "select"
        | "multiselect"
        | "tel"
        | "email"
        | "url"
        | "textarea"
        | "checkbox"
    required: boolean
    options?: Array<{ value: string; label: string }>
    step: number
    placeholder?: string
    checkAvailability?: boolean
    optional?: boolean
    validation?: {
        pattern?: RegExp
        minLength?: number
        maxLength?: number
        custom?: (value: unknown) => boolean | string
    }
    prefill?: {
        fromUser: (user: BaseUser) => unknown
        defaultValue?: unknown
    }
}

// Product configuration
export interface OnboardingProductConfig {
    id: string
    name: string
    description?: string
    fields: OnboardingFieldConfig[]
    api: {
        endpoint: string | ((userId: string) => string)
        method: "POST" | "PUT" | "PATCH"
        transformPayload: (
            form: unknown,
            userId: string,
            from?: string
        ) => unknown
    }
    validation?: {
        custom?: (form: unknown) => boolean | string
    }
    ui?: {
        theme?: "default" | "dark" | "minimal"
        variant?: "platform" | "prep-yatra" | "quizes" | "onboarding"
        branding?: {
            logo?: string
            title?: string
            subtitle?: string
        }
    }
}

// Onboarding state
export interface OnboardingState {
    user: BaseUser | null
    step: number
    form: Record<string, unknown>
    loading: boolean
    error: string
    submitting: boolean
    config: OnboardingProductConfig | null
    totalSteps: number
}

// Hook return type
export interface UseOnboardingReturn extends OnboardingState {
    handleNext: () => void
    handleBack: () => void
    handleFinish: () => Promise<void>
    isFieldValid: boolean
    setForm: (form: Record<string, unknown>) => void
    setUsernameAvailability: (available: boolean) => void
    setUsernameChecking: (checking: boolean) => void
}

// Hook configuration
export interface UseOnboardingProps {
    userId: string
    productId: string
    redirect: string
    token?: string
    from?: string
}
