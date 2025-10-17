# TBE API

Next.js API application for the TBE platform, deployable to Google Cloud Run.

## 🚀 Quick Deploy

```bash
cd apps/api
./deploy.sh
```

That's it! One command deploys everything to Cloud Run.

## Prerequisites

- Google Cloud account with billing enabled
- `gcloud` CLI installed and authenticated
- Docker installed
- Node.js 20+ and pnpm

## Development

```bash
# Install dependencies (from project root)
pnpm install

# Start development server
pnpm run dev:api

# Build for production
pnpm run build:api
```

## What the deploy script does

✅ Sets up GCP resources (APIs, Artifact Registry)  
✅ Builds monorepo packages and API  
✅ Creates Docker image  
✅ Deploys to Cloud Run  
✅ Tests health endpoint  
✅ Opens deployed API in browser

## Manual Docker

```bash
# Build container
pnpm run docker:build

# Run container locally
pnpm run docker:run
```

## Environment Variables

Set these in Google Secret Manager:

- `MONGODB_URI` - MongoDB connection string
- `NEXTAUTH_SECRET` - NextAuth.js secret key
- `ADMIN_SECRET` - Admin authentication secret
- `OPENAI_API_KEY` - OpenAI API key
- `YOUTUBE_API_KEY` - YouTube Data API key
- `CASHFREE_SECRET_KEY` - Cashfree payment secret
- `EMAIL_API_KEY` - Email service API key
- `SENTRY_AUTH_TOKEN` - Sentry authentication token

## API Endpoints

- `GET /api/health` - Health check
- `POST /api/auth/signin` - Authentication
- `GET /api/v1/user` - User management
- `GET /api/v1/admin/users` - Admin panel

## Support

- 🐛 Issues: Create GitHub issue
- 💬 Questions: Contact development team
