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

Create a `.env` file in the root directory:

```bash
# Database
MONGODB_URI=mongodb://localhost:27017/tbe-platform

# Google Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=your-ga-id

# Authentication (NextAuth)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
```

### 3. Local Development Setup

Add these entries to your `/etc/hosts` file:

```
127.0.0.1   webapp.local
127.0.0.1   prepyatra.local
127.0.0.1   quizes.local
127.0.0.1   onboarding.local
```

## 🏃‍♂️ Development

### Run All Apps

```bash
# Start all apps in development mode
pnpm dev

# Run individual apps
pnpm dev:webapp      # Port 3000
pnpm dev:prep-yatra  # Port 3001
pnpm dev:quizes      # Port 3002
pnpm dev:onboarding  # Port 3003
```

## 📦 Shared Packages

All apps use shared packages with these aliases:

- `@tbe/ui` - Shared UI components (Button, Modal, Card, etc.)
- `@tbe/utils` - Shared utilities (analytics, API helpers, auth, MongoDB)
- `@tbe/types` - Shared TypeScript types and interfaces
- `@tbe/config` - Shared configurations (Tailwind, PostCSS, Prettier)

### Usage Example

```typescript
// Import UI components
import { Button, Card, Modal } from "@tbe/ui"

// Import utilities
import { trackEvent, sendRequest } from "@tbe/utils"

// Import types
import { APIResponseType, BaseUser } from "@tbe/types"
```

## 🏗️ Building for Production

```bash
# Build all applications
pnpm build

# Build specific apps
pnpm build:webapp
pnpm build:prep-yatra
pnpm build:quizes
pnpm build:onboarding
```

## 🆕 Adding a New App

1. Create new app directory in `apps/`
2. Update `package.json` to include shared packages
3. Configure TypeScript and ESLint to use shared configs
4. Add scripts to root `package.json`

See full documentation in the repository for detailed steps.

---

**Built with ❤️ by The Boring Education Team**
