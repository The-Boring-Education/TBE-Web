import { OnboardingProductConfig, User } from "../types/onboarding"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

const createField = (
  name: string,
  label: string,
  type: "text" | "select" | "multiselect" | "tel" | "email" | "url",
  step: number,
  options?: {
    required?: boolean
    placeholder?: string
    checkAvailability?: boolean
    options?: string[]
    validation?: any
    prefill?: any
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
  prefill: options?.prefill
})

// Product configurations
export const PRODUCT_CONFIGS: Record<string, OnboardingProductConfig> = {
  webapp: {
    id: "webapp",
    name: "WebApp",
    description: "Main web application onboarding",
    fields: [
      createField("userName", "Username", "text", 1, {
        placeholder: "Enter your username",
        checkAvailability: true,
        prefill: {
          fromUser: (user: User) => user.userName || ""
        }
      }),
      createField("occupation", "Occupation", "select", 2, {
        placeholder: "Select your occupation",
        options: [
          "TECH_STUDENT",
          "WORKING_PROFESSIONAL",
          "ENTREPRENEUR",
          "OTHER"
        ],
        prefill: {
          fromUser: (user: User) => user.occupation || ""
        }
      }),
      createField("purpose", "Purpose", "multiselect", 3, {
        placeholder: "Select your purpose(s)",
        options: [
          "BUILDING_PROJECTS",
          "LEARNING",
          "NETWORKING",
          "JOB_SEARCH"
        ],
        prefill: {
          fromUser: (user: User) => user.purpose || []
        }
      }),
      createField("contactNo", "Contact Number", "tel", 4, {
        placeholder: "+91 9876543210",
        prefill: {
          fromUser: (user: User) => user.contactNo || ""
        }
      })
    ],
    api: {
      endpoint: (userId: string) =>
        `${API_BASE_URL}/user/onboarding?userId=${userId}`,
      method: "POST",
      transformPayload: (form: any, _userId: string, from?: string) => ({
        userName: form.userName,
        occupation: form.occupation,
        purpose: form.purpose,
        contactNo: form.contactNo,
        ...(from ? { from } : {})
      })
    },
    ui: {
      theme: "default",
      branding: {
        title: "Welcome to The Boring Education!",
        subtitle: "Let's Start with Your Tech journey."
      }
    }
  },

  prepyatra: {
    id: "prepyatra",
    name: "PrepYatra",
    description: "Interview preparation platform onboarding",
    fields: [
      createField("name", "Full Name", "text", 1, {
        placeholder: "Enter your full name",
        prefill: {
          fromUser: (user: User) => user.name || ""
        }
      }),
      createField("username", "Username", "text", 2, {
        placeholder: "Choose a username",
        checkAvailability: true,
        prefill: {
          fromUser: (user: User) => user.userName || ""
        }
      }),
      createField("goal", "Goal", "select", 3, {
        placeholder: "Select your goal",
        options: ["3 Months", "6 Months", "1 Year"],
        prefill: {
          fromUser: (user: User) => user.prepYatra?.goal || ""
        }
      }),
      createField("targetCompanies", "Target Companies", "multiselect", 4, {
        placeholder: "Select target companies",
        options: ["Startup", "MNC", "FAANG", "MidSize"],
        prefill: {
          fromUser: (user: User) => user.prepYatra?.targetCompanies || []
        }
      }),
      createField("preferredCategories", "Preferred Interview Categories", "multiselect", 5, {
        placeholder: "Select preferred categories",
        options: [
          "MNC",
          "MERN",
          "College Placement",
          "DSA",
          "System Design",
          "General Tech"
        ],
        prefill: {
          fromUser: (user: User) =>
            user.prepYatra?.preferences?.interviewCategories || []
        }
      }),
      createField("experienceLevel", "Experience Level", "select", 6, {
        placeholder: "Select your experience level",
        options: [
          "Fresher (0-1 yr)",
          "Junior (1-3 yr)",
          "Mid (3-5 yr)",
          "Senior (5+ yrs)"
        ],
        prefill: {
          fromUser: (user: User) => user.prepYatra?.experienceLevel || ""
        }
      }),
      createField("linkedInUrl", "LinkedIn URL (optional)", "url", 7, {
        required: false,
        placeholder: "Paste your LinkedIn profile URL",
        prefill: {
          fromUser: (user: User) => user.prepYatra?.linkedInUrl || ""
        }
      }),
      createField("githubUrl", "GitHub URL (optional)", "url", 7, {
        required: false,
        placeholder: "Paste your GitHub profile URL",
        prefill: {
          fromUser: (user: User) => user.prepYatra?.githubUrl || ""
        }
      }),
      createField("leetCodeUrl", "LeetCode URL (optional)", "url", 7, {
        required: false,
        placeholder: "Paste your LeetCode profile URL",
        prefill: {
          fromUser: (user: User) => user.prepYatra?.leetCodeUrl || ""
        }
      })
    ],
    api: {
      endpoint: () => `${API_BASE_URL}/prepyatra/onboarding`,
      method: "POST",
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
        ...(form.leetCodeUrl ? { leetCodeUrl: form.leetCodeUrl } : {}),
        ...(from ? { from } : {})
      })
    },
    ui: {
      theme: "default",
      branding: {
        title: "Welcome to PrepYatra!",
        subtitle: "Let's Start with Tech Interview Prep"
      }
    }
  },

  quizapp: {
    id: "quizapp",
    name: "Quiz App",
    description: "Quiz App onboarding",
    fields: [
      createField("userName", "Username", "text", 1, {
        placeholder: "Enter your username",
        checkAvailability: true,
        prefill: {
          fromUser: (user: User) => user.userName || ""
        }
      }),
      createField("occupation", "Occupation", "select", 2, {
        placeholder: "Select your occupation",
        options: [
          "TECH_STUDENT",
          "WORKING_PROFESSIONAL",
          "ENTREPRENEUR",
          "OTHER"
        ],
        prefill: {
          fromUser: (user: User) => user.occupation || ""
        }
      }),
      createField("purpose", "Purpose", "multiselect", 3, {
        placeholder: "Select your purpose(s)",
        options: [
          "BUILDING_PROJECTS",
          "LEARNING",
          "NETWORKING",
          "JOB_SEARCH"
        ],
        prefill: {
          fromUser: (user: User) => user.purpose || []
        }
      }),
      createField("contactNo", "Contact Number", "tel", 4, {
        placeholder: "+91 9876543210",
        prefill: {
          fromUser: (user: User) => user.contactNo || ""
        }
      })
    ],
    api: {
      endpoint: (userId: string) =>
        `${API_BASE_URL}/user/onboarding?userId=${userId}`,
      method: "POST",
      transformPayload: (form: any, _userId: string, from?: string) => ({
        userName: form.userName,
        occupation: form.occupation,
        purpose: form.purpose,
        contactNo: form.contactNo,
        ...(from ? { from } : {})
      })
    },
    ui: {
      theme: "default",
      branding: {
        title: "Welcome to The Boring Quiz!",
        subtitle: "Let's Start with Your Tech journey."
      }
    }
  }
}

// Helper function to get product config
export const getProductConfig = (
  productId: string
): OnboardingProductConfig | null => {
  return PRODUCT_CONFIGS[productId] || null
}

// Helper function to get all available products
export const getAvailableProducts = (): string[] => {
  return Object.keys(PRODUCT_CONFIGS)
}

// Helper function to validate product exists
export const isValidProduct = (productId: string): boolean => {
  return productId in PRODUCT_CONFIGS
}
