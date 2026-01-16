# 🚀 TBE Platform

A comprehensive Turborepo monorepo housing all The Boring Education frontend applications, shared packages, and centralized configurations.

## 🏗️ Architecture Overview

```
tbe-platform/
├── apps/                        # 📱 Applications
│   ├── platform/               # 🏠 Main TBE platform (Port: 3000)
│   ├── prep-yatra/             # 🧭 Interview preparation tool (Port: 3001)
│   ├── quizes/                 # 🧠 Quiz platform (Port: 3002)
│   ├── onboarding/             # 🎯 User onboarding flow (Port: 3003)
│   ├── api/                    # 🌐 Centralized API service (Port: 3004)
│   ├── techyatra/              # 🛠️ Tech learning journey
│   ├── dsayatra/               # 📊 DSA practice platform
│   ├── resume-yatra/           # 📄 Resume builder
│   └── testing/                # 🧪 Testing suite (unit, API, E2E)
├── packages/                    # 📦 Shared Packages
│   ├── components/             # 💅 Shared UI components
│   ├── hooks/                  # 🎣 Shared React hooks
│   ├── utils/                  # ⚙️ Shared utilities
│   ├── types/                  # 📄 TypeScript types
│   ├── constants/              # 📋 Shared constants
│   ├── services/               # 🔌 API services
│   ├── auth/                   # 🔐 Authentication logic
│   ├── interface/              # 🔗 Interface definitions
│   ├── config/                 # ⚙️ Shared configurations
│   ├── eslint-config/          # 🔍 ESLint configurations
│   └── typescript-config/      # 🔧 TypeScript configurations
└── .github/workflows/          # 🤖 CI/CD workflows
```

## 🛠️ Prerequisites

- **Node.js**: >= 20.x
- **pnpm**: >= 9.12.0 (Install: `npm install -g pnpm@9.15.9`)
- **MongoDB**: For database operations (local or cloud)

## 🚀 Quick Start

### 1. Clone & Install

```bash
# Clone the repository
git clone <repository-url>
cd tbe-platform

# Install all dependencies
pnpm install
```

### 2. Environment Setup

Copy the environment template and configure your variables:

```bash
# Copy environment template
cp .env.example .env.local

# Edit with your actual values
# Required: MONGODB_URI, NEXTAUTH_SECRET, etc.
```

### 3. Development

```bash
# Start all applications
pnpm dev

# Or run individual apps
pnpm dev:platform      # Main platform (localhost:3000)
pnpm dev:prep-yatra     # Prep Yatra (localhost:3001)
pnpm dev:quizes         # Quizes (localhost:3002)
pnpm dev:onboarding     # Onboarding (localhost:3003)
pnpm dev:api            # API service (localhost:3004)
pnpm dev:techyatra      # Tech Yatra
pnpm dev:dsayatra       # DSA Yatra
pnpm dev:resume-yatra   # Resume Yatra
```

## 📦 Applications

| App              | Port | Framework    | Description                                          |
| ---------------- | ---- | ------------ | ---------------------------------------------------- |
| **platform**     | 3000 | Next.js      | Main TBE platform with courses, projects, interviews |
| **prep-yatra**   | 3001 | Next.js      | Comprehensive interview preparation platform         |
| **quizes**       | 3002 | Next.js      | Interactive quiz platform with analytics             |
| **onboarding**   | 3003 | Vite + React | User onboarding and registration flow                |
| **api**          | 3004 | Next.js API  | Centralized API service for all apps                 |
| **techyatra**    | -    | Next.js      | Technology learning roadmaps                         |
| **dsayatra**     | -    | Next.js      | Data structures & algorithms practice                |
| **resume-yatra** | -    | Next.js      | Professional resume builder                          |

## 🔧 Development Commands

### Building

```bash
# Build all applications
pnpm build

# Build specific apps
pnpm build:platform
pnpm build:prep-yatra
pnpm build:quizes
pnpm build:onboarding
pnpm build:api
```

### Code Quality

```bash
# Lint all packages
pnpm lint

# Format code
pnpm format

# Type checking
pnpm check-types
```

### Package Management

```bash
# Install dependencies for all packages
pnpm install

# Add dependency to specific app
pnpm --filter @tbe/platform add <package>

# Add dependency to workspace root
pnpm add -w <package>
```

## 📚 Shared Packages

All applications use these shared packages:

- `@tbe/components` - 300+ UI components (buttons, modals, forms, etc.)
- `@tbe/hooks` - 30+ React hooks (auth, API, analytics, etc.)
- `@tbe/utils` - Utilities (auth, database, API helpers)
- `@tbe/types` - TypeScript interfaces and types
- `@tbe/constants` - Shared constants and configurations
- `@tbe/services` - API service functions
- `@tbe/auth` - Authentication logic and components

### Usage Example

```typescript
// Import UI components
import { Button, Card, Modal } from "@tbe/components"

// Import hooks
import { useAuth, useApi } from "@tbe/hooks"

// Import utilities
import { connectToDatabase, sendRequest } from "@tbe/utils"

// Import types
import { User, APIResponse } from "@tbe/types"
```

## 🚀 Deployment

### API Deployment (Google Cloud Run)

```bash
cd apps/api
./deploy.sh
```

### Frontend Deployment (Vercel)

Each app is configured for Vercel deployment with automatic builds on push.

## 🤖 CI/CD

GitHub Actions automatically run on PRs to `development` and `production`:

- **Build Check**: Ensures all apps build successfully
- **Lint Check**: Code quality and formatting validation
- **Type Check**: TypeScript type safety verification

## 🔐 Environment Variables

### Shared Variables (Root `.env.local`)

```bash
# Database
MONGODB_URI=mongodb://localhost:27017/tbe-platform

# Authentication
NEXTAUTH_SECRET=your-secret-key
GOOGLE_AUTH_CLIENT_ID=your-google-client-id
GOOGLE_AUTH_CLIENT_SECRET=your-google-client-secret

# External APIs
OPENAI_API_KEY=your-openai-key
YOUTUBE_API_KEY=your-youtube-key

# Payment
CASHFREE_CLIENT_ID=your-cashfree-id
CASHFREE_SECRET_KEY=your-cashfree-secret

# Monitoring
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
```

### App-Specific Variables

Each app can override shared variables with its own `.env.local` file.

## 🔍 SEO & Indexability

Automated SEO tooling for all TBE apps.

### SEO Auditing

```bash
# Run Lighthouse SEO audit locally (requires apps running)
pnpm seo:audit

# Run against production URLs
pnpm seo:audit:prod
```

### Sitemap Generation

Sitemaps and robots.txt are automatically generated during build via `next-sitemap`:

```bash
# Build any app - sitemap is generated in postbuild
pnpm build:platform
# Output: public/sitemap.xml, public/robots.txt
```

### SEO Inspector

Visual dashboard for monitoring SEO health across all apps:

```bash
# Start the SEO Inspector
cd apps/testing
pnpm dev
# Open http://localhost:3099/seo
```

Features:
- View Lighthouse scores for all apps
- Validate meta tags for any URL
- Monitor route priorities and indexing status
- Track SEO improvements over time

### JSON-LD Structured Data

The SEO component supports rich snippets via JSON-LD:

```tsx
import { SEO } from "@tbe/components"

// Course page with structured data
<SEO
  seoMeta={seoMeta}
  schema={{
    type: "Course",
    course: {
      name: "JavaScript Basics",
      description: "Learn JavaScript from scratch",
      skillLevel: "Beginner"
    }
  }}
/>

// FAQ page
<SEO
  seoMeta={seoMeta}
  schema={{
    type: "FAQPage",
    faq: [
      { question: "What is React?", answer: "A JavaScript library..." }
    ]
  }}
/>
```

### CI/CD Integration

Lighthouse audits run automatically:
- On every push to `production` branch
- Weekly on Monday at 6 AM UTC
- Manual trigger via GitHub Actions

Thresholds:
- SEO: 85% minimum (fails build if below)
- Accessibility: 80% warning
- Best Practices: 75% warning

## 🧪 Testing

Comprehensive testing suite with **Vitest**, **Playwright**, and **MSW** located in `apps/testing/`.

```bash
# Run all tests
pnpm test

# Development workflow
pnpm test:unit:watch     # Watch mode (fast feedback)
pnpm test:unit           # Unit tests (components, hooks, utils)
pnpm test:api            # API endpoint tests
pnpm test:e2e            # End-to-end tests (cross-browser)
pnpm test:e2e:ui         # E2E with visual debugger
pnpm test:coverage       # Generate coverage report
```

**Coverage Requirements:** 70% statements, 65% branches

**CI/CD:** Tests run automatically on PRs to `development` and `production` branches.

**Documentation:** See [`apps/testing/README.md`](apps/testing/README.md) for detailed guide

## 📖 Contributing

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** changes: `git commit -m 'Add amazing feature'`
4. **Push** to branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

### Development Guidelines

- Follow the existing code style and conventions
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Ensure all CI checks pass

### Adding a New App

1. Create app directory in `apps/`
2. Configure `package.json` with shared packages
3. Add scripts to root `package.json`
4. Update this README with app details

## 🐛 Troubleshooting

### Common Issues

**Build Failures:**

```bash
# Clear all node_modules and reinstall
pnpm clean
pnpm install
```

**Port Conflicts:**

```bash
# Kill processes on specific ports
npx kill-port 3000 3001 3002 3003 3004
```

**TypeScript Errors:**

```bash
# Clear TypeScript cache
pnpm clean
pnpm check-types
```

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/your-org/tbe-platform/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/tbe-platform/discussions)
- **Documentation**: Check individual app README files

---

**Built with ❤️ by The Boring Education Team**
