# 🧭 Prep Yatra - Interview Preparation Platform

A comprehensive interview preparation platform designed to help developers ace their tech interviews with structured challenges, mentorship, and progress tracking.

## 📋 Overview

Prep Yatra is a Next.js application focused on providing a complete interview preparation experience with challenges, coding practice, mentorship opportunities, and detailed progress analytics.

### Key Features

- **Structured Challenges**: Curated coding challenges by difficulty and topic
- **Progress Tracking**: Detailed analytics and performance insights
- **Mentorship Program**: Connect with industry mentors
- **Interview Simulation**: Mock interview sessions
- **Company-Specific Prep**: Targeted preparation for specific companies
- **Coding Practice**: Interactive coding environment

## 🛠️ Tech Stack

- **Framework**: Next.js 15.5.3
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Authentication**: NextAuth.js
- **State Management**: React Query
- **Forms**: React Hook Form + Zod validation
- **UI Components**: Radix UI primitives
- **Charts**: Recharts
- **Themes**: next-themes

## 🚀 Development

### Prerequisites

- Node.js >= 20.x
- pnpm >= 9.12.0
- Access to TBE API services

### Setup

```bash
# From monorepo root
pnpm install

# Start prep-yatra app only
pnpm dev:prep-yatra

# Or start all apps
pnpm dev
```

The app will be available at `http://localhost:3001`

### Environment Variables

Create `.env.local` in the app directory:

```bash
# Authentication
NEXTAUTH_SECRET=your-secret-key

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3004
NEXT_PUBLIC_BASE_URL=http://localhost:3001

# External Services
NEXT_PUBLIC_PLATFORM_URL=http://localhost:3000
NEXT_PUBLIC_QUIZ_URL=http://localhost:3002

# Database (if using direct connection)
MONGODB_URI=mongodb://localhost:27017/prep-yatra

# Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=your-ga-id
```

## 📁 Project Structure

```
apps/prep-yatra/
├── src/
│   ├── app/                # Next.js 13+ app directory
│   │   ├── (auth)/         # Authentication pages
│   │   ├── challenges/     # Challenge pages
│   │   ├── dashboard/      # User dashboard
│   │   ├── mentorship/     # Mentorship features
│   │   └── progress/       # Progress tracking
│   ├── components/         # App-specific components
│   │   ├── ui/            # shadcn/ui components
│   │   ├── challenges/    # Challenge-related components
│   │   ├── dashboard/     # Dashboard components
│   │   └── forms/         # Form components
│   ├── hooks/             # App-specific hooks
│   ├── lib/               # Utilities and configurations
│   ├── types/             # TypeScript type definitions
│   └── styles/            # Global styles
├── public/                # Static assets
├── components.json        # shadcn/ui configuration
├── tailwind.config.ts     # Tailwind configuration
└── tsconfig.json         # TypeScript configuration
```

## 🔧 Available Scripts

```bash
# Development
pnpm dev                   # Start development server (port 3001)

# Building
pnpm build                 # Build for production (includes linting)
pnpm start                 # Start production server

# Code Quality
pnpm lint                  # Run ESLint
pnpm lint:fix             # Fix ESLint issues

# Export
pnpm export               # Export static site
```

## 📚 Key Features & Components

### Challenge System

```typescript
// Challenge types
interface Challenge {
  id: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  category: string;
  description: string;
  testCases: TestCase[];
  solution?: string;
}

// Usage
import { ChallengeCard, ChallengeList } from "@/components/challenges";
```

### Progress Tracking

```typescript
// Progress analytics
import { ProgressChart, StatsCard } from "@/components/dashboard";

// Track user progress
const { progress, stats } = useProgress();
```

### Mentorship Features

```typescript
// Mentorship components
import { MentorCard, BookingForm } from "@/components/mentorship";

// Connect with mentors
const { mentors, bookSession } = useMentorship();
```

## 🎨 UI Components

Built with shadcn/ui and Radix UI:

```typescript
// Import UI components
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";

// Feature components from shared packages
import { ChallengeCard, PrepYatraHero, PrepLogsList } from "@tbe/components";
```

## 🔐 Authentication & Authorization

```typescript
// Authentication hook
import { useAuth } from '@tbe/hooks'

const { user, isLoading, signIn, signOut } = useAuth()

// Protected routes
import { ProtectedRoute } from '@tbe/components'

<ProtectedRoute requiredRole="student">
  <ChallengesPage />
</ProtectedRoute>
```

## 📊 Data Management

### API Integration

```typescript
// API hooks
import { useChallenges, useProgress } from "@/hooks/api";

// Fetch challenges
const { data: challenges, isLoading } = useChallenges({
  difficulty: "Medium",
  category: "Arrays",
});

// Submit solution
const { mutate: submitSolution } = useSubmitSolution();
```

### Form Handling

```typescript
// Form with validation
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  solution: z.string().min(1, "Solution is required"),
  language: z.enum(["javascript", "python", "java"]),
});

const form = useForm({
  resolver: zodResolver(schema),
});
```

## 🎯 Key Pages & Routes

### Public Routes

- `/` - Landing page and hero section
- `/challenges` - Browse available challenges
- `/mentors` - View available mentors
- `/pricing` - Subscription plans

### Protected Routes

- `/dashboard` - User dashboard with progress
- `/challenges/[id]` - Individual challenge page
- `/progress` - Detailed progress analytics
- `/mentorship/sessions` - Booked mentorship sessions
- `/profile` - User profile and settings

## 🚀 Deployment

### Vercel (Recommended)

The app is configured for automatic deployment on Vercel:

```bash
# Deploy to production
vercel --prod

# Preview deployment
vercel
```

### Environment Variables (Production)

**⚠️ CRITICAL:** All these environment variables MUST be set in Vercel/Production:

```bash
# NextAuth Configuration (REQUIRED) ⚠️
# Generate with: openssl rand -base64 32
NEXTAUTH_SECRET=your-production-secret-here

# API Configuration (REQUIRED) ⚠️
NEXT_PUBLIC_API_URL=https://api.theboringeducation.com/api/v1
API_URL=https://api.theboringeducation.com/api/v1

# Google OAuth (REQUIRED) ⚠️
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Optional - Cross-subdomain SSO
COOKIE_DOMAIN=.theboringeducation.com

# Database (if using direct connection)
MONGODB_URI=mongodb+srv://...

# External Services
NEXT_PUBLIC_PLATFORM_URL=https://platform.theboringeducation.com
NEXT_PUBLIC_QUIZ_URL=https://quiz.theboringeducation.com

# Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=your-ga-id

# Node Environment
NODE_ENV=production
```

#### How to Generate NEXTAUTH_SECRET

```bash
# Using OpenSSL (recommended)
openssl rand -base64 32

# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

#### Setting Environment Variables in Vercel

1. Go to: `https://vercel.com/your-team/prep-yatra/settings/environment-variables`
2. Add each variable above
3. Select environment: **Production**, **Preview**, and **Development**
4. Click "Save"
5. **Redeploy** the application

## 🧪 Testing

```bash
# Run tests (when implemented)
pnpm test

# Type checking
pnpm type-check

# Lint checking
pnpm lint
```

## 🐛 Troubleshooting

### Common Issues

**Build Failures:**

- Ensure all TypeScript errors are resolved
- Check ESLint configuration
- Verify all imports are correct

**Authentication Issues:**

- Verify NextAuth configuration
- Check environment variables
- Ensure API endpoints are accessible

**Production NextAuth 500 Error:**

If you see these errors in production console:

```
Failed to load resource: the server responded with a status of 500
[next-auth][error][CLIENT_FETCH_ERROR]
Unexpected token '<', "<!DOCTYPE "... is not valid JSON
```

**Causes & Solutions:**

1. **Missing `NEXTAUTH_SECRET`** ❌
   - Error: `NEXTAUTH_SECRET environment variable is required`
   - Solution: Add `NEXTAUTH_SECRET` in Vercel environment variables
   - Generate: `openssl rand -base64 32`

2. **Missing `API_URL`** ❌
   - Error: User creation/fetch fails in callbacks
   - Solution: Add both `API_URL` and `NEXT_PUBLIC_API_URL`

3. **Missing Google OAuth credentials** ❌
   - Error: Provider authentication fails
   - Solution: Add `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`

**Quick Fix Steps:**

1. Go to Vercel → Settings → Environment Variables
2. Add all REQUIRED variables (marked with ⚠️ above)
3. Click "Redeploy" button
4. Clear browser cache and test again

**Styling Issues:**

- Check Tailwind configuration
- Verify shadcn/ui component imports
- Ensure CSS classes are properly applied

### Development Tips

- Use the shared component library when possible
- Follow the established design system
- Implement proper error boundaries
- Add loading states for better UX
- Ensure responsive design

## 📖 Contributing

1. Follow the [main contributing guide](../../README.md#contributing)
2. Focus on interview preparation features
3. Maintain consistency with the design system
4. Test with different user scenarios
5. Update documentation for new features

### Feature Development

When adding new features:

1. **Challenges**: Add to `/challenges` with proper categorization
2. **Analytics**: Integrate with existing progress tracking
3. **UI Components**: Use shadcn/ui and maintain consistency
4. **API Integration**: Follow established patterns
5. **Testing**: Add appropriate test coverage

## 🔗 Integration with Other Apps

- **Platform**: User authentication and profile sync
- **API**: Challenge data and progress tracking
- **Quizes**: Cross-platform analytics and user data

## 📈 Performance Considerations

- **Code Splitting**: Implemented via Next.js automatic splitting
- **Image Optimization**: Use Next.js Image component
- **Caching**: React Query for API response caching
- **Bundle Analysis**: Regular bundle size monitoring

---

**Part of the TBE Platform Monorepo**
