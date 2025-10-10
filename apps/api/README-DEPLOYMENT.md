# TBE API - Google Cloud Run Deployment Guide

This guide covers deploying the TBE API to Google Cloud Run with automated CI/CD using GitHub Actions.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Google Cloud Setup](#google-cloud-setup)
3. [Environment Variables](#environment-variables)
4. [Initial Deployment](#initial-deployment)
5. [Automated Deployments](#automated-deployments)
6. [Local Development](#local-development)
7. [Troubleshooting](#troubleshooting)
8. [Monitoring & Logging](#monitoring--logging)

## Prerequisites

- Google Cloud Platform account with billing enabled
- `gcloud` CLI installed and configured
- Docker installed (for local testing)
- Node.js 20+ and pnpm 9.15.9+
- GitHub repository access with admin permissions

## Google Cloud Setup

### 1. Create or Select a GCP Project

```bash
# Create a new project (optional)
gcloud projects create YOUR_PROJECT_ID --name="TBE Platform"

# Set the project
gcloud config set project YOUR_PROJECT_ID
```

### 2. Enable Required APIs

```bash
# Enable necessary Google Cloud APIs
gcloud services enable \
  cloudbuild.googleapis.com \
  run.googleapis.com \
  artifactregistry.googleapis.com \
  secretmanager.googleapis.com
```

### 3. Create Artifact Registry Repository

```bash
# Create repository for container images
gcloud artifacts repositories create tbe-api-repo \
  --repository-format=docker \
  --location=us-central1 \
  --description="TBE API container images"
```

### 4. Create Service Account for GitHub Actions

```bash
# Create service account
gcloud iam service-accounts create github-actions-sa \
  --display-name="GitHub Actions Service Account"

# Get the service account email
SA_EMAIL=$(gcloud iam service-accounts list --filter="displayName:GitHub Actions Service Account" --format="value(email)")

# Grant necessary permissions
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:$SA_EMAIL" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:$SA_EMAIL" \
  --role="roles/storage.admin"

gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:$SA_EMAIL" \
  --role="roles/artifactregistry.admin"

gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:$SA_EMAIL" \
  --role="roles/secretmanager.secretAccessor"

# Create and download service account key
gcloud iam service-accounts keys create key.json \
  --iam-account=$SA_EMAIL
```

## Environment Variables

### 1. Create Secrets in Google Secret Manager

Create secrets for sensitive data:

```bash
# MongoDB connection string
echo "your_mongodb_uri" | gcloud secrets create mongodb-uri --data-file=-

# NextAuth secret
echo "your_nextauth_secret" | gcloud secrets create nextauth-secret --data-file=-

# Google OAuth client secret
echo "your_google_client_secret" | gcloud secrets create google-auth-client-secret --data-file=-

# Admin secret
echo "your_admin_secret" | gcloud secrets create admin-secret --data-file=-

# OpenAI API key
echo "your_openai_api_key" | gcloud secrets create openai-api-key --data-file=-

# YouTube API key
echo "your_youtube_api_key" | gcloud secrets create youtube-api-key --data-file=-

# Cashfree secret key
echo "your_cashfree_secret_key" | gcloud secrets create cashfree-secret-key --data-file=-

# Email API key
echo "your_email_api_key" | gcloud secrets create email-api-key --data-file=-

# Sentry auth token
echo "your_sentry_auth_token" | gcloud secrets create sentry-auth-token --data-file=-
```

### 2. Environment Variables Reference

| Variable                    | Type    | Description                      |
| --------------------------- | ------- | -------------------------------- |
| `MONGODB_URI`               | Secret  | MongoDB connection string        |
| `NEXTAUTH_SECRET`           | Secret  | NextAuth.js secret key           |
| `GOOGLE_AUTH_CLIENT_SECRET` | Secret  | Google OAuth client secret       |
| `ADMIN_SECRET`              | Secret  | Admin authentication secret      |
| `OPENAI_API_KEY`            | Secret  | OpenAI API key                   |
| `YOUTUBE_API_KEY`           | Secret  | YouTube Data API key             |
| `CASHFREE_SECRET_KEY`       | Secret  | Cashfree payment secret          |
| `EMAIL_API_KEY`             | Secret  | Email service API key            |
| `SENTRY_AUTH_TOKEN`         | Secret  | Sentry authentication token      |
| `GOOGLE_AUTH_CLIENT_ID`     | Env Var | Google OAuth client ID (public)  |
| `API_URL`                   | Env Var | API base URL                     |
| `AUTH_URL`                  | Env Var | Authentication service URL       |
| `NODE_ENV`                  | Env Var | Environment (production/staging) |
| `ADMIN_BASE_URL`            | Env Var | Admin panel base URL             |
| `CASHFREE_BASE_URL`         | Env Var | Cashfree API base URL            |
| `CASHFREE_CLIENT_ID`        | Env Var | Cashfree client ID               |
| `PREPYATRA_APP_URL`         | Env Var | PrepYatra application URL        |
| `QUIZ_APP_URL`              | Env Var | Quiz application URL             |
| `FROM_EMAIL`                | Env Var | Default sender email address     |
| `EMAIL_SERVICE_URL`         | Env Var | Email service endpoint URL       |

### 3. Configure GitHub Secrets

Add these secrets to your GitHub repository:

- `GCP_PROJECT_ID`: Your Google Cloud project ID
- `GCP_SA_KEY`: Contents of the service account key JSON file

Go to: Repository Settings → Secrets and variables → Actions → New repository secret

## Initial Deployment

### 1. Manual Deployment (First Time)

```bash
# Navigate to the API directory
cd apps/api

# Build and deploy using gcloud
gcloud run deploy tbe-api-staging \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 1Gi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10

# For production deployment
gcloud run deploy tbe-api \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 1Gi \
  --cpu 1 \
  --min-instances 1 \
  --max-instances 20
```

### 2. Set Environment Variables

```bash
# Set non-sensitive environment variables
gcloud run services update tbe-api-staging \
  --region us-central1 \
  --set-env-vars \
  NODE_ENV=staging,\
  GOOGLE_AUTH_CLIENT_ID=your_client_id,\
  API_URL=https://tbe-api-staging-xxxxx-uc.a.run.app,\
  AUTH_URL=https://your-auth-url.com

# Set secrets (already configured in GitHub Actions)
gcloud run services update tbe-api-staging \
  --region us-central1 \
  --set-secrets \
  MONGODB_URI=mongodb-uri:latest,\
  NEXTAUTH_SECRET=nextauth-secret:latest
  # ... (add other secrets as needed)
```

## Automated Deployments

### How It Works

1. **Trigger**: Pushes to `main` or `development` branches that modify:
    - `apps/api/**`
    - `packages/**`
    - `pnpm-lock.yaml`

2. **Environments**:
    - `development` branch → `tbe-api-staging`
    - `main` branch → `tbe-api` (production)

3. **Process**:
    - Installs dependencies
    - Builds shared packages
    - Runs linting
    - Builds and pushes Docker image
    - Deploys to Cloud Run
    - Runs health checks

### Manual Deployment Trigger

You can manually trigger deployments through GitHub Actions:

1. Go to Actions tab in your repository
2. Select "Deploy API to Cloud Run"
3. Click "Run workflow"
4. Choose environment (staging/production)

## Local Development

### 1. Docker Development

```bash
# Build the image locally
pnpm run docker:build

# Run the container
pnpm run docker:run

# The API will be available at http://localhost:3000
```

### 2. Cloud Run Emulator

```bash
# Install Cloud Run emulator
gcloud components install cloud-run-proxy

# Run with local environment
gcloud run services proxy tbe-api-staging --port=8080
```

### 3. Environment Setup

Create a `.env.local` file in `apps/api/`:

```env
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/tbe-dev
NEXTAUTH_SECRET=dev-secret-key
GOOGLE_AUTH_CLIENT_ID=your-dev-client-id
GOOGLE_AUTH_CLIENT_SECRET=your-dev-client-secret
# ... other development variables
```

## Troubleshooting

### Common Issues

#### 1. Build Failures

**Issue**: Docker build fails with dependency errors

```bash
# Clear Docker cache
docker system prune -f
docker builder prune -f

# Rebuild with no cache
docker build --no-cache -t tbe-api .
```

#### 2. Memory Issues

**Issue**: Cloud Run instances running out of memory

```bash
# Increase memory allocation
gcloud run services update tbe-api \
  --region us-central1 \
  --memory 2Gi
```

#### 3. Cold Start Issues

**Issue**: API responds slowly on first request

```bash
# Set minimum instances
gcloud run services update tbe-api \
  --region us-central1 \
  --min-instances 1
```

#### 4. Database Connection Issues

**Issue**: MongoDB connection timeouts

- Ensure MongoDB Atlas allows Cloud Run IP ranges
- Check connection string format
- Verify secret manager access

### Debugging

#### 1. View Logs

```bash
# Real-time logs
gcloud run services logs tail tbe-api --region us-central1

# Recent logs
gcloud run services logs read tbe-api --region us-central1 --limit 100
```

#### 2. Service Status

```bash
# Check service status
gcloud run services describe tbe-api --region us-central1

# List all services
gcloud run services list
```

#### 3. Test Endpoints

```bash
# Health check
curl https://your-service-url/api/health

# Test authentication
curl -H "Authorization: Bearer your-token" \
  https://your-service-url/api/v1/user/dashboard
```

## Monitoring & Logging

### 1. Cloud Monitoring

Set up monitoring dashboards in Google Cloud Console:

- **Metrics**: Request count, latency, error rate, memory usage
- **Alerts**: High error rate, memory usage, response time

### 2. Error Reporting

Cloud Run automatically integrates with Google Error Reporting. View errors at:
`Google Cloud Console → Error Reporting`

### 3. Sentry Integration

The API includes Sentry for error tracking. Configure in your environment:

```env
SENTRY_AUTH_TOKEN=your_sentry_token
```

### 4. Custom Metrics

Add custom logging to track business metrics:

```typescript
// Example: Track API usage
console.log(
    JSON.stringify({
        severity: "INFO",
        message: "API endpoint accessed",
        endpoint: "/api/v1/user/dashboard",
        userId: user.id,
        timestamp: new Date().toISOString()
    })
)
```

## Security Considerations

1. **Secrets Management**: Always use Secret Manager for sensitive data
2. **IAM Roles**: Follow principle of least privilege
3. **VPC**: Consider using VPC for additional security
4. **Authentication**: Ensure all sensitive endpoints are protected
5. **CORS**: Configure appropriate CORS settings
6. **Rate Limiting**: Implement rate limiting for public endpoints

## Performance Optimization

1. **Container Optimization**:
    - Use multi-stage builds
    - Minimize image size
    - Optimize package installation

2. **Cloud Run Configuration**:
    - Adjust CPU and memory based on load
    - Set appropriate concurrency limits
    - Use minimum instances for production

3. **Database Optimization**:
    - Use connection pooling
    - Implement caching where appropriate
    - Optimize database queries

## Cost Optimization

1. **Scaling**: Set appropriate min/max instances
2. **CPU Allocation**: Use CPU throttling during low traffic
3. **Request Timeout**: Set reasonable timeout values
4. **Monitoring**: Use Cloud Monitoring to track usage patterns

## Support

For deployment issues:

1. Check this documentation
2. Review Cloud Run logs
3. Consult Google Cloud documentation
4. Contact the development team

---

**Last Updated**: October 2025
**Version**: 1.0
