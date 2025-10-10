# TechYatra 🚀

**Your personalized tech learning roadmap for Bharat**

TechYatra helps students and professionals find their perfect tech learning path. Whether you want to learn web development, DSA, or choose a tech domain - we provide curated roadmaps and free resources.

## 🌟 Features

- **Personalized Learning Paths**: Choose your role, domain, or focus area
- **DSA Preparation**: Complete roadmaps for placements and competitive coding
- **Domain Selection**: Explore Web Dev, Mobile, AI/ML, Backend, and more
- **Language Guides**: Start with Python, JavaScript, Java, or C++
- **Free Resources**: Curated free learning materials
- **Student & Professional Tracks**: Different paths based on your stage

## 🚀 Getting Started

### Development

From the monorepo root:

```bash
# Install dependencies
pnpm install

# Run dev server (runs on port 3003)
pnpm run dev:techyatra
```

Or from the app directory:

```bash
cd apps/techyatra
pnpm dev
```

Open [http://localhost:3003](http://localhost:3003) in your browser.

### Build

```bash
# From root
pnpm run build:techyatra

# From app directory
pnpm build
```

## 🛠 Tech Stack

- **Framework**: Next.js 13 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + Custom UI library
- **Icons**: Lucide React
- **State Management**: React Query (TanStack Query)
- **Notifications**: Sonner

## 📦 Shared Packages

This app is part of the TBE monorepo and uses:
- `@tbe/components` - Shared UI components and layouts
- `@tbe/constants` - App constants and configurations
- `@tbe/hooks` - Reusable React hooks
- `@tbe/interface` - TypeScript interfaces
- `@tbe/types` - Shared types
- `@tbe/utils` - Utility functions
- `@tbe/services` - API services
- `@tbe/config` - Configuration files

## 🌐 Deployment

This app is configured for Vercel deployment. The `vercel.json` includes:
- Turbo build command for monorepo
- Proper install command using pnpm

## 📝 Project Structure

```
apps/techyatra/
├── public/              # Static assets
│   ├── favicon.ico
│   ├── manifest.json
│   ├── robots.txt
│   └── sitemap.xml
├── src/
│   └── app/            # Next.js App Router
│       ├── globals.css
│       ├── layout.tsx
│       ├── page.tsx
│       ├── providers.tsx
│       ├── not-found.tsx
│       ├── robots.ts
│       └── sitemap.ts
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

## 🤝 Contributing

This is part of The Boring Education monorepo. See the main repo README for contribution guidelines.

## 📄 License

MIT License - The Boring Education

