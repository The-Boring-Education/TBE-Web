# TBE API - Quick Start Guide

🚀 **Deploy to Google Cloud Run in 2 minutes with full automation!**

## One-Command Deployment

```bash
cd apps/api
./scripts/setup-and-deploy.sh
```

**That's it!** This single script handles everything:

- 🛠️ Google Cloud setup (APIs, service accounts, repositories)
- 🔐 Secret management (environment variables, API keys)
- 🚀 Build and deploy to Cloud Run
- 📊 Open monitoring dashboards
- 🌐 Launch your deployed API

## Alternative: Step-by-Step

If you prefer individual control or already ran some steps:

### Option 1: You already ran `setup-gcp.sh`

```bash
./scripts/setup-secrets.sh  # Configure secrets
./scripts/deploy.sh         # Deploy to Cloud Run
```

### Option 2: Individual Steps

```bash
# Step 1: Google Cloud Setup
./scripts/setup-gcp.sh

# Step 2: Configure Secrets
./scripts/setup-secrets.sh

# Step 3: Deploy
./scripts/deploy.sh --staging     # or --production
```

## Prerequisites

- Google Cloud account with billing enabled
- `gcloud` CLI installed and authenticated
- Docker installed
- Node.js 20+ and pnpm 9.15.9+

## Deployment Environments

The scripts support multiple deployment targets:

| Command                            | Environment | Service Name      | Use Case      |
| ---------------------------------- | ----------- | ----------------- | ------------- |
| `./scripts/deploy.sh --staging`    | Staging     | `tbe-api-staging` | Testing       |
| `./scripts/deploy.sh --production` | Production  | `tbe-api`         | Live users    |
| `./scripts/deploy.sh --manual`     | Development | `tbe-api-dev`     | Local testing |

## GitHub Actions (Optional)

For automated deployments on code changes:

1. **Add GitHub Secrets** (Repository Settings → Secrets):
    - `GCP_PROJECT_ID`: Your project ID (displayed by setup script)
    - `GCP_SA_KEY`: Contents of `github-actions-key.json`

2. **Push to deploy automatically**:
    ```bash
    git push origin development  # → staging
    git push origin main         # → production
    ```

## What Happens During Setup? 🎯

✅ **GCP Configuration**:

- Enable Cloud Run, Artifact Registry, Secret Manager APIs
- Create container registry for your images
- Set up service account with proper permissions
- Generate GitHub Actions authentication key

✅ **Secret Management**:

- Interactive prompts for API keys and secrets
- Secure storage in Google Secret Manager
- Environment variable configuration

✅ **Deployment & Monitoring**:

- Build and containerize your API
- Deploy to Cloud Run with optimal settings
- Automatic health checks and validation
- Open monitoring dashboards in browser

## Your Deployed API 🌐

After deployment, you'll get:

- **Service URL**: `https://tbe-api-staging-xxxxx-uc.a.run.app`
- **Health Check**: `{SERVICE_URL}/api/health`
- **Auto-scaling**: 0-20 instances based on traffic
- **Monitoring**: Google Cloud Console dashboards

## Test Your Deployment

```bash
# Health check (URL provided by script)
curl https://your-service-url/api/health

# Should return: {"status": "ok", "timestamp": "..."}
```

## Troubleshooting

**Script fails?** Check:

- ✅ `gcloud auth login` (authenticated?)
- ✅ `gcloud config set project PROJECT_ID` (project set?)
- ✅ Billing enabled on your Google Cloud project
- ✅ Required tools installed (gcloud, docker, pnpm, node)

**Need detailed help?**

- 📚 **Full Guide**: [README-DEPLOYMENT.md](./README-DEPLOYMENT.md)
- 🔧 **Advanced Setup**: Manual configuration steps
- 💬 **Support**: Contact development team

## What's Been Automated 🤖

✅ **Google Cloud Setup**: APIs, repositories, service accounts  
✅ **Containerization**: Optimized Docker builds with monorepo support  
✅ **Auto-scaling**: Smart instance management (0-20 based on traffic)  
✅ **Security**: Encrypted secrets in Google Secret Manager  
✅ **Monitoring**: Cloud Logging, Error Reporting, Performance metrics  
✅ **CI/CD Ready**: GitHub Actions workflow for automated deployments  
✅ **Multi-Environment**: Staging, Production, and Development setups  
✅ **Browser Integration**: Auto-open monitoring and service URLs

---

🚀 **Ready to go!** Your API is now enterprise-ready on Google Cloud Run!
