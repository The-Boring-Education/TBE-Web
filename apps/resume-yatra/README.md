# Resume Yatra

A comprehensive resume building tool integrated into The Boring Education platform. Resume Yatra helps users create professional resumes with guided steps, best practices, and real-time progress tracking.

## Features

- 🎯 **Guided Resume Building**: Step-by-step process with professional tips
- 💾 **Progress Persistence**: Auto-save functionality with backend integration
- 🔐 **Authentication**: Secure login using NextAuth with GitHub
- ✅ **Interactive Checklists**: Track completion of each resume section
- 📊 **Score Tracking**: Real-time scoring based on resume completeness
- 🎨 **Modern UI**: Beautiful interface built with Radix UI and Tailwind CSS
- 📱 **Responsive Design**: Works seamlessly on all devices
- 🚀 **Performance Optimized**: Built with Next.js for optimal performance

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (workspace manager)

### Installation

From the monorepo root:

```bash
pnpm install
```

### Development

Run the development server:

```bash
cd apps/resume-yatra
pnpm dev
```

The app will be available at [http://localhost:3002](http://localhost:3002)

### Environment Variables

Copy `.env.example` to `.env.local` and fill in the required values:

```bash
cp .env.example .env.local
```

## Tech Stack

- **Framework**: Next.js 15
- **Authentication**: NextAuth v4 via @tbe/auth
- **UI Components**: Radix UI + shadcn/ui
- **Styling**: Tailwind CSS
- **State Management**: React Query v3
- **Forms**: React Hook Form + Zod
- **Icons**: Lucide React
- **Animations**: Framer Motion

## Project Structure

```
apps/resume-yatra/
├── src/
│   ├── components/
│   │   ├── builder/          # Resume builder components
│   │   ├── landing/          # Landing page components
│   │   └── ui/               # Reusable UI components
│   ├── hooks/                # Custom React hooks
│   ├── pages/                # Next.js pages
│   │   ├── api/              # API routes
│   │   ├── _app.tsx          # App wrapper
│   │   ├── _document.tsx     # Document structure
│   │   ├── index.tsx         # Landing page
│   │   ├── builder.tsx       # Resume builder page
│   │   └── auth.tsx          # Authentication page
│   ├── services/             # API service layer
│   ├── styles/               # Global styles
│   └── types/                # TypeScript definitions
├── public/                   # Static assets
├── next.config.js            # Next.js configuration
├── tailwind.config.ts        # Tailwind configuration
└── tsconfig.json             # TypeScript configuration
```

## Building for Production

```bash
pnpm build
```

## Deployment

The app is configured for deployment on Vercel. The `vercel.json` file contains the necessary configuration.

## Contributing

Please read the main [CONTRIBUTING.md](../../CONTRIBUTING.md) in the repository root.

## License

MIT - The Boring Education
