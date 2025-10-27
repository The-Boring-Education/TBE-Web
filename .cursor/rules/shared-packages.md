# 📦 TBE Platform - Shared Package Development Rules

## 📋 Overview

Shared packages are the backbone of the TBE Platform monorepo, providing consistent components, utilities, and types across all applications. This document defines the patterns and conventions for developing and maintaining shared packages.

## 🏗️ Package Structure

### Standard Package Organization
```
packages/package-name/
├── src/
│   ├── index.ts                # Main export file
│   ├── types/                  # TypeScript definitions
│   ├── components/             # React components (if applicable)
│   ├── hooks/                  # React hooks (if applicable)
│   ├── utils/                  # Utility functions
│   └── constants/              # Constants and enums
├── package.json                # Package configuration
├── tsconfig.json              # TypeScript configuration
├── eslint.config.js           # ESLint configuration
└── README.md                  # Package documentation
```

### Package Configuration Template
```json
{
  "name": "@tbe/package-name",
  "version": "0.0.0",
  "type": "module",
  "private": true,
  "license": "MIT",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": {
      "types": "./src/index.ts",
      "default": "./src/index.ts"
    }
  },
  "scripts": {
    "build": "tsc",
    "lint": "eslint .",
    "check-types": "tsc --noEmit"
  }
}
```

## 🧩 Components Package (`@tbe/components`)

### Component Organization
```typescript
// src/index.ts - Main exports
export * from './ui';           // Base UI components
export * from './common';       // Common components
export * from './admin';        // Admin components
export * from './quizes';       // Quiz-specific components
export * from './prepyatra';    // PrepYatra components
export * from './techyatra';    // TechYatra components

// Modular exports for tree-shaking
export { Button, Card, Modal } from './ui';
export { QuizCard, QuizTimer } from './quizes';
```

### Component Development Patterns
```typescript
// Component template with proper TypeScript
import React from 'react';
import { cn } from '@tbe/utils';
import type { ComponentProps } from '@tbe/types';

interface ButtonProps extends ComponentProps {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors';
  
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
    outline: 'border border-gray-300 bg-transparent hover:bg-gray-50'
  };
  
  const sizeClasses = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4 text-base',
    lg: 'h-12 px-6 text-lg'
  };

  return (
    <button
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        disabled && 'opacity-50 cursor-not-allowed',
        loading && 'cursor-wait',
        className
      )}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading ? (
        <>
          <LoadingSpinner className="mr-2 h-4 w-4" />
          Loading...
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
```

### App-Specific Component Organization
```typescript
// src/quizes/index.ts
export { QuizCard } from './QuizCard';
export { QuizTimer } from './QuizTimer';
export { QuizProgress } from './QuizProgress';
export { QuizResults } from './QuizResults';

// src/quizes/QuizCard.tsx
import type { Quiz } from '@tbe/types';

interface QuizCardProps {
  quiz: Quiz;
  onStart: (quizId: string) => void;
  showDifficulty?: boolean;
}

export const QuizCard: React.FC<QuizCardProps> = ({ quiz, onStart, showDifficulty = true }) => {
  // Component implementation
};
```

## 🎣 Hooks Package (`@tbe/hooks`)

### Hook Organization
```typescript
// src/index.ts
export * from './auth';         // Authentication hooks
export * from './api';          // API interaction hooks
export * from './ui';           // UI-related hooks
export * from './analytics';    // Analytics hooks
export * from './storage';      // Storage hooks
```

### Hook Development Patterns
```typescript
// src/auth/useAuth.ts
import { useSession } from 'next-auth/react';
import { useQuery } from 'react-query';
import { userService } from '@tbe/services';
import type { User } from '@tbe/types';

interface UseAuthReturn {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
}

export const useAuth = (): UseAuthReturn => {
  const { data: session, status } = useSession();
  
  const { data: user, isLoading: isUserLoading } = useQuery(
    ['user', session?.user?.id],
    () => userService.getUser(session!.user.id),
    {
      enabled: !!session?.user?.id,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  return {
    user: user || null,
    isLoading: status === 'loading' || isUserLoading,
    isAuthenticated: !!session,
    login: () => signIn('google'),
    logout: () => signOut()
  };
};
```

### Custom Hook Patterns
```typescript
// src/api/useApi.ts
import { useState, useCallback } from 'react';
import { apiService } from '@tbe/services';
import type { APIResponse } from '@tbe/types';

interface UseApiOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  showToast?: boolean;
}

export const useApi = <T = any>(options: UseApiOptions<T> = {}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(async (
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    data?: any
  ): Promise<T | null> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.request<T>({
        endpoint,
        method,
        data
      });
      
      if (response.status) {
        options.onSuccess?.(response.data);
        return response.data;
      } else {
        throw new Error(response.message || 'API request failed');
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      options.onError?.(error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [options]);

  return { execute, loading, error };
};
```

## ⚙️ Utils Package (`@tbe/utils`)

### Utility Organization
```typescript
// src/index.ts
export * from './auth';         // Authentication utilities
export * from './api';          // API utilities
export * from './format';       // Formatting utilities
export * from './validation';   // Validation utilities
export * from './storage';      // Storage utilities
export * from './dom';          // DOM manipulation utilities
```

### Utility Function Patterns
```typescript
// src/format/date.ts
export const formatDate = (date: Date | string, format: 'short' | 'long' | 'relative' = 'short'): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  switch (format) {
    case 'short':
      return dateObj.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    case 'long':
      return dateObj.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    case 'relative':
      return formatRelativeTime(dateObj);
    default:
      return dateObj.toLocaleDateString();
  }
};

// src/validation/schema.ts
import { z } from 'zod';

export const userSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  username: z.string().min(3, 'Username must be at least 3 characters').optional()
});

export const validateUser = (data: unknown) => {
  return userSchema.safeParse(data);
};
```

### Class Utility Pattern
```typescript
// src/dom/cn.ts - Class name utility
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

// Usage across components
import { cn } from '@tbe/utils';

const className = cn(
  'base-classes',
  variant === 'primary' && 'primary-classes',
  disabled && 'disabled-classes',
  props.className
);
```

## 📝 Types Package (`@tbe/types`)

### Type Organization
```typescript
// src/index.ts
export * from './common';       // Common types
export * from './database';     // Database model types
export * from './api';          // API request/response types
export * from './components';   // Component prop types
export * from './auth';         // Authentication types
export * from './quiz';         // Quiz-specific types
export * from './prepyatra';    // PrepYatra types
```

### Type Definition Patterns
```typescript
// src/common.ts
export interface BaseUser {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface User extends BaseUser {
  username?: string;
  avatar?: string;
  role: 'user' | 'admin';
  preferences: UserPreferences;
}

export interface APIResponse<T = any> {
  status: boolean;
  message?: string;
  data?: T;
  error?: any;
}

// src/components.ts
import type { ReactNode } from 'react';

export interface ComponentProps {
  children?: ReactNode;
  className?: string;
  id?: string;
}

export interface ButtonProps extends ComponentProps {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
}
```

## 🔌 Services Package (`@tbe/services`)

### Service Organization
```typescript
// src/index.ts
export { authService } from './auth';
export { userService } from './user';
export { quizService } from './quiz';
export { analyticsService } from './analytics';
export { apiService } from './api';
```

### Service Implementation Patterns
```typescript
// src/api/base.ts
import type { APIResponse } from '@tbe/types';

interface RequestOptions {
  endpoint: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: any;
  headers?: Record<string, string>;
}

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.VITE_BASE_API_URL || 'http://localhost:3004';
  }

  async request<T = any>(options: RequestOptions): Promise<APIResponse<T>> {
    const { endpoint, method = 'GET', data, headers = {} } = options;
    
    const config: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    if (data && method !== 'GET') {
      config.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, config);
      return await response.json();
    } catch (error) {
      throw new Error(`API request failed: ${error.message}`);
    }
  }
}

export const apiService = new ApiService();

// src/user/index.ts
import { apiService } from '../api';
import type { User, CreateUserPayload } from '@tbe/types';

class UserService {
  async getUser(userId: string): Promise<User> {
    const response = await apiService.request<User>({
      endpoint: `/api/v1/user?userId=${userId}`,
      method: 'GET'
    });
    
    if (!response.status) {
      throw new Error(response.message || 'Failed to fetch user');
    }
    
    return response.data!;
  }

  async createUser(userData: CreateUserPayload): Promise<User> {
    const response = await apiService.request<User>({
      endpoint: '/api/v1/user',
      method: 'POST',
      data: userData
    });
    
    if (!response.status) {
      throw new Error(response.message || 'Failed to create user');
    }
    
    return response.data!;
  }
}

export const userService = new UserService();
```

## 📋 Constants Package (`@tbe/constants`)

### Constants Organization
```typescript
// src/index.ts
export * from './routes';       // Application routes
export * from './api';          // API endpoints
export * from './database';     // Database constants
export * from './ui';           // UI constants
export * from './global';       // Global constants

// src/routes.ts
export const APP_URLS = {
  PLATFORM: process.env.NEXT_PUBLIC_PLATFORM_URL || 'http://localhost:3000',
  PREP_YATRA: process.env.NEXT_PUBLIC_PREP_YATRA_URL || 'http://localhost:3001',
  QUIZ: process.env.NEXT_PUBLIC_QUIZ_URL || 'http://localhost:3002',
  API: process.env.VITE_BASE_API_URL || 'http://localhost:3004'
} as const;

export const API_ROUTES = {
  USER: '/api/v1/user',
  QUIZ: '/api/v1/quiz',
  AUTH: '/api/auth'
} as const;
```

## 🔧 Package Development Guidelines

### 1. **Dependency Management**
```json
// Only include necessary dependencies
{
  "dependencies": {
    // Runtime dependencies only
    "react": "^18.0.0",
    "clsx": "^2.0.0"
  },
  "devDependencies": {
    // Development dependencies
    "@types/react": "^18.0.0",
    "typescript": "^5.0.0"
  },
  "peerDependencies": {
    // Let consuming apps provide these
    "react": ">=18.0.0",
    "next": ">=13.0.0"
  }
}
```

### 2. **Export Patterns**
```typescript
// Named exports for tree-shaking
export { Button } from './Button';
export { Card } from './Card';

// Default exports for main components
export { default as Button } from './Button';

// Re-exports for convenience
export * from './ui';
export type * from './types';
```

### 3. **TypeScript Configuration**
```json
{
  "extends": "@tbe/typescript-config/react-library.json",
  "compilerOptions": {
    "declaration": true,
    "declarationMap": true,
    "outDir": "dist",
    "rootDir": "./src"
  },
  "include": ["./src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

## 🚫 Package Anti-Patterns

### ❌ What NOT to Do

1. **Don't create circular dependencies**
```typescript
// BAD: Circular dependency
@tbe/components -> @tbe/hooks -> @tbe/components ❌

// GOOD: Linear dependency
@tbe/components -> @tbe/types ✅
@tbe/hooks -> @tbe/services -> @tbe/types ✅
```

2. **Don't include app-specific logic**
```typescript
// BAD: App-specific logic in shared package
export const navigateToQuizApp = () => {
  window.location.href = 'http://localhost:3002'; ❌
}

// GOOD: Generic utility with configuration
export const navigateToApp = (appUrl: string) => {
  window.location.href = appUrl; ✅
}
```

3. **Don't bundle large dependencies**
```typescript
// BAD: Heavy dependencies in shared packages
import * as lodash from 'lodash'; ❌

// GOOD: Lightweight alternatives or specific imports
import { clsx } from 'clsx'; ✅
```

## 🔍 Quality Checklist

### Before Publishing Package Updates
- ✅ All exports are properly typed
- ✅ No circular dependencies
- ✅ Tree-shaking friendly exports
- ✅ Proper peer dependencies declared
- ✅ Documentation updated
- ✅ Breaking changes documented
- ✅ Tests pass (if applicable)
- ✅ Bundle size impact assessed

### Package Health Metrics
- **Bundle size**: Monitor impact on consuming apps
- **Type coverage**: 100% TypeScript coverage
- **Export usage**: Track which exports are actually used
- **Dependency freshness**: Keep dependencies updated
- **Performance**: Benchmark critical utilities

This shared package architecture ensures consistency, reusability, and maintainability across the entire TBE platform ecosystem.
