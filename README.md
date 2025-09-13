# 🚀 TBE Platform - Turborepo Monorepo

Welcome to The Boring Education (TBE) Platform - a comprehensive monorepo housing all TBE frontend applications, shared packages, and centralized configurations.

## 🧱 Monorepo Structure

```
tbe-platform/
├── apps/                        # 📱 Frontend Applications
│   ├── tbe-webapp/             # 🏠 Main marketing + landing + global APIs (Port: 3000)
│   ├── prep-yatra/             # 🧭 Career navigation tool (Port: 3001)
│   ├── quizes/                 # 🧠 The Boring Quizzes app (Port: 3002)
│   ├── onboarding/             # 🎯 The Boring Onboarding app (Port: 3003)
│   └── tbe-api/                # 🌐 Central API service (Coming Soon)
├── packages/                    # 📦 Shared Packages
│   ├── ui/                     # 💅 Shared UI components (Button, Modal, etc.)
│   ├── utils/                  # ⚙️ Shared logic - auth, MongoDB, fetchers
│   ├── config/                 # 📐 Shared Tailwind, ESLint, TS, Prettier config
│   ├── types/                  # 📄 Shared TypeScript types/interfaces
│   ├── eslint-config/          # 🔍 ESLint configurations
│   └── typescript-config/      # 🔧 TypeScript configurations
├── .env                        # ✅ Single env file for all apps
├── turbo.json                  # 🔄 Turborepo configuration
├── package.json                # 📋 Root package.json with scripts
└── pnpm-workspace.yaml         # 🚀 PNPM workspace configuration
```

## 🛠️ Prerequisites

- **Node.js**: >= 18.0.0
- **PNPM**: >= 9.0.0 (Install with `npm install -g pnpm`)
- **MongoDB**: For database operations

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# Clone the repository
git clone <repository-url>
cd tbe-platform

# Install all dependencies for all apps and packages
pnpm install
```

### 2. Environment Setup

**✅ Hybrid Environment Structure (Recommended)**

The monorepo uses a hybrid approach with both root-level and app-specific environment files:

```
tbe-platform/
├── .env.example         # 📋 Template with all variables
├── .env.local          # 🏠 Local development (gitignored)
├── .env.development    # 🔧 Development environment (gitignored)
├── .env.production     # 🚀 Production environment (gitignored)
└── apps/
    ├── tbe-webapp/.env.local     # App-specific overrides
    ├── prep-yatra/.env.local     # App-specific overrides
    ├── quizes/.env.example       # Next.js specific template
    └── onboarding/.env.example   # Vite specific template
```

**Quick Setup:**

```bash
# 1. Copy template to local environment
cp .env.example .env.local

# 2. Update .env.local with your actual values
# Edit: Database URL, API keys, etc.

# 3. Apps inherit shared variables automatically
# Individual apps can override with their own .env.local files
```

**Key Benefits:**

- 🔄 **Shared variables** managed in one place (database, auth, APIs)
- 🎯 **App-specific overrides** for unique requirements
- 🔒 **Security** - sensitive files are gitignored
- 🏗️ **Framework support** - handles Next.js vs Vite differences

### 🔧 Environment Variables Reference

| Category           | Variable                        | Description                 | Shared | App-Specific |
| ------------------ | ------------------------------- | --------------------------- | ------ | ------------ |
| **Database**       | `MONGODB_URI`                   | MongoDB connection string   | ✅     |              |
| **Authentication** | `NEXTAUTH_SECRET`               | NextAuth JWT secret         | ✅     |              |
|                    | `NEXT_PUBLIC_GOOGLE_CLIENT_ID`  | Google OAuth client ID      | ✅     |              |
|                    | `GOOGLE_AUTH_CLIENT_SECRET`     | Google OAuth secret         | ✅     |              |
| **External APIs**  | `OPENAI_API_KEY`                | OpenAI API key              | ✅     |              |
|                    | `YOUTUBE_API_KEY`               | YouTube API key             | ✅     |              |
| **Payment**        | `CASHFREE_*`                    | Payment gateway credentials | ✅     |              |
| **Monitoring**     | `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Google Analytics ID         | ✅     |              |
|                    | `NEXT_PUBLIC_SENTRY_DSN`        | Sentry error tracking       | ✅     |              |
| **App URLs**       | `NEXT_PUBLIC_*_URL`             | App-specific base URLs      |        | ✅           |
| **API URLs**       | `*_API_URL`                     | Cross-app API endpoints     |        | ✅           |

### 🌍 Environment-Specific Values

| Environment     | Database          | URLs                     | Purpose     |
| --------------- | ----------------- | ------------------------ | ----------- |
| **Local**       | `localhost:27017` | `localhost:300X`         | Development |
| **Development** | TBE Dev MongoDB   | `*-dev.vercel.app`       | Testing     |
| **Production**  | TBE Prod MongoDB  | `theboringeducation.com` | Live        |

## 🏃‍♂️ Development

### Run All Apps

```bash
# Start all apps in development mode
pnpm dev

# Run individual apps
pnpm dev:platform    # Main TBE platform (Port 3000)
pnpm dev:prep-yatra  # Career navigation (Port 3001)
pnpm dev:quizes      # Quiz platform (Port 3002)
pnpm dev:onboarding  # User onboarding (Port 3003)
pnpm dev:api         # Centralized API (Port 3004)
```

## 📦 Shared Packages

All apps use shared packages with these aliases:

- `@tbe/ui` - Shared UI components (Button, Modal, Card, etc.)
- `@tbe/utils` - Shared utilities (analytics, API helpers, auth, MongoDB)
- `@tbe/types` - Shared TypeScript types and interfaces
- `@tbe/config` - Shared configurations (Tailwind, PostCSS, Prettier)

### Usage Example

```typescript
// Import UI components (135+ available)
import {
    Button,
    Card,
    Modal,
    StandardizedNavbar,
    StandardizedFooter,
    ChallengeCard,
    PrepYatraHero,
    QuizGamificationCard,
    CodeRenderer,
    OnboardingForm
} from "@tbe/ui"

// Import hooks (25+ available)
import {
    useAnalytics,
    useUser,
    useGamification,
    useApi,
    useScrollDirection
} from "@tbe/hooks"

// Import utilities
import { trackEvent, sendRequest, connectToDatabase } from "@tbe/utils"

// Import types & database
import { APIResponseType, BaseUser, Challenge } from "@tbe/types"
import { User, Quiz, PrepLog } from "@tbe/database"
```

## 🏗️ Building for Production

```bash
# Build all applications
pnpm build

# Build specific apps
pnpm build:platform    # Main TBE platform
pnpm build:prep-yatra   # Career navigation
pnpm build:quizes       # Quiz platform
pnpm build:onboarding   # User onboarding
pnpm build:api          # Centralized API for Cloud Run
```

## 🎨 **Component Usage Guidelines**

### **🔄 Standardized Components (Use These!)**

For consistent UI across all apps, use the standardized components:

```typescript
import { StandardizedNavbar, StandardizedFooter } from '@tbe/ui'

// In your app layout
<StandardizedNavbar
  variant="prep-yatra"  // or "quizes", "onboarding", "platform"
  showUserPoints={true}
  appName="Prep Yatra"
/>

<StandardizedFooter
  variant="prep-yatra"
  showProducts={true}
/>
```

### **🎯 App-Specific Components**

Each app's components are available with clear prefixes:

```typescript
// PrepYatra components
import {
    ChallengeCard,
    ChallengeSection,
    BuildYourStack,
    PrepYatraHero,
    PrepLogsList
} from "@tbe/ui"

// Quiz components
import {
    QuizGamificationCard,
    CodeRenderer,
    MarkdownRenderer,
    PointsDisplay,
    DashboardNav
} from "@tbe/ui"

// Onboarding components
import { OnboardingForm, OnboardingLayout } from "@tbe/ui"
```

### **🔐 Authentication Components**

Unified auth across all apps:

```typescript
import { ProtectedRoute, PublicRoute, ClientAuth } from '@tbe/ui'

// Use in your routing
<ProtectedRoute>
  <YourProtectedComponent />
</ProtectedRoute>
```

## 🆕 Adding a New App

1. Create new app directory in `apps/`
2. Update `package.json` to include shared packages
3. Configure TypeScript and ESLint to use shared configs
4. Add scripts to root `package.json`

See full documentation in the repository for detailed steps.

---

**Built with ❤️ by The Boring Education Team**
