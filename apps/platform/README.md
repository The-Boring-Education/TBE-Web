# 🏠 TBE Platform - Main Application

The core platform application for The Boring Education, featuring courses, projects, interview preparation, and user management.

## 📋 Overview

This is the main TBE platform built with Next.js, serving as the central hub for all educational content and user interactions.

### Key Features

- **Shiksha**: Free bite-sized tech courses
- **Projects**: Real-world project building with peers
- **Interview Prep**: Tech interview question sheets
- **Roadmaps**: Personalized learning paths
- **Portfolio**: Personal portfolio builder
- **YouFocus**: Distraction-free YouTube learning
- **Open Source**: Contribution opportunities

## 🛠️ Tech Stack

- **Framework**: Next.js 13.5.6
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: NextAuth.js
- **Database**: MongoDB (via Mongoose)
- **State Management**: React Query
- **UI Components**: Shared `@tbe/components`
- **Analytics**: Custom analytics system
- **Monitoring**: Sentry

## 🚀 Development

### Prerequisites

- Node.js >= 20.x
- pnpm >= 9.12.0
- MongoDB connection

### Setup

```bash
# From monorepo root
pnpm install

# Start platform app only
pnpm dev:platform

# Or start all apps
pnpm dev
```

The app will be available at `http://localhost:3000`

### Environment Variables

Create `.env.local` in the app directory or use the shared root `.env.local`:

```bash
# Database
MONGODB_URI=mongodb://localhost:27017/tbe-platform

# Authentication
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
GOOGLE_AUTH_CLIENT_ID=your-google-client-id
GOOGLE_AUTH_CLIENT_SECRET=your-google-client-secret

# External APIs
OPENAI_API_KEY=your-openai-key
YOUTUBE_API_KEY=your-youtube-key

# App URLs (for cross-app navigation)
NEXT_PUBLIC_PREP_YATRA_URL=http://localhost:3001
NEXT_PUBLIC_QUIZ_URL=http://localhost:3002
NEXT_PUBLIC_API_URL=http://localhost:3004

# Analytics & Monitoring
NEXT_PUBLIC_GA_MEASUREMENT_ID=your-ga-id
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
```

## 📁 Project Structure

```
apps/platform/
├── src/
│   ├── components/          # App-specific components
│   ├── pages/              # Next.js pages and API routes
│   │   ├── api/            # API endpoints
│   │   ├── shiksha/        # Course pages
│   │   ├── projects/       # Project pages
│   │   ├── interview-prep/ # Interview prep pages
│   │   └── user/           # User dashboard pages
│   ├── constant/           # App constants and configurations
│   ├── hooks/              # App-specific hooks
│   ├── interfaces/         # TypeScript interfaces
│   ├── lib/                # Utility functions and configurations
│   └── styles/             # Global styles
├── public/                 # Static assets
├── next.config.js          # Next.js configuration
├── tailwind.config.js      # Tailwind configuration
└── tsconfig.json          # TypeScript configuration
```

## 🔧 Available Scripts

```bash
# Development
pnpm dev                    # Start development server (port 3000)

# Building
pnpm build                  # Build for production
pnpm start                  # Start production server

# Code Quality
pnpm lint                   # Run ESLint
pnpm lint:fix              # Fix ESLint issues
pnpm typecheck             # Run TypeScript checks
pnpm format                # Format code with Prettier

# Release
pnpm pre-release           # Lint and build
pnpm release               # Full release process
```

## 📚 Key Pages & Routes

### Public Routes

- `/` - Homepage with product overview
- `/shiksha` - Course catalog
- `/projects` - Project showcase
- `/interview-prep` - Interview preparation resources
- `/roadmaps` - Learning roadmaps
- `/contribute` - Open source contribution guide

### Protected Routes

- `/user/dashboard` - User dashboard
- `/user/profile` - User profile management
- `/shiksha/my-courses` - User's enrolled courses
- `/projects/my-projects` - User's projects
- `/interview-prep/my-sheets` - User's interview sheets

### API Routes

- `/api/auth/*` - Authentication endpoints
- `/api/user/*` - User management
- `/api/shiksha/*` - Course management
- `/api/projects/*` - Project management
- `/api/analytics/*` - Analytics tracking

## 🎨 UI Components

The app uses shared components from `@tbe/components`:

```typescript
// Standardized components
import { StandardizedNavbar, StandardizedFooter } from '@tbe/components';

// Feature-specific components
import {
  CourseCard,
  ProjectCard,
  InterviewSheet,
  UserDashboard,
} from '@tbe/components';
```

## 🔐 Authentication

Authentication is handled via NextAuth.js with multiple providers:

```typescript
// Check authentication status
import { useAuth } from '@tbe/hooks';

const { user, isLoading, isAuthenticated } = useAuth();

// Protect routes
import { ProtectedRoute } from '@tbe/components';

<ProtectedRoute>
  <YourProtectedComponent />
</ProtectedRoute>;
```

## 📊 Analytics

Custom analytics system for tracking user interactions:

```typescript
import { useAnalytics } from '@tbe/hooks';

const { trackEvent } = useAnalytics();

// Track events
trackEvent('course_started', {
  courseId: 'javascript-basics',
  userId: user.id,
});
```

## 🗄️ Database Schema

Key MongoDB collections:

- **users** - User profiles and authentication
- **courses** - Course content and metadata
- **projects** - Project information and submissions
- **userProgress** - Learning progress tracking
- **analytics** - Event tracking data

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Build and deploy
vercel --prod

# Environment variables are configured in Vercel dashboard
```

### Manual Deployment

```bash
# Build the application
pnpm build

# Start production server
pnpm start
```

## 🧪 Testing

```bash
# Run tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Run specific test file
pnpm test components/CourseCard.test.tsx
```

## 🐛 Troubleshooting

### Common Issues

**Authentication Issues:**

- Verify `NEXTAUTH_SECRET` and `NEXTAUTH_URL` are set
- Check Google OAuth credentials
- Ensure MongoDB connection is working

**Build Failures:**

- Clear `.next` directory: `rm -rf .next`
- Reinstall dependencies: `pnpm install`
- Check for TypeScript errors: `pnpm typecheck`

**Styling Issues:**

- Ensure Tailwind classes are properly imported
- Check for conflicting CSS
- Verify shared component imports

## 📖 Contributing

1. Follow the [main contributing guide](../../README.md#contributing)
2. Focus on the specific area you're working on
3. Test thoroughly with different user roles
4. Update documentation for new features

### Development Tips

- Use shared components from `@tbe/components` when possible
- Follow the established routing patterns
- Implement proper error handling
- Add analytics tracking for user interactions
- Ensure responsive design across devices

## 🔗 Related Apps

- [Prep Yatra](../prep-yatra/README.md) - Interview preparation
- [Quizes](../quizes/README.md) - Quiz platform
- [API](../api/README.md) - Backend services

---

**Part of the TBE Platform Monorepo**
