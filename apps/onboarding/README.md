# 🎯 TBE Onboarding - User Registration & Setup Flow

A streamlined onboarding application built with Vite and React, designed to guide new users through the TBE platform registration and initial setup process.

## 📋 Overview

The TBE Onboarding app provides a smooth, interactive user registration experience with multi-step forms, profile setup, and seamless integration with the main TBE platform.

### Key Features

- **Multi-step Registration**: Progressive user information collection
- **Profile Setup**: Skills, interests, and learning goals configuration
- **Interactive UI**: Modern, responsive design with smooth animations
- **Form Validation**: Real-time validation with helpful error messages
- **Progress Tracking**: Visual progress indicators throughout the flow
- **Platform Integration**: Seamless handoff to main TBE platform

## 🛠️ Tech Stack

- **Build Tool**: Vite 4.3.9
- **Framework**: React 18.3.1
- **Language**: TypeScript 5.9.2
- **Routing**: React Router DOM 6.11.2
- **Styling**: Tailwind CSS 3.3.2
- **Linting**: ESLint with TypeScript support
- **Package Manager**: pnpm

## 🚀 Development

### Prerequisites

- Node.js >= 20.x
- pnpm >= 9.12.0

### Setup

```bash
# From monorepo root
pnpm install

# Start onboarding app only
pnpm dev:onboarding

# Or start all apps
pnpm dev
```

The app will be available at `http://localhost:3003`

### Environment Variables

Create `.env.local` in the app directory:

```bash
# API Configuration
VITE_API_URL=http://localhost:3004
VITE_PLATFORM_URL=http://localhost:3000

# Authentication
VITE_AUTH_REDIRECT_URL=http://localhost:3000/dashboard

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_SOCIAL_LOGIN=true

# External Services
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

## 📁 Project Structure

```
apps/onboarding/
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── forms/         # Form components
│   │   ├── ui/            # Basic UI elements
│   │   └── layout/        # Layout components
│   ├── pages/             # Page components
│   │   ├── Welcome.tsx    # Landing page
│   │   ├── Register.tsx   # Registration form
│   │   ├── Profile.tsx    # Profile setup
│   │   └── Complete.tsx   # Completion page
│   ├── hooks/             # Custom React hooks
│   ├── utils/             # Utility functions
│   ├── types/             # TypeScript type definitions
│   ├── config/            # App configuration
│   ├── assets/            # Static assets
│   └── styles/            # Global styles
├── public/                # Public assets
├── index.html             # HTML template
├── vite.config.ts         # Vite configuration
├── tailwind.config.js     # Tailwind configuration
└── tsconfig.json         # TypeScript configuration
```

## 🔧 Available Scripts

```bash
# Development
pnpm dev                   # Start development server (port 3003)

# Building
pnpm build                 # Build for production (includes type checking)
pnpm preview               # Preview production build

# Code Quality
pnpm lint                  # Run ESLint
pnpm lint:fix             # Fix ESLint issues
pnpm type-check           # TypeScript type checking
```

## 🎯 Onboarding Flow

### Step 1: Welcome & Introduction

- Platform overview
- Value proposition
- Call-to-action to start registration

### Step 2: Basic Registration

```typescript
interface BasicInfo {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  agreeToTerms: boolean;
}
```

### Step 3: Profile Setup

```typescript
interface ProfileInfo {
  role: "student" | "professional" | "career-changer";
  experience: "beginner" | "intermediate" | "advanced";
  interests: string[];
  goals: string[];
  preferredLearningStyle: string;
}
```

### Step 4: Skills Assessment

```typescript
interface SkillsInfo {
  programmingLanguages: string[];
  frameworks: string[];
  currentSkillLevel: number;
  areasToImprove: string[];
}
```

### Step 5: Completion & Redirect

- Success confirmation
- Account activation
- Redirect to main platform

## 🎨 UI Components

### Form Components

```typescript
// Registration forms
import {
  BasicInfoForm,
  ProfileSetupForm,
  SkillsAssessmentForm,
} from "@/components/forms";

// UI elements
import { Button, Input, Select, Checkbox, ProgressBar } from "@/components/ui";
```

### Layout Components

```typescript
// Layout components
import {
  OnboardingLayout,
  StepIndicator,
  NavigationButtons,
} from "@/components/layout";
```

## 🔄 State Management

### Form State

```typescript
// Form management with React Hook Form equivalent
import { useState, useReducer } from "react";

interface OnboardingState {
  currentStep: number;
  basicInfo: BasicInfo;
  profileInfo: ProfileInfo;
  skillsInfo: SkillsInfo;
  isLoading: boolean;
  errors: Record<string, string>;
}

// Custom hooks for state management
const useOnboardingFlow = () => {
  const [state, dispatch] = useReducer(onboardingReducer, initialState);

  const nextStep = () => dispatch({ type: "NEXT_STEP" });
  const prevStep = () => dispatch({ type: "PREV_STEP" });
  const updateBasicInfo = (info: BasicInfo) =>
    dispatch({ type: "UPDATE_BASIC_INFO", payload: info });

  return { state, nextStep, prevStep, updateBasicInfo };
};
```

### Progress Tracking

```typescript
// Progress tracking
const useProgress = () => {
  const [progress, setProgress] = useState(0);

  const updateProgress = (step: number, totalSteps: number) => {
    setProgress((step / totalSteps) * 100);
  };

  return { progress, updateProgress };
};
```

## 🔐 Form Validation

### Validation Rules

```typescript
// Validation utilities
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password: string): string[] => {
  const errors = [];
  if (password.length < 8)
    errors.push("Password must be at least 8 characters");
  if (!/[A-Z]/.test(password))
    errors.push("Password must contain uppercase letter");
  if (!/[0-9]/.test(password)) errors.push("Password must contain a number");
  return errors;
};

// Form validation hook
const useFormValidation = (formData: any, validationRules: any) => {
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    // Validation logic
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return { errors, validate };
};
```

## 🌐 API Integration

### Registration API

```typescript
// API service
class OnboardingAPI {
  static async registerUser(userData: UserRegistrationData) {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/auth/register`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      },
    );

    if (!response.ok) {
      throw new Error("Registration failed");
    }

    return response.json();
  }

  static async updateProfile(profileData: ProfileData) {
    // Profile update logic
  }
}

// API hooks
const useRegistration = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const register = async (userData: UserRegistrationData) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await OnboardingAPI.registerUser(userData);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { register, isLoading, error };
};
```

## 🎨 Styling & Design

### Tailwind Configuration

```javascript
// tailwind.config.js
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#eff6ff",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
        },
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
      },
    },
  },
};
```

### Component Styling

```typescript
// Styled components with Tailwind
const Button = ({ variant = 'primary', children, ...props }) => {
  const baseClasses = 'px-4 py-2 rounded-lg font-medium transition-colors'
  const variantClasses = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300'
  }

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]}`}
      {...props}
    >
      {children}
    </button>
  )
}
```

## 🚀 Deployment

### Build Configuration

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
        },
      },
    },
  },
  server: {
    port: 3003,
  },
});
```

### Deployment Options

```bash
# Build for production
pnpm build

# Preview build locally
pnpm preview

# Deploy to Vercel
vercel --prod

# Deploy to Netlify
netlify deploy --prod --dir=dist
```

## 🧪 Testing

### Component Testing

```typescript
// Example test structure (when implemented)
import { render, screen, fireEvent } from '@testing-library/react'
import { BasicInfoForm } from '@/components/forms/BasicInfoForm'

describe('BasicInfoForm', () => {
  it('validates email format', () => {
    render(<BasicInfoForm />)

    const emailInput = screen.getByLabelText('Email')
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } })

    expect(screen.getByText('Please enter a valid email')).toBeInTheDocument()
  })
})
```

## 🐛 Troubleshooting

### Common Issues

**Build Failures:**

- Check TypeScript errors: `pnpm type-check`
- Verify all imports are correct
- Ensure environment variables are set

**Development Server Issues:**

- Clear Vite cache: `rm -rf node_modules/.vite`
- Check port availability (3003)
- Verify dependencies are installed

**Routing Issues:**

- Check React Router configuration
- Verify route paths are correct
- Ensure proper navigation setup

## 📖 Contributing

### Development Guidelines

1. **Component Structure**: Follow established patterns
2. **Form Handling**: Use consistent validation approaches
3. **Styling**: Maintain design system consistency
4. **Accessibility**: Ensure proper ARIA labels and keyboard navigation
5. **Performance**: Optimize bundle size and loading times

### Adding New Steps

1. Create new page component in `/pages`
2. Add route to router configuration
3. Update onboarding flow state management
4. Add validation rules if needed
5. Update progress tracking

## 🔗 Integration Points

- **Platform**: Seamless redirect after completion
- **API**: User registration and profile creation
- **Analytics**: User onboarding funnel tracking

## 📊 Analytics & Monitoring

- **Conversion Tracking**: Step completion rates
- **Drop-off Analysis**: Where users abandon the flow
- **Performance Metrics**: Page load times and interactions
- **Error Tracking**: Form validation and API errors

---

**Part of the TBE Platform Monorepo**
