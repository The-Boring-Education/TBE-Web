# 🛠️ Tech Yatra - Technology Learning Journey

A comprehensive technology learning roadmap platform that guides developers through structured learning paths and skill development journeys.

## 📋 Overview

Tech Yatra provides curated learning roadmaps, technology guides, and structured paths for developers to master various technologies and frameworks.

### Key Features

- **Learning Roadmaps**: Structured paths for different technologies
- **Progress Tracking**: Monitor learning journey and milestones
- **Resource Curation**: Handpicked learning materials and tutorials
- **Skill Assessment**: Evaluate current knowledge and gaps
- **Community Features**: Connect with other learners

## 🛠️ Tech Stack

- **Framework**: Next.js
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Shared Packages**: `@tbe/components`, `@tbe/hooks`, `@tbe/utils`

## 🚀 Development

### Prerequisites

- Node.js >= 20.x
- pnpm >= 9.12.0

### Setup

```bash
# From monorepo root
pnpm install

# Start techyatra app
pnpm dev:techyatra
```

### Environment Variables

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3004
NEXT_PUBLIC_BASE_URL=http://localhost:3005

# Cross-app Integration
NEXT_PUBLIC_PLATFORM_URL=http://localhost:3000
```

## 📁 Project Structure

```
apps/techyatra/
├── src/
│   ├── app/              # Next.js 13+ app directory
│   ├── components/       # App-specific components
│   ├── lib/             # Utilities and configurations
│   └── styles/          # Global styles
├── public/              # Static assets
└── README.md           # This file
```

## 🔧 Available Scripts

```bash
pnpm dev                # Start development server
pnpm build              # Build for production
pnpm start              # Start production server
pnpm lint               # Run ESLint
```

## 🎯 Key Features

### Learning Roadmaps

- Frontend Development Path
- Backend Development Path
- DevOps Journey
- Mobile Development
- Data Science Track

### Progress Tracking

- Milestone completion
- Skill level assessment
- Learning analytics
- Achievement badges

## 📖 Contributing

Follow the [main contributing guide](../../README.md#contributing) and focus on:

- Learning path accuracy
- Resource quality
- User experience
- Progress tracking features

---

**Part of the TBE Platform Monorepo**
