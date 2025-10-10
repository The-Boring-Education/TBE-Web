# TBE API - Quick Start Guide

🚀 **Fast deployment to Google Cloud Run in 3 steps!**

## Prerequisites

- Google Cloud account with billing enabled
- `gcloud` CLI installed
- GitHub repository access

## Step 1: Google Cloud Setup

Run the automated setup script:

```bash
cd apps/api
./scripts/setup-gcp.sh
```

This script will:

- ✅ Enable required Google Cloud APIs
- ✅ Create Artifact Registry repository
- ✅ Set up service account with proper permissions
- ✅ Configure Docker authentication
- ✅ Generate service account key for GitHub Actions

## Step 2: Configure Secrets

Set up your environment variables and secrets:

```bash
./scripts/setup-secrets.sh
```

This script will:

- ✅ Create secrets in Google Secret Manager
- ✅ Generate sample `.env.example` file
- ✅ Display environment variables reference

## Step 3: GitHub Actions Setup

1. **Add GitHub Secrets** (Repository Settings → Secrets):
    - `GCP_PROJECT_ID`: Your Google Cloud project ID
    - `GCP_SA_KEY`: Contents of `github-actions-key.json`

2. **Deploy**: Push changes to trigger automated deployment:
    ```bash
    git add .
    git commit -m "feat: add Cloud Run deployment"
    git push origin development  # Deploys to staging
    git push origin main         # Deploys to production
    ```

## That's It! 🎉

Your API will be automatically deployed to:

- **Staging**: `https://tbe-api-staging-xxxxx-uc.a.run.app`
- **Production**: `https://tbe-api-xxxxx-uc.a.run.app`

## Test Your Deployment

```bash
# Health check
curl https://your-service-url/api/health

# Should return: {"status": "ok", "timestamp": "..."}
```

## Need Help?

- 📚 **Full Documentation**: [README-DEPLOYMENT.md](./README-DEPLOYMENT.md)
- 🔧 **Troubleshooting**: See the troubleshooting section in the full docs
- 🏗️ **Local Development**: Docker setup instructions in full docs

## What's Been Configured

✅ **Containerization**: Dockerfile with multi-stage build  
✅ **Auto-scaling**: 0-10 instances based on traffic  
✅ **Security**: Secrets in Google Secret Manager  
✅ **Monitoring**: Cloud Logging & Error Reporting  
✅ **CI/CD**: GitHub Actions deployment pipeline  
✅ **Environment Separation**: Staging and Production environments

---

**Next Steps**: Update your UI applications to use the new API URLs!
