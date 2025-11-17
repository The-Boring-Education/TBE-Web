# 🧠 The Boring Quizes - Interactive Quiz Platform

A comprehensive quiz platform for mastering tech interviews with detailed analytics, performance tracking, competitive leaderboards, and gamification features.

## 📋 Overview

The Boring Quizes is a Next.js application designed to help developers prepare for technical interviews through interactive quizzes, detailed performance analytics, and competitive features.

### Key Features

- **Multiple Quiz Categories**: JavaScript, React, Algorithms, Web Development, and more
- **Interactive Questions**: Multiple choice with detailed explanations
- **Real-time Analytics**: Performance tracking and improvement insights
- **Competitive Leaderboards**: Global rankings and achievements
- **Gamification**: Points, badges, and reward systems
- **Progress Tracking**: Comprehensive attempt history and trends

## 🛠️ Tech Stack

- **Framework**: Next.js 13.5.6
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: NextAuth.js (inherited from platform)
- **State Management**: React Query
- **UI Components**: Shared `@tbe/components`
- **Charts**: Recharts for analytics
- **Database**: MongoDB (via shared API)

## 🚀 Development

### Prerequisites

- Node.js >= 20.x
- pnpm >= 9.12.0
- Access to TBE API services

### Setup

    ```bash

# From monorepo root

pnpm install

# Start quizes app only

pnpm dev:quizes

# Or start all apps

pnpm dev

````

The app will be available at `http://localhost:3002`

### Environment Variables

Create `.env.local` in the app directory:

    ```bash
# Authentication (inherited from platform)
NEXTAUTH_SECRET=your-secret-key
NEXT_PUBLIC_AUTH_URL=http://localhost:3002

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3004
NEXT_PUBLIC_BASE_URL=http://localhost:3002

# Cross-app URLs
NEXT_PUBLIC_PLATFORM_URL=http://localhost:3000
NEXT_PUBLIC_PREP_YATRA_URL=http://localhost:3001

# Analytics & Tracking
NEXT_PUBLIC_GA_MEASUREMENT_ID=your-ga-id
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn

# Quiz Configuration
NEXT_PUBLIC_QUIZ_TIME_LIMIT=1800  # 30 minutes default
NEXT_PUBLIC_LEADERBOARD_SIZE=100
````

## 📁 Project Structure

```
apps/quizes/
├── src/
│   ├── app/                # Next.js 13+ app directory
│   │   ├── dashboard/      # User dashboard
│   │   ├── quiz/          # Quiz pages
│   │   ├── leaderboard/   # Leaderboard pages
│   │   ├── analytics/     # Analytics pages
│   │   └── history/       # Attempt history
│   ├── components/        # App-specific components
│   │   ├── quiz/         # Quiz-related components
│   │   ├── dashboard/    # Dashboard components
│   │   ├── analytics/    # Analytics components
│   │   └── leaderboard/  # Leaderboard components
│   ├── hooks/            # App-specific hooks
│   ├── lib/              # Utilities and configurations
│   ├── types/            # TypeScript type definitions
│   └── styles/           # Global styles
├── public/               # Static assets
├── next.config.js        # Next.js configuration
├── tailwind.config.js    # Tailwind configuration
└── tsconfig.json        # TypeScript configuration
```

## 🔧 Available Scripts

    ```bash

# Development

pnpm dev # Start development server (port 3002)

# Building

pnpm build # Build for production
pnpm start # Start production server

# Code Quality

pnpm lint # Run ESLint
pnpm lint:fix # Fix ESLint issues
pnpm typecheck # TypeScript type checking

# Export

pnpm export # Export static site

````

## 🎯 Core Features

### Quiz System

```typescript
// Quiz types
interface Quiz {
  id: string
  title: string
  category: QuizCategory
  questions: Question[]
  timeLimit: number
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
}

interface Question {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
  difficulty: number
}

// Usage
import { QuizCard, QuestionCard } from '@/components/quiz'
````

### Analytics Dashboard

```typescript
// Analytics components
import {
    PerformanceChart,
    CategoryBreakdown,
    TrendAnalysis,
    AccuracyMetrics
} from "@/components/analytics"

// Analytics hooks
const { performanceData, categoryStats, timeSpentData } =
    useQuizAnalytics(userId)
```

### Leaderboard System

```typescript
// Leaderboard types
interface LeaderboardEntry {
    userId: string
    username: string
    totalScore: number
    averageScore: number
    quizzesCompleted: number
    rank: number
    badges: Badge[]
}

// Components
import {
    GlobalLeaderboard,
    CategoryLeaderboard,
    UserRankCard
} from "@/components/leaderboard"
```

## 🎨 UI Components

### Quiz Components

```typescript
// Import shared components
import {
    QuizGamificationCard,
    CodeRenderer,
    MarkdownRenderer,
    PointsDisplay,
    DashboardNav
} from "@tbe/components"

// App-specific components
import {
    QuizTimer,
    ProgressBar,
    AnswerOptions,
    ResultsModal
} from "@/components/quiz"
```

### Dashboard Components

```typescript
// Dashboard layout
import {
    StatsOverview,
    RecentAttempts,
    CategoryProgress,
    AchievementBadges
} from "@/components/dashboard"
```

## 🔐 Authentication & User Management

```typescript
// Authentication (inherited from platform)
import { useAuth } from "@tbe/hooks"

const { user, isAuthenticated } = useAuth()

// User progress tracking
import { useUserProgress } from "@/hooks/useUserProgress"

const { totalAttempts, averageScore, categoryProgress, achievements } =
    useUserProgress(user?.id)
```

## 📊 Data Management & API Integration

### Quiz Data

```typescript
// Fetch quizzes
import { useQuizzes, useQuizById } from "@/hooks/api"

const { data: quizzes, isLoading } = useQuizzes({
    category: "javascript",
    difficulty: "intermediate"
})

// Submit quiz attempt
import { useSubmitQuizAttempt } from "@/hooks/api"

const { mutate: submitAttempt } = useSubmitQuizAttempt()
```

### Analytics API

```typescript
// Performance analytics
import { usePerformanceAnalytics } from "@/hooks/analytics"

const {
    data: analytics,
    timeRange,
    setTimeRange
} = usePerformanceAnalytics({
    userId: user.id,
    timeRange: "30d"
})
```

## 🎮 Gamification Features

### Points System

```typescript
// Points calculation
const calculatePoints = (
    correctAnswers: number,
    totalQuestions: number,
    timeSpent: number,
    difficulty: string
) => {
    const basePoints = (correctAnswers / totalQuestions) * 100
    const difficultyMultiplier = getDifficultyMultiplier(difficulty)
    const timeBonus = calculateTimeBonus(timeSpent)

    return Math.round(basePoints * difficultyMultiplier + timeBonus)
}
```

### Achievement System

```typescript
// Achievement types
interface Achievement {
    id: string
    name: string
    description: string
    icon: string
    condition: AchievementCondition
    points: number
}

// Check achievements
import { useAchievements } from "@/hooks/useAchievements"

const { unlockedAchievements, checkForNewAchievements } = useAchievements(
    user.id
)
```

## 📈 Analytics & Reporting

### Performance Metrics

- **Accuracy Rate**: Percentage of correct answers
- **Average Time**: Time spent per question
- **Category Performance**: Breakdown by quiz category
- **Improvement Trends**: Performance over time
- **Comparative Analysis**: Performance vs. other users

### Data Visualization

```typescript
// Charts and visualizations
import { LineChart, BarChart, PieChart, RadarChart } from "recharts"

// Custom chart components
import {
    PerformanceTrendChart,
    CategoryComparisonChart,
    AccuracyOverTimeChart
} from "@/components/charts"
```

## 🏆 Leaderboard Features

### Global Rankings

- **Overall Leaderboard**: Top performers across all categories
- **Category Leaderboards**: Category-specific rankings
- **Weekly/Monthly**: Time-based leaderboards
- **Achievement Rankings**: Based on badges and achievements

### Competitive Features

```typescript
// Leaderboard hooks
import { useLeaderboard } from "@/hooks/useLeaderboard"

const { globalRankings, categoryRankings, userRank, nearbyUsers } =
    useLeaderboard({
        category: "javascript",
        timeframe: "monthly"
    })
```

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Deploy to production
vercel --prod

# Environment variables configured in Vercel dashboard
```

### Performance Optimization

- **Code Splitting**: Automatic via Next.js
- **Image Optimization**: Next.js Image component
- **Caching**: React Query for API responses
- **Bundle Analysis**: Regular monitoring

## 🧪 Testing

```bash
# Run tests (when implemented)
pnpm test

# Test specific components
pnpm test quiz/QuizCard.test.tsx

# Integration tests
pnpm test:integration
```

## 🐛 Troubleshooting

### Common Issues

**Quiz Loading Issues:**

- Check API connectivity
- Verify quiz data format
- Ensure authentication is working

**Timer Issues:**

- Check browser permissions
- Verify timer logic
- Handle page refresh scenarios

**Leaderboard Sync:**

- Verify real-time updates
- Check WebSocket connections
- Handle network interruptions

## 📖 Contributing

### Development Guidelines

1. **Quiz Content**: Follow established question formats
2. **Analytics**: Maintain data consistency
3. **Performance**: Optimize for real-time features
4. **Accessibility**: Ensure quiz accessibility
5. **Testing**: Add comprehensive test coverage

### Adding New Features

1. **New Quiz Categories**: Update category constants and UI
2. **Analytics Features**: Extend analytics hooks and components
3. **Gamification**: Add new achievement types and point systems
4. **Leaderboard Features**: Implement new ranking algorithms

## 🔗 Integration Points

- **Platform**: User authentication and profile data
- **API**: Quiz data, user progress, and analytics
- **Prep Yatra**: Cross-platform progress tracking

## 📊 Monitoring & Analytics

- **User Engagement**: Quiz completion rates
- **Performance Metrics**: Response times and accuracy
- **Error Tracking**: Sentry integration
- **Usage Analytics**: Google Analytics

---

**Part of the TBE Platform Monorepo**
