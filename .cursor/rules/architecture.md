# 🏗️ TBE Platform - Architecture Rules

## 📋 Overview

The TBE Platform follows a **Turborepo monorepo architecture** with shared packages, centralized configuration, and distributed applications. This document defines the architectural patterns and conventions that must be followed.

## 🏢 Monorepo Structure

### Directory Organization

```
tbe-platform/
├── apps/                        # 📱 Applications
│   ├── platform/               # Main TBE platform (Port: 3000)
│   ├── prep-yatra/             # Interview prep tool (Port: 3001)
│   ├── quizes/                 # Quiz platform (Port: 3002)
│   ├── onboarding/             # User onboarding (Port: 3003)
│   ├── api/                    # API service (Port: 3004)
│   ├── techyatra/              # Tech learning (Port: 3005)
│   ├── dsayatra/               # DSA practice (Port: 3006)
│   └── resume-yatra/           # Resume builder (Port: 3007)
├── packages/                    # 📦 Shared Packages
│   ├── components/             # UI components library
│   ├── hooks/                  # Shared React hooks
│   ├── utils/                  # Utility functions
│   ├── types/                  # TypeScript definitions
│   ├── constants/              # Shared constants
│   ├── services/               # API service functions
│   ├── auth/                   # Authentication logic
│   ├── interface/              # Interface definitions
│   ├── config/                 # Shared configurations
│   ├── eslint-config/          # ESLint configurations
│   └── typescript-config/      # TypeScript configurations
└── the-boring-apis/            # 🌐 Centralized Backend
```

### Package Naming Convention

```json
{
  "name": "@tbe/package-name",
  "version": "0.0.0",
  "private": true
}
```

## 📦 Shared Package Architecture

### 1. Components Package (`@tbe/components`)

```typescript
// Structure
src/
├── index.ts                    # Main exports
├── ui/                         # Base UI components
│   ├── button/
│   ├── card/
│   ├── modal/
│   └── index.ts
├── common/                     # Common components
├── admin/                      # Admin-specific components
├── quizes/                     # Quiz-specific components
├── prepyatra/                  # PrepYatra-specific components
└── techyatra/                  # TechYatra-specific components

// Export pattern
export { Button, Card, Modal } from './ui';
export { QuizCard, QuizTimer } from './quizes';
export { PrepCard, ChallengeCard } from './prepyatra';
```

### 2. Types Package (`@tbe/types`)

```typescript
// Centralized type definitions
export * from './common';        # Common types
export * from './database';      # Database models
export * from './api';          # API interfaces
export * from './components';   # Component props
export * from './auth';         # Authentication types
```

### 3. Services Package (`@tbe/services`)

```typescript
// API service organization
export { authService } from "./auth";
export { userService } from "./user";
export { quizService } from "./quiz";
export { analyticsService } from "./analytics";
```

## 🔗 Inter-App Communication

### 1. Cross-App Navigation

```typescript
// Use constants for app URLs
import { APP_URLS } from "@tbe/constants";

// Navigate between apps
const navigateToQuiz = (quizId: string) => {
  window.location.href = `${APP_URLS.QUIZ}/${quizId}`;
};

// Environment-based URLs
const getAppUrl = (app: string) => {
  return process.env.NODE_ENV === "production"
    ? `https://${app}.theboringeducation.com`
    : `http://localhost:${getPortForApp(app)}`;
};
```

### 2. Shared State Management

```typescript
// Use React Query for shared state
import { useQuery, useMutation } from "react-query";
import { userService } from "@tbe/services";

// Shared user state across apps
export const useUser = (userId: string) => {
  return useQuery(["user", userId], () => userService.getUser(userId), {
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};
```

### 3. Event Communication

```typescript
// Custom events for cross-app communication
export const emitUserUpdate = (user: User) => {
  window.dispatchEvent(
    new CustomEvent("user:updated", {
      detail: user,
    }),
  );
};

export const listenForUserUpdates = (callback: (user: User) => void) => {
  const handler = (event: CustomEvent) => callback(event.detail);
  window.addEventListener("user:updated", handler);
  return () => window.removeEventListener("user:updated", handler);
};
```

## 🔧 Configuration Management

### 1. Environment Variables

```typescript
// Shared environment configuration
// turbo.json - defines required env vars
{
  "build": {
    "env": [
      "MONGODB_URI",
      "NEXTAUTH_SECRET",
      "GOOGLE_AUTH_CLIENT_ID",
      "OPENAI_API_KEY",
      "VITE_BASE_API_URL"
    ]
  }
}

// App-specific overrides in individual .env.local files
```

### 2. Shared Configuration

```typescript
// packages/config/src/index.ts
export const config = {
  api: {
    baseUrl: process.env.VITE_BASE_API_URL || "http://localhost:3004",
    timeout: 30000,
    retries: 3,
  },
  auth: {
    sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
    refreshThreshold: 5 * 60 * 1000, // 5 minutes
  },
  ui: {
    defaultPageSize: 20,
    maxFileSize: 10 * 1024 * 1024, // 10MB
    supportedImageTypes: ["jpg", "jpeg", "png", "webp"],
  },
};
```

## 🚀 Build & Development Architecture

### 1. Turborepo Configuration

```json
// turbo.json
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^lint"]
    }
  }
}
```

### 2. Package Dependencies

```typescript
// Dependency hierarchy (apps depend on packages)
apps/platform -> @tbe/components, @tbe/hooks, @tbe/utils
apps/quizes   -> @tbe/components, @tbe/hooks, @tbe/utils
packages/components -> @tbe/types, @tbe/constants
packages/hooks -> @tbe/services, @tbe/types
```

### 3. Development Scripts

```bash
# Root level commands
pnpm dev                    # All apps in parallel
pnpm dev:platform          # Specific app
pnpm build                  # All apps
pnpm lint                   # All packages
pnpm clean                  # Clean all builds

# Package filtering
pnpm --filter @tbe/platform add lodash
pnpm --filter @tbe/components build
```

## 🔐 Security Architecture

### 1. Authentication Flow

```typescript
// Centralized auth through NextAuth.js
// Each app uses the same auth configuration
import { authOptions } from "@tbe/auth";

// Session sharing across subdomains
export const authOptions = {
  // ... configuration
  cookies: {
    sessionToken: {
      name: "next-auth.session-token",
      options: {
        domain: ".theboringeducation.com",
        httpOnly: true,
        secure: true,
      },
    },
  },
};
```

### 2. API Security

```typescript
// Centralized API security patterns
import { withAuth, rateLimiter } from "@tbe/middleware";

// Protected API routes
export default withAuth(
  async (req, res) => {
    // Rate limiting
    await rateLimiter(req, res);

    // Business logic
  },
  { requireAuth: true },
);
```

## 📊 Data Architecture

### 1. Database Strategy

```typescript
// Single MongoDB instance with collection organization
collections: {
    users: 'users',
    courses: 'shiksha_courses',
    quizzes: 'quiz_data',
    projects: 'user_projects',
    analytics: 'user_analytics'
}

// Shared database models in centralized API
// Apps communicate via API, not direct DB access
```

### 2. Caching Strategy

```typescript
// Multi-level caching
export const cacheStrategy = {
  // 1. Browser cache (React Query)
  client: {
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  },

  // 2. API response cache
  api: {
    redis: process.env.REDIS_URL,
    ttl: 15 * 60, // 15 minutes
  },

  // 3. CDN cache for static assets
  cdn: {
    maxAge: 31536000, // 1 year
    staleWhileRevalidate: 86400, // 1 day
  },
};
```

## 🔄 Deployment Architecture

### 1. Application Deployment

```yaml
# Each app deployed independently
platform:      vercel.com/tbe/platform
prep-yatra:     vercel.com/tbe/prep-yatra
quizes:         vercel.com/tbe/quizes
api:            cloud.google.com/run/tbe-apis

# Shared domain strategy
platform.theboringeducation.com
prep.theboringeducation.com
quiz.theboringeducation.com
api.theboringeducation.com
```

### 2. CI/CD Pipeline

```typescript
// GitHub Actions workflow
export const deploymentFlow = {
  // 1. Code push to branch
  trigger: ["push", "pull_request"],

  // 2. Build all affected apps
  build: "turbo run build --filter=[HEAD^1]",

  // 3. Run tests and linting
  test: "turbo run test lint --filter=[HEAD^1]",

  // 4. Deploy to appropriate environment
  deploy: {
    development: "auto-deploy on merge",
    production: "manual approval required",
  },
};
```

## 🎯 Architecture Principles

### 1. **Separation of Concerns**

- **Apps**: UI and user experience
- **Packages**: Shared logic and components
- **API**: Data and business logic
- **Database**: Data persistence

### 2. **Dependency Direction**

```
Apps → Packages → External Libraries
  ↓
 API → Database
```

### 3. **Scalability Patterns**

- **Horizontal scaling**: Add more app instances
- **Vertical scaling**: Optimize shared packages
- **Caching**: Multi-level caching strategy
- **CDN**: Static asset distribution

### 4. **Maintainability**

- **Single source of truth**: Shared packages
- **Consistent patterns**: Enforced through rules
- **Type safety**: TypeScript throughout
- **Documentation**: Living documentation in code

## 🚫 Architecture Anti-Patterns

### ❌ What NOT to Do

1. **Don't create circular dependencies**

```typescript
// BAD: packages depending on apps
@tbe/components -> apps/platform ❌

// GOOD: apps depending on packages
apps/platform -> @tbe/components ✅
```

2. **Don't duplicate shared logic**

```typescript
// BAD: Copying utility functions
apps/platform/utils/formatDate.ts ❌
apps/quizes/utils/formatDate.ts ❌

// GOOD: Using shared utilities
@tbe/utils/formatDate.ts ✅
```

3. **Don't bypass the API layer**

```typescript
// BAD: Direct database access from apps
import { User } from 'mongoose'; ❌

// GOOD: API calls through services
import { userService } from '@tbe/services'; ✅
```

4. **Don't hardcode cross-app URLs**

```typescript
// BAD: Hardcoded URLs
const quizUrl = 'http://localhost:3002'; ❌

// GOOD: Environment-based configuration
const quizUrl = APP_URLS.QUIZ; ✅
```

## 🔍 Architecture Validation

### Checklist for New Features

- ✅ Uses appropriate shared packages
- ✅ Follows dependency direction rules
- ✅ Implements proper error boundaries
- ✅ Uses centralized configuration
- ✅ Maintains type safety throughout
- ✅ Follows security best practices
- ✅ Implements proper caching strategy
- ✅ Uses established communication patterns

### Performance Considerations

- **Bundle size**: Monitor shared package impact
- **Load times**: Implement code splitting
- **API calls**: Batch and cache appropriately
- **Memory usage**: Clean up subscriptions and listeners
- **Network**: Minimize cross-app communication

This architecture ensures scalability, maintainability, and consistency across the entire TBE platform ecosystem.
