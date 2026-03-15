# 🎓 TBE OnCampus - Campus Learning Platform

The OnCampus application for The Boring Education, providing personalized learning paths and curated resources for campus students.

## 📋 Overview

This is the OnCampus app built with Next.js, featuring authentication via NextAuth.js and integration with the TBE platform ecosystem.

## 🛠️ Tech Stack

- **Framework**: Next.js 13.5.6
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: NextAuth.js via `@tbe/auth` package
- **UI Components**: Shared `@tbe/components` package

## 🚀 Development

### Prerequisites

- Node.js >= 20.x
- pnpm >= 9.12.0

### Setup

```bash
# From monorepo root
pnpm install

# Start oncampus app only
pnpm --filter @tbe/oncampus dev

# Or start all apps
pnpm dev
```

The app will be available at `http://localhost:3007`

### Environment Variables

Create `.env.local` in the `apps/oncampus` directory:

```bash
# NextAuth Configuration (REQUIRED) ⚠️
# Generate with: openssl rand -base64 32
NEXTAUTH_SECRET=your-secret-key-here
NEXT_PUBLIC_AUTH_URL=http://localhost:3007

# Google OAuth (REQUIRED) ⚠️
GOOGLE_AUTH_CLIENT_ID=your-google-client-id
GOOGLE_AUTH_CLIENT_SECRET=your-google-client-secret

# API Configuration (REQUIRED) ⚠️
NEXT_PUBLIC_API_URL=http://localhost:3004/api/v1
API_URL=http://localhost:3004/api/v1

# Optional - Cross-subdomain SSO
COOKIE_DOMAIN=.theboringeducation.com

# Node Environment
NODE_ENV=development
```

#### How to Generate NEXTAUTH_SECRET:

```bash
# Using OpenSSL (recommended)
openssl rand -base64 32

# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## 🔐 Authentication

The app uses the `@tbe/auth` package for authentication, which provides:

- **NextAuth.js Integration**: Configured via `createNextAuthHandler`
- **Google OAuth**: Sign in with Google
- **Session Management**: Automatic session handling with `SessionProvider`
- **Auth Hooks**: `useAuth` hook for accessing user session

### Auth Setup

The authentication is configured in:

- `src/pages/api/auth/[...nextauth].ts` - NextAuth handler
- `src/pages/_app.tsx` - SessionProvider wrapper
- `src/pages/login.tsx` - Login page with `LoginCardNew` component

## 📁 Project Structure

```
apps/oncampus/
├── src/
│   ├── pages/
│   │   ├── _app.tsx          # App wrapper with SessionProvider
│   │   ├── _document.tsx     # Custom document
│   │   ├── login.tsx         # Login page
│   │   └── api/
│   │       └── auth/
│   │           └── [...nextauth].ts  # NextAuth handler
│   └── styles/
│       └── globals.css        # Global styles
├── next.config.js            # Next.js configuration
├── tailwind.config.ts        # Tailwind CSS configuration
└── package.json
```

## 🚀 Deployment

### Vercel (Recommended)

The app is configured for automatic deployment on Vercel.

### Environment Variables (Production)

**⚠️ CRITICAL:** All these environment variables MUST be set in Vercel/Production:

```bash
# NextAuth Configuration (REQUIRED) ⚠️
NEXTAUTH_SECRET=your-production-secret-here
NEXT_PUBLIC_AUTH_URL=https://oncampus.theboringeducation.com

# Google OAuth (REQUIRED) ⚠️
GOOGLE_AUTH_CLIENT_ID=your-google-client-id
GOOGLE_AUTH_CLIENT_SECRET=your-google-client-secret

# API Configuration (REQUIRED) ⚠️
NEXT_PUBLIC_API_URL=https://api.theboringeducation.com/api/v1
API_URL=https://api.theboringeducation.com/api/v1

# Optional - Cross-subdomain SSO
COOKIE_DOMAIN=.theboringeducation.com

# Node Environment
NODE_ENV=production
```

## 🐛 Troubleshooting

### Authentication Issues

- **Error: `useSession` must be wrapped in a `<SessionProvider />`**
  - Ensure `_app.tsx` has `SessionProvider` wrapping the app
  - Check that session is being passed from pageProps

- **NextAuth 500 Error in Production**
  - Verify `NEXTAUTH_SECRET` is set
  - Check `NEXT_PUBLIC_AUTH_URL` matches your production URL
  - Ensure Google OAuth credentials are correct

### CSS Not Loading

- Check `tailwind.config.ts` includes all package paths
- Verify `postcss.config.js` is configured
- Ensure `globals.css` is imported in `_app.tsx`

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [TBE Platform Documentation](../../README.md)
