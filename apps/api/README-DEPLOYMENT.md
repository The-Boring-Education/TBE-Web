# TBE API - Google Cloud Run Deployment Guide

This guide covers deploying the TBE API to Google Cloud Run with automated CI/CD using GitHub Actions.

## Quick Start (Automated)

🚀 **Get deployed in 5 minutes with automated scripts!**

```bash
cd apps/api
./scripts/setup-and-deploy.sh
```

The script will guide you through:

1. **GCP Setup**: APIs, service accounts, repositories
2. **Secrets Configuration**: Environment variables and API keys
3. **Deployment**: Build and deploy to Cloud Run
4. **Monitoring**: Open dashboards and service URLs

**Already ran `setup-gcp.sh`?** Continue with:

```bash
./scripts/setup-secrets.sh  # Configure secrets
./scripts/deploy.sh         # Deploy to Cloud Run
```

For detailed manual setup or troubleshooting, see sections below.

## Table of Contents

1. [Quick Start (Automated)](#quick-start-automated)
2. [Prerequisites](#prerequisites)
3. [Automated Setup & Deployment](#automated-setup--deployment)
4. [Manual Setup (Advanced)](#manual-setup-advanced)
5. [Environment Variables](#environment-variables)
6. [GitHub Actions Integration](#github-actions-integration)
7. [Local Development](#local-development)
8. [Troubleshooting](#troubleshooting)
9. [Monitoring & Logging](#monitoring--logging)

## Prerequisites

- Google Cloud Platform account with billing enabled
- `gcloud` CLI installed and configured
- Docker installed (for local testing)
- Node.js 20+ and pnpm 9.15.9+
- GitHub repository access with admin permissions

## Automated Setup & Deployment

### Complete Setup (Recommended)

For first-time setup, use the complete automated script:

```bash
cd apps/api
./scripts/setup-and-deploy.sh
```

**Interactive Menu Options:**

1. **Complete setup** - All steps (recommended for first time)
2. **Skip GCP setup** - If you already ran `setup-gcp.sh`
3. **Skip to deployment** - If GCP and secrets are configured
4. **Setup only** - No deployment
5. **Exit**

### Individual Scripts

If you prefer to run steps individually:

```bash
# Step 1: Google Cloud Setup
./scripts/setup-gcp.sh

# Step 2: Configure Secrets
./scripts/setup-secrets.sh

# Step 3: Deploy Application
./scripts/deploy.sh

# Or run specific deployment environment
./scripts/deploy.sh --staging     # Deploy to staging
./scripts/deploy.sh --production  # Deploy to production
./scripts/deploy.sh --manual      # Deploy current code
```

### What Gets Automated

✅ **Google Cloud Setup** (`setup-gcp.sh`):

- Enable required APIs (Cloud Run, Artifact Registry, Secret Manager, etc.)
- Create Artifact Registry repository
- Create service account with proper IAM roles
- Generate GitHub Actions service account key
- Configure Docker authentication

✅ **Secrets Management** (`setup-secrets.sh`):

- Interactive prompt for all required secrets
- Create secrets in Google Secret Manager
- Generate sample `.env.example` file
- Display environment variables reference

✅ **Deployment** (`deploy.sh`):

- Build shared packages and API
- Create and push Docker image
- Deploy to Cloud Run with optimal settings
- Run health checks
- Open monitoring dashboards automatically

✅ **Monitoring Integration**:

- Automatically open Google Cloud Console dashboards
- Display service URLs and monitoring links
- Open deployed application in browser
- Show deployment summary and next steps

## Manual Setup (Advanced)

> **Note**: For most users, the automated scripts above are recommended. Use this section for custom setups or troubleshooting.

### Google Cloud Setup

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

| Variable              | Type    | Description                      |
| --------------------- | ------- | -------------------------------- |
| `MONGODB_URI`         | Secret  | MongoDB connection string        |
| `NEXTAUTH_SECRET`     | Secret  | NextAuth.js secret key           |
| `ADMIN_SECRET`        | Secret  | Admin authentication secret      |
| `OPENAI_API_KEY`      | Secret  | OpenAI API key                   |
| `YOUTUBE_API_KEY`     | Secret  | YouTube Data API key             |
| `CASHFREE_SECRET_KEY` | Secret  | Cashfree payment secret          |
| `EMAIL_API_KEY`       | Secret  | Email service API key            |
| `SENTRY_AUTH_TOKEN`   | Secret  | Sentry authentication token      |
| `API_URL`             | Env Var | API base URL                     |
| `AUTH_URL`            | Env Var | Authentication service URL       |
| `NODE_ENV`            | Env Var | Environment (production/staging) |
| `ADMIN_BASE_URL`      | Env Var | Admin panel base URL             |
| `CASHFREE_BASE_URL`   | Env Var | Cashfree API base URL            |
| `CASHFREE_CLIENT_ID`  | Env Var | Cashfree client ID               |
| `PREPYATRA_APP_URL`   | Env Var | PrepYatra application URL        |
| `QUIZ_APP_URL`        | Env Var | Quiz application URL             |
| `FROM_EMAIL`          | Env Var | Default sender email address     |
| `EMAIL_SERVICE_URL`   | Env Var | Email service endpoint URL       |

### 3. Configure GitHub Secrets

Add these secrets to your GitHub repository:

- `GCP_PROJECT_ID`: Your Google Cloud project ID
- `GCP_SA_KEY`: Contents of the service account key JSON file

Go to: Repository Settings → Secrets and variables → Actions → New repository secret

## GitHub Actions Integration

### Setting Up Automated Deployments

After running the setup scripts, configure GitHub Actions for automated deployments:

#### 1. Add GitHub Repository Secrets

Go to: **Repository Settings → Secrets and variables → Actions**

Add these secrets:

- **`GCP_PROJECT_ID`**: Your Google Cloud project ID
- **`GCP_SA_KEY`**: Contents of `github-actions-key.json` (created by setup script)

#### 2. Automated Deployment Triggers

- **Development Branch** → `tbe-api-staging` (staging environment)
- **Main Branch** → `tbe-api` (production environment)
- **Manual Trigger** → Choose environment via GitHub Actions UI

#### 3. Manual GitHub Actions Deployment

1. Go to **Actions** tab in your GitHub repository
2. Select **"Deploy API to Cloud Run"**
3. Click **"Run workflow"**
4. Choose environment (staging/production)
5. Monitor deployment progress

### Manual Cloud Run Deployment

For manual deployments without GitHub Actions:

```bash
# Use the deployment script (recommended)
cd apps/api
./scripts/deploy.sh --staging     # or --production

# Or manual gcloud deployment
gcloud run deploy tbe-api-staging \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 1Gi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10
```

### 2. Set Environment Variables

```bash
# Set non-sensitive environment variables
gcloud run services update tbe-api-staging \
  --region us-central1 \
  --set-env-vars \
  NODE_ENV=staging,\
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

### Monitoring and Console Access

The deployment script automatically opens relevant monitoring dashboards:

- **Service Dashboard**: Cloud Run metrics and configuration
- **Application URL**: Your deployed API endpoint
- **Logs**: Real-time application logs
- **Error Reporting**: Error tracking and alerting
- **Container Registry**: Docker images and versions

### Deployment Environments

| Environment    | Branch        | Service Name      | Min Instances | Max Instances | Memory |
| -------------- | ------------- | ----------------- | ------------- | ------------- | ------ |
| **Staging**    | `development` | `tbe-api-staging` | 0             | 10            | 1Gi    |
| **Production** | `main`        | `tbe-api`         | 1             | 20            | 2Gi    |
| **Manual/Dev** | any           | `tbe-api-dev`     | 0             | 5             | 1Gi    |

## GitHub Actions CI/CD

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

### Manual Deployment via Scripts

For immediate deployment without GitHub Actions:

```bash
# Interactive deployment (choose environment)
./scripts/deploy.sh

# Direct environment deployment
./scripts/deploy.sh --staging
./scripts/deploy.sh --production
./scripts/deploy.sh --manual

# Complete setup and deployment
./scripts/setup-and-deploy.sh
```

### Deployment Status and Monitoring

After deployment, the scripts automatically:

- ✅ Test API health endpoint
- 🌐 Open service URL in browser
- 📊 Open Google Cloud Console monitoring
- 📋 Display deployment summary and next steps

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

## Script Reference

### Available Scripts

| Script                | Purpose               | Usage                                                                                 |
| --------------------- | --------------------- | ------------------------------------------------------------------------------------- |
| `setup-gcp.sh`        | GCP resource setup    | `./scripts/setup-gcp.sh`                                                              |
| `setup-secrets.sh`    | Secret Manager config | `./scripts/setup-secrets.sh`                                                          |
| `deploy.sh`           | Deploy to Cloud Run   | `./scripts/deploy.sh [--staging\|--production\|--manual]`                             |
| `setup-and-deploy.sh` | Complete automation   | `./scripts/setup-and-deploy.sh [--complete\|--skip-gcp\|--deploy-only\|--setup-only]` |

### Script Features

- 🎨 **Colorized Output**: Clear status indicators and progress
- 🔍 **Dependency Checking**: Validates required tools (gcloud, docker, pnpm)
- 📊 **Auto-Monitoring**: Opens relevant dashboards and URLs
- 🛠️ **Error Handling**: Graceful failure handling with helpful messages
- 📋 **Interactive Menus**: Guided setup with clear options
- 🚀 **Auto-Browser**: Opens monitoring dashboards and deployed app
- 📝 **Status Reporting**: Detailed deployment summaries

### Next Steps After Deployment

1. **Test API Endpoints**: Visit `{SERVICE_URL}/api/health`
2. **Update UI Applications**: Change API URLs to new Cloud Run service
3. **Monitor Performance**: Use Google Cloud Console dashboards
4. **Set Up Alerts**: Configure monitoring alerts for production
5. **Custom Domain**: Configure custom domain if needed
6. **GitHub Actions**: Set up automated deployments for continuous integration

**Last Updated**: October 2025  
**Version**: 2.0 (with automated scripts)
