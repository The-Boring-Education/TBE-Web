# 🎨 TBE Platform - Styling & UI Rules

## 📋 Overview

This document defines the styling conventions, UI patterns, and design system guidelines for all TBE Platform applications.

## 🎨 Design System Foundation

### Color Palette

```typescript
// Tailwind CSS custom colors (tailwind.config.js)
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#eff6ff",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
        },
        secondary: {
          50: "#f8fafc",
          500: "#64748b",
          600: "#475569",
        },
        success: {
          50: "#f0fdf4",
          500: "#22c55e",
          600: "#16a34a",
        },
        warning: {
          50: "#fffbeb",
          500: "#f59e0b",
          600: "#d97706",
        },
        error: {
          50: "#fef2f2",
          500: "#ef4444",
          600: "#dc2626",
        },
      },
    },
  },
};
```

### Typography Scale

```typescript
// Typography utilities
const typography = {
  // Headings
  h1: "text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl",
  h2: "text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl",
  h3: "text-2xl font-bold tracking-tight text-gray-900",
  h4: "text-xl font-semibold text-gray-900",
  h5: "text-lg font-semibold text-gray-900",
  h6: "text-base font-semibold text-gray-900",

  // Body text
  body: "text-base text-gray-700",
  bodyLarge: "text-lg text-gray-700",
  bodySmall: "text-sm text-gray-600",

  // Special text
  caption: "text-xs text-gray-500",
  overline: "text-xs font-medium uppercase tracking-wide text-gray-500",
};
```

## 🧩 Component Styling Patterns

### 1. Base Component Structure

```typescript
import { cn } from "@tbe/utils"
import { cva, type VariantProps } from "class-variance-authority"

const buttonVariants = cva(
    // Base styles
    "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
    {
        variants: {
            variant: {
                default: "bg-primary text-primary-foreground hover:bg-primary/90",
                destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
                outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
                secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
                ghost: "hover:bg-accent hover:text-accent-foreground",
                link: "text-primary underline-offset-4 hover:underline"
            },
            size: {
                default: "h-10 px-4 py-2",
                sm: "h-9 rounded-md px-3",
                lg: "h-11 rounded-md px-8",
                icon: "h-10 w-10"
            }
        },
        defaultVariants: {
            variant: "default",
            size: "default"
        }
    }
)

interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof buttonVariants> {
    asChild?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button"
        return (
            <Comp
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            />
        )
    }
)
```

### 2. Responsive Design Patterns

```typescript
// Mobile-first responsive component
export const ResponsiveCard: React.FC<CardProps> = ({ children, className }) => {
    return (
        <div className={cn(
            // Base styles
            "rounded-lg border bg-card text-card-foreground shadow-sm",
            // Responsive padding
            "p-4 sm:p-6 lg:p-8",
            // Responsive sizing
            "w-full max-w-sm sm:max-w-md lg:max-w-lg",
            // Responsive layout
            "flex flex-col space-y-4 sm:space-y-6",
            className
        )}>
            {children}
        </div>
    )
}

// Responsive grid system
export const ResponsiveGrid: React.FC<{
    children: React.ReactNode
    cols?: { default?: number; sm?: number; md?: number; lg?: number }
}> = ({ children, cols = { default: 1, sm: 2, md: 3, lg: 4 } }) => {
    return (
        <div className={cn(
            "grid gap-6",
            cols.default && `grid-cols-${cols.default}`,
            cols.sm && `sm:grid-cols-${cols.sm}`,
            cols.md && `md:grid-cols-${cols.md}`,
            cols.lg && `lg:grid-cols-${cols.lg}`
        )}>
            {children}
        </div>
    )
}
```

## 🌙 Dark Mode Support

### Theme Implementation

```typescript
// Theme provider setup
"use client"

import { createContext, useContext, useEffect, useState } from "react"

type Theme = "dark" | "light" | "system"

interface ThemeProviderProps {
    children: React.ReactNode
    defaultTheme?: Theme
    storageKey?: string
}

const ThemeProviderContext = createContext<{
    theme: Theme
    setTheme: (theme: Theme) => void
}>({
    theme: "system",
    setTheme: () => null
})

export function ThemeProvider({
    children,
    defaultTheme = "system",
    storageKey = "tbe-theme",
    ...props
}: ThemeProviderProps) {
    const [theme, setTheme] = useState<Theme>(
        () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
    )

    useEffect(() => {
        const root = window.document.documentElement

        root.classList.remove("light", "dark")

        if (theme === "system") {
            const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
                .matches
                ? "dark"
                : "light"

            root.classList.add(systemTheme)
            return
        }

        root.classList.add(theme)
    }, [theme])

    const value = {
        theme,
        setTheme: (theme: Theme) => {
            localStorage.setItem(storageKey, theme)
            setTheme(theme)
        }
    }

    return (
        <ThemeProviderContext.Provider {...props} value={value}>
            {children}
        </ThemeProviderContext.Provider>
    )
}

export const useTheme = () => {
    const context = useContext(ThemeProviderContext)

    if (context === undefined)
        throw new Error("useTheme must be used within a ThemeProvider")

    return context
}
```

### Dark Mode Styling

```typescript
// Component with dark mode support
export const Card: React.FC<CardProps> = ({ children, className }) => {
    return (
        <div className={cn(
            // Light mode
            "bg-white border-gray-200 text-gray-900",
            // Dark mode
            "dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100",
            // Base styles
            "rounded-lg border shadow-sm p-6",
            className
        )}>
            {children}
        </div>
    )
}
```

## 📱 Mobile-First Responsive Design

### Breakpoint Strategy

```typescript
// Tailwind breakpoints (mobile-first)
const breakpoints = {
    sm: "640px",   // Small devices (landscape phones)
    md: "768px",   // Medium devices (tablets)
    lg: "1024px",  // Large devices (desktops)
    xl: "1280px",  // Extra large devices
    "2xl": "1536px" // 2X Extra large devices
}

// Usage in components
export const ResponsiveLayout: React.FC = ({ children }) => {
    return (
        <div className={cn(
            // Mobile first (default)
            "px-4 py-6",
            // Small screens and up
            "sm:px-6 sm:py-8",
            // Medium screens and up
            "md:px-8 md:py-12",
            // Large screens and up
            "lg:px-12 lg:py-16"
        )}>
            {children}
        </div>
    )
}
```

### Navigation Patterns

```typescript
// Mobile-responsive navigation
export const Navigation: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <nav className="bg-white shadow-sm border-b dark:bg-gray-800 dark:border-gray-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* Logo */}
                    <div className="flex items-center">
                        <Logo className="h-8 w-auto" />
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        <NavLink href="/dashboard">Dashboard</NavLink>
                        <NavLink href="/courses">Courses</NavLink>
                        <NavLink href="/quizzes">Quizzes</NavLink>
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                        >
                            <MenuIcon className="h-6 w-6" />
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                <div className={cn(
                    "md:hidden",
                    isOpen ? "block" : "hidden"
                )}>
                    <div className="px-2 pt-2 pb-3 space-y-1">
                        <MobileNavLink href="/dashboard">Dashboard</MobileNavLink>
                        <MobileNavLink href="/courses">Courses</MobileNavLink>
                        <MobileNavLink href="/quizzes">Quizzes</MobileNavLink>
                    </div>
                </div>
            </div>
        </nav>
    )
}
```

## 🎯 Accessibility Guidelines

### ARIA and Semantic HTML

```typescript
// Accessible button component
export const AccessibleButton: React.FC<{
    children: React.ReactNode
    onClick: () => void
    disabled?: boolean
    loading?: boolean
    ariaLabel?: string
}> = ({ children, onClick, disabled, loading, ariaLabel }) => {
    return (
        <button
            onClick={onClick}
            disabled={disabled || loading}
            aria-label={ariaLabel}
            aria-disabled={disabled || loading}
            className={cn(
                "inline-flex items-center justify-center",
                "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
        >
            {loading && (
                <LoadingSpinner
                    className="mr-2 h-4 w-4"
                    aria-hidden="true"
                />
            )}
            {children}
        </button>
    )
}

// Accessible form input
export const AccessibleInput: React.FC<{
    label: string
    id: string
    error?: string
    required?: boolean
    type?: string
}> = ({ label, id, error, required, type = "text", ...props }) => {
    return (
        <div className="space-y-2">
            <label
                htmlFor={id}
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
                id={id}
                type={type}
                required={required}
                aria-invalid={!!error}
                aria-describedby={error ? `${id}-error` : undefined}
                className={cn(
                    "block w-full rounded-md border-gray-300 shadow-sm",
                    "focus:border-blue-500 focus:ring-blue-500",
                    "dark:bg-gray-700 dark:border-gray-600 dark:text-white",
                    error && "border-red-300 focus:border-red-500 focus:ring-red-500"
                )}
                {...props}
            />
            {error && (
                <p id={`${id}-error`} className="text-sm text-red-600" role="alert">
                    {error}
                </p>
            )}
        </div>
    )
}
```

### Focus Management

```typescript
// Focus trap for modals
import { useEffect, useRef } from "react"

export const Modal: React.FC<{
    isOpen: boolean
    onClose: () => void
    children: React.ReactNode
}> = ({ isOpen, onClose, children }) => {
    const modalRef = useRef<HTMLDivElement>(null)
    const previousFocusRef = useRef<HTMLElement | null>(null)

    useEffect(() => {
        if (isOpen) {
            previousFocusRef.current = document.activeElement as HTMLElement
            modalRef.current?.focus()
        } else {
            previousFocusRef.current?.focus()
        }
    }, [isOpen])

    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onClose()
            }
        }

        if (isOpen) {
            document.addEventListener("keydown", handleEscape)
            return () => document.removeEventListener("keydown", handleEscape)
        }
    }, [isOpen, onClose])

    if (!isOpen) return null

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            aria-modal="true"
            role="dialog"
        >
            <div
                className="fixed inset-0 bg-black bg-opacity-50"
                onClick={onClose}
                aria-hidden="true"
            />
            <div
                ref={modalRef}
                tabIndex={-1}
                className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6"
            >
                {children}
            </div>
        </div>
    )
}
```

## 🎨 Animation & Transitions

### Micro-interactions

```typescript
// Smooth transitions
export const AnimatedButton: React.FC<ButtonProps> = ({ children, className, ...props }) => {
    return (
        <button
            className={cn(
                "transform transition-all duration-200 ease-in-out",
                "hover:scale-105 hover:shadow-md",
                "active:scale-95",
                "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                className
            )}
            {...props}
        >
            {children}
        </button>
    )
}

// Loading states
export const LoadingCard: React.FC = () => {
    return (
        <div className="animate-pulse">
            <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-48 w-full mb-4" />
            <div className="space-y-2">
                <div className="bg-gray-200 dark:bg-gray-700 h-4 rounded w-3/4" />
                <div className="bg-gray-200 dark:bg-gray-700 h-4 rounded w-1/2" />
            </div>
        </div>
    )
}
```

## 🚫 Styling Anti-Patterns

### ❌ What NOT to Do

1. **Don't use inline styles**

```typescript
// BAD
<div style={{ marginTop: "20px", color: "red" }}>Content</div>

// GOOD
<div className="mt-5 text-red-500">Content</div>
```

2. **Don't ignore responsive design**

```typescript
// BAD: Fixed sizing
<div className="w-96 h-64">Content</div>

// GOOD: Responsive sizing
<div className="w-full max-w-sm sm:max-w-md lg:max-w-lg h-auto">Content</div>
```

3. **Don't skip accessibility**

```typescript
// BAD: No accessibility
<div onClick={handleClick}>Click me</div>

// GOOD: Proper accessibility
<button onClick={handleClick} aria-label="Submit form">
    Click me
</button>
```

## 🎯 Performance Optimization

### CSS Optimization

```typescript
// Purge unused styles in production
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

// Use CSS-in-JS sparingly
// Prefer Tailwind classes over styled-components for better performance
```

### Image Optimization

```typescript
import Image from "next/image"

export const OptimizedImage: React.FC<{
    src: string
    alt: string
    width: number
    height: number
    priority?: boolean
}> = ({ src, alt, width, height, priority = false }) => {
    return (
        <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            priority={priority}
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,..."
            className="rounded-lg object-cover"
        />
    )
}
```

This styling system ensures consistent, accessible, and performant UI across all TBE Platform applications.
