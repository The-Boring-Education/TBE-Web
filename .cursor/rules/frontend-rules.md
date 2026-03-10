# 🎨 TBE Platform - Frontend Development Rules

## 📋 Overview

This document defines the frontend development patterns, conventions, and best practices for all Next.js applications in the TBE Platform ecosystem.

## ⚛️ React & Next.js Patterns

### 1. Component Structure

```typescript
// Standard functional component pattern
import React from 'react';
import { cn } from '@tbe/utils';
import type { ComponentProps } from '@tbe/types';

interface PageComponentProps extends ComponentProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export const PageComponent: React.FC<PageComponentProps> = ({
  title,
  subtitle,
  actions,
  children,
  className
}) => {
  return (
    <div className={cn('container mx-auto px-4 py-8', className)}>
      <header className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
            {subtitle && (
              <p className="mt-2 text-lg text-gray-600">{subtitle}</p>
            )}
          </div>
          {actions && <div className="flex gap-4">{actions}</div>}
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
};

export default PageComponent;
```

### 2. Page Structure (App Router)

```typescript
// app/dashboard/page.tsx
import { Metadata } from 'next';
import { DashboardContent } from '@/components/dashboard/DashboardContent';
import { ProtectedRoute } from '@tbe/auth';

export const metadata: Metadata = {
  title: 'Dashboard | TBE Platform',
  description: 'Your personalized learning dashboard'
};

interface DashboardPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default function DashboardPage({ searchParams }: DashboardPageProps) {
  return (
    <ProtectedRoute>
      <DashboardContent searchParams={searchParams} />
    </ProtectedRoute>
  );
}
```

### 3. Client Components

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useAuth, useApi } from '@tbe/hooks';
import { Button, Card, LoadingSpinner } from '@tbe/components';
import type { User, Quiz } from '@tbe/types';

interface QuizDashboardProps {
  initialQuizzes?: Quiz[];
}

export const QuizDashboard: React.FC<QuizDashboardProps> = ({
  initialQuizzes = []
}) => {
  const { user, isAuthenticated } = useAuth();
  const { execute: fetchQuizzes, loading } = useApi<Quiz[]>();
  const [quizzes, setQuizzes] = useState<Quiz[]>(initialQuizzes);

  useEffect(() => {
    if (isAuthenticated && initialQuizzes.length === 0) {
      fetchQuizzes('/api/v1/quiz', 'GET').then(data => {
        if (data) setQuizzes(data);
      });
    }
  }, [isAuthenticated, fetchQuizzes, initialQuizzes.length]);

  if (loading) {
    return <LoadingSpinner className="mx-auto" />;
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {quizzes.map(quiz => (
        <QuizCard key={quiz.id} quiz={quiz} />
      ))}
    </div>
  );
};
```

## 🎣 State Management Patterns

### 1. React Query for Server State

```typescript
// hooks/useQuizzes.ts
import { useQuery, useMutation, useQueryClient } from "react-query";
import { quizService } from "@tbe/services";
import type { Quiz, CreateQuizPayload } from "@tbe/types";

export const useQuizzes = (userId?: string) => {
  return useQuery(
    ["quizzes", userId],
    () => quizService.getUserQuizzes(userId!),
    {
      enabled: !!userId,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
  );
};

export const useCreateQuiz = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (quizData: CreateQuizPayload) => quizService.createQuiz(quizData),
    {
      onSuccess: (newQuiz) => {
        // Update the quizzes cache
        queryClient.setQueryData(["quizzes"], (oldQuizzes: Quiz[] = []) => [
          ...oldQuizzes,
          newQuiz,
        ]);

        // Show success toast
        toast.success("Quiz created successfully!");
      },
      onError: (error) => {
        toast.error(error.message || "Failed to create quiz");
      },
    },
  );
};
```

### 2. Local State with useState/useReducer

```typescript
// For complex local state
import { useReducer } from "react";

interface QuizState {
  currentQuestion: number;
  answers: Record<string, string>;
  timeRemaining: number;
  isSubmitted: boolean;
}

type QuizAction =
  | { type: "NEXT_QUESTION" }
  | { type: "ANSWER_QUESTION"; questionId: string; answer: string }
  | { type: "TICK_TIMER" }
  | { type: "SUBMIT_QUIZ" };

const quizReducer = (state: QuizState, action: QuizAction): QuizState => {
  switch (action.type) {
    case "NEXT_QUESTION":
      return { ...state, currentQuestion: state.currentQuestion + 1 };
    case "ANSWER_QUESTION":
      return {
        ...state,
        answers: { ...state.answers, [action.questionId]: action.answer },
      };
    case "TICK_TIMER":
      return { ...state, timeRemaining: Math.max(0, state.timeRemaining - 1) };
    case "SUBMIT_QUIZ":
      return { ...state, isSubmitted: true };
    default:
      return state;
  }
};

export const useQuizState = (initialTime: number) => {
  const [state, dispatch] = useReducer(quizReducer, {
    currentQuestion: 0,
    answers: {},
    timeRemaining: initialTime,
    isSubmitted: false,
  });

  return { state, dispatch };
};
```

### 3. Context for App-Wide State

```typescript
// contexts/ThemeContext.tsx
'use client';

import { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const [theme, setTheme] = useState<Theme>('system');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const stored = localStorage.getItem('theme') as Theme;
    if (stored) setTheme(stored);
  }, []);

  useEffect(() => {
    localStorage.setItem('theme', theme);

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark' : 'light';
      setResolvedTheme(systemTheme);
    } else {
      setResolvedTheme(theme);
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
```

## 🎨 Styling & UI Patterns

### 1. Tailwind CSS Conventions

```typescript
// Component with responsive design
export const ResponsiveCard: React.FC<CardProps> = ({ children, className }) => {
  return (
    <div className={cn(
      // Base styles
      'rounded-lg border bg-white shadow-sm',
      // Responsive padding
      'p-4 sm:p-6 lg:p-8',
      // Responsive layout
      'w-full max-w-sm sm:max-w-md lg:max-w-lg',
      // Dark mode support
      'dark:bg-gray-800 dark:border-gray-700',
      // Hover states
      'hover:shadow-md transition-shadow duration-200',
      className
    )}>
      {children}
    </div>
  );
};

// Utility classes for common patterns
const commonClasses = {
  container: 'container mx-auto px-4 sm:px-6 lg:px-8',
  button: 'inline-flex items-center justify-center rounded-md font-medium transition-colors',
  input: 'block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500',
  card: 'rounded-lg border bg-white p-6 shadow-sm dark:bg-gray-800 dark:border-gray-700'
};
```

### 2. Component Variants with CVA

```typescript
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@tbe/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'underline-offset-4 hover:underline text-primary'
      },
      size: {
        default: 'h-10 py-2 px-4',
        sm: 'h-9 px-3 rounded-md',
        lg: 'h-11 px-8 rounded-md',
        icon: 'h-10 w-10'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  className,
  variant,
  size,
  asChild = false,
  ...props
}) => {
  const Comp = asChild ? Slot : 'button';
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
};
```

## 🔐 Authentication Patterns

### 1. Protected Routes

```typescript
// components/auth/ProtectedRoute.tsx
'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { LoadingSpinner } from '@tbe/components';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  requireAdmin = false,
  redirectTo = '/auth/signin'
}) => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return; // Still loading

    if (requireAuth && !session) {
      router.push(redirectTo);
      return;
    }

    if (requireAdmin && session?.user?.role !== 'admin') {
      router.push('/unauthorized');
      return;
    }
  }, [session, status, requireAuth, requireAdmin, redirectTo, router]);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (requireAuth && !session) {
    return null; // Will redirect
  }

  if (requireAdmin && session?.user?.role !== 'admin') {
    return null; // Will redirect
  }

  return <>{children}</>;
};
```

### 2. Auth Hooks

```typescript
// hooks/useRequireAuth.ts
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export const useRequireAuth = (redirectTo = "/auth/signin") => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push(redirectTo);
    }
  }, [session, status, redirectTo, router]);

  return { session, loading: status === "loading" };
};

// hooks/usePermissions.ts
export const usePermissions = () => {
  const { data: session } = useSession();

  const hasPermission = (permission: string) => {
    return session?.user?.permissions?.includes(permission) ?? false;
  };

  const isAdmin = () => {
    return session?.user?.role === "admin";
  };

  const canAccess = (resource: string, action: string) => {
    return hasPermission(`${resource}:${action}`) || isAdmin();
  };

  return { hasPermission, isAdmin, canAccess };
};
```

## 📱 Responsive Design Patterns

### 1. Mobile-First Approach

```typescript
// Responsive component example
export const ResponsiveNavigation: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Logo className="h-8 w-auto" />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <NavLink href="/dashboard">Dashboard</NavLink>
              <NavLink href="/courses">Courses</NavLink>
              <NavLink href="/quizzes">Quizzes</NavLink>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500"
            >
              <MenuIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <MobileNavLink href="/dashboard">Dashboard</MobileNavLink>
              <MobileNavLink href="/courses">Courses</MobileNavLink>
              <MobileNavLink href="/quizzes">Quizzes</MobileNavLink>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
```

### 2. Responsive Grid Layouts

```typescript
// Responsive grid component
interface ResponsiveGridProps {
  children: React.ReactNode;
  cols?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: number;
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  cols = { default: 1, sm: 2, md: 3, lg: 4 },
  gap = 6
}) => {
  const gridClasses = cn(
    'grid',
    `gap-${gap}`,
    cols.default && `grid-cols-${cols.default}`,
    cols.sm && `sm:grid-cols-${cols.sm}`,
    cols.md && `md:grid-cols-${cols.md}`,
    cols.lg && `lg:grid-cols-${cols.lg}`,
    cols.xl && `xl:grid-cols-${cols.xl}`
  );

  return <div className={gridClasses}>{children}</div>;
};
```

## 🔄 Data Fetching Patterns

### 1. Server Components (App Router)

```typescript
// app/courses/page.tsx
import { Suspense } from 'react';
import { CourseGrid } from '@/components/courses/CourseGrid';
import { CourseFilters } from '@/components/courses/CourseFilters';
import { LoadingSpinner } from '@tbe/components';

async function getCourses(searchParams: any) {
  const response = await fetch(`${process.env.API_URL}/api/v1/courses`, {
    next: { revalidate: 300 } // Revalidate every 5 minutes
  });

  if (!response.ok) {
    throw new Error('Failed to fetch courses');
  }

  return response.json();
}

interface CoursesPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function CoursesPage({ searchParams }: CoursesPageProps) {
  const courses = await getCourses(searchParams);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Courses</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="lg:w-64">
          <CourseFilters />
        </aside>

        <main className="flex-1">
          <Suspense fallback={<LoadingSpinner />}>
            <CourseGrid courses={courses} />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
```

### 2. Client-Side Data Fetching

```typescript
// components/UserDashboard.tsx
'use client';

import { useQuery } from 'react-query';
import { userService } from '@tbe/services';
import { LoadingSpinner, ErrorBoundary } from '@tbe/components';

export const UserDashboard: React.FC<{ userId: string }> = ({ userId }) => {
  const {
    data: dashboardData,
    isLoading,
    error,
    refetch
  } = useQuery(
    ['dashboard', userId],
    () => userService.getDashboard(userId),
    {
      staleTime: 2 * 60 * 1000, // 2 minutes
      retry: 3,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000)
    }
  );

  if (isLoading) {
    return <LoadingSpinner className="mx-auto mt-8" />;
  }

  if (error) {
    return (
      <ErrorBoundary
        error={error}
        onRetry={refetch}
        message="Failed to load dashboard data"
      />
    );
  }

  return (
    <div className="space-y-8">
      <StatsCards stats={dashboardData.stats} />
      <RecentActivity activities={dashboardData.activities} />
      <ProgressCharts progress={dashboardData.progress} />
    </div>
  );
};
```

## 🚫 Frontend Anti-Patterns

### ❌ What NOT to Do

1. **Don't use inline styles**

```typescript
// BAD
<div style={{ marginTop: '20px', color: 'red' }}>Content</div>

// GOOD
<div className="mt-5 text-red-500">Content</div>
```

2. **Don't fetch data in useEffect for server-renderable content**

```typescript
// BAD - Client-side fetching for static data
useEffect(() => {
  fetch("/api/courses")
    .then((res) => res.json())
    .then(setCourses);
}, []);

// GOOD - Server component or React Query
const { data: courses } = useQuery("courses", () => courseService.getCourses());
```

3. **Don't create unnecessary client components**

```typescript
// BAD - Making everything client-side
'use client';
export const StaticContent = () => <div>Static content</div>;

// GOOD - Keep server components when possible
export const StaticContent = () => <div>Static content</div>;
```

4. **Don't ignore loading and error states**

```typescript
// BAD - No loading/error handling
const { data } = useQuery('users', fetchUsers);
return <div>{data.map(user => <UserCard key={user.id} user={user} />)}</div>;

// GOOD - Proper state handling
const { data, isLoading, error } = useQuery('users', fetchUsers);
if (isLoading) return <LoadingSpinner />;
if (error) return <ErrorMessage error={error} />;
return <div>{data?.map(user => <UserCard key={user.id} user={user} />)}</div>;
```

## 🎯 Performance Optimization

### 1. Code Splitting

```typescript
// Dynamic imports for heavy components
import dynamic from 'next/dynamic';

const HeavyChart = dynamic(() => import('@/components/HeavyChart'), {
  loading: () => <ChartSkeleton />,
  ssr: false
});

// Route-level code splitting
const AdminPanel = dynamic(() => import('@/components/admin/AdminPanel'), {
  loading: () => <LoadingSpinner />
});
```

### 2. Image Optimization

```typescript
import Image from 'next/image';

export const OptimizedImage: React.FC<{
  src: string;
  alt: string;
  width: number;
  height: number;
}> = ({ src, alt, width, height }) => {
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ..."
      className="rounded-lg object-cover"
      priority={false} // Set to true for above-the-fold images
    />
  );
};
```

### 3. Memoization

```typescript
import { memo, useMemo, useCallback } from 'react';

// Memoize expensive components
export const ExpensiveComponent = memo<{ data: any[] }>(({ data }) => {
  const processedData = useMemo(() => {
    return data.map(item => expensiveProcessing(item));
  }, [data]);

  const handleClick = useCallback((id: string) => {
    // Handle click logic
  }, []);

  return (
    <div>
      {processedData.map(item => (
        <Item key={item.id} item={item} onClick={handleClick} />
      ))}
    </div>
  );
});
```

This frontend architecture ensures consistent, performant, and maintainable React applications across the TBE platform ecosystem.
