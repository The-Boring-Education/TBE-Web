# TBE API

Next.js API application for the TBE platform, deployable to Google Cloud Run.

## 🚀 Quick Deployment

For fast Cloud Run deployment, see: [QUICK-START.md](./QUICK-START.md)

For detailed instructions, see: [README-DEPLOYMENT.md](./README-DEPLOYMENT.md)

## Development

```bash
# Install dependencies (from project root)
pnpm install

# Start development server
pnpm run dev:api

# Build for production
pnpm run build:api
```

## Docker

```bash
# Build container
pnpm run docker:build

# Run container locally
pnpm run docker:run
```

## Deployment

- **Staging**: Automatic deployment on push to `development` branch
- **Production**: Automatic deployment on push to `main` branch
- **Manual**: Use GitHub Actions workflow dispatch

## Architecture

- **Framework**: Next.js 13 with API routes
- **Database**: MongoDB with Mongoose
- **Authentication**: NextAuth.js with Google OAuth
- **Deployment**: Google Cloud Run with automated CI/CD
- **Monitoring**: Sentry + Google Cloud Monitoring

## API Endpoints

### Health Check

```
GET /api/health
```

### Authentication

```
POST /api/auth/signin
POST /api/auth/signout
GET  /api/auth/session
```

### User Management

```
GET    /api/v1/user
PUT    /api/v1/user
GET    /api/v1/user/dashboard
POST   /api/v1/user/onboarding
```

### Admin Panel

```
GET    /api/v1/admin/users
GET    /api/v1/admin/analytics
POST   /api/v1/admin/content
```

For complete API documentation, see the deployed service's OpenAPI specification.

## Environment Variables

See [README-DEPLOYMENT.md](./README-DEPLOYMENT.md#environment-variables) for complete environment setup.

## Support

- 📚 Documentation: [README-DEPLOYMENT.md](./README-DEPLOYMENT.md)
- 🐛 Issues: Create GitHub issue
- 💬 Questions: Contact development team
