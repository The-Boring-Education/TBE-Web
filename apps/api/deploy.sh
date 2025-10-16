#!/bin/bash

# TBE API - Cloud Build Deployment
# Simple, automated deployment using Google Cloud Build

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() { echo -e "${GREEN}[INFO]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; }
step() { echo -e "${BLUE}[STEP]${NC} $1"; }

# Configuration
PROJECT_ID=$(gcloud config get-value project 2>/dev/null || echo "")
REGION="asia-south1"
SERVICE_NAME="tbe-api"
REPOSITORY="tbe-api-repo"

# Check deployment status
check_deployment_status() {
    step "Checking deployment status..."
    
    local services=("tbe-api" "tbe-api-staging" "tbe-api-dev")
    
    for service in "${services[@]}"; do
        log "Checking $service..."
        SERVICE_URL=$(gcloud run services describe $service --region $REGION --format 'value(status.url)' 2>/dev/null || echo "")
        
        if [ -n "$SERVICE_URL" ]; then
            log "✓ $service: $SERVICE_URL"
            if curl -f -s "$SERVICE_URL/api/health" >/dev/null; then
                log "  Health: ✓ OK"
            else
                warn "  Health: ✗ Failed"
            fi
        else
            warn "✗ $service: Not deployed"
        fi
        echo
}

# Check prerequisites
check_prereqs() {
    
    local missing=()
    command -v gcloud >/dev/null || missing+=("gcloud")
    command -v pnpm >/dev/null || missing+=("pnpm")
    
    if [ ${#missing[@]} -gt 0 ]; then
        error "Missing: ${missing[*]}"
        exit 1
    fi
    
    if [ -z "$PROJECT_ID" ]; then
        error "No GCP project set. Run: gcloud config set project YOUR_PROJECT_ID"
        exit 1
    fi
    
    log "Using project: $PROJECT_ID"
}

# Build and test locally first
build_and_test_locally() {
    step "Building and testing locally..."
    
    # Go to monorepo root
    cd "$(dirname "$0")/../.."
    
    log "Installing dependencies..."
    pnpm install --frozen-lockfile
    
    log "Building shared packages..."
    pnpm run build --filter=@tbe/constants --filter=@tbe/types --filter=@tbe/utils --filter=@tbe/interface --filter=@tbe/services
    
    log "Building API..."
    pnpm run build --filter=@tbe/api
    
    log "Running linter..."
    pnpm run lint --filter=@tbe/api
    
    log "Local validation complete ✓"
}

# Select deployment environment
select_environment() {
    echo
    step "Select deployment environment:"
    echo "1) Staging (development branch)"
    echo "2) Production (main branch)"
    echo "3) Manual (current code)"
    
    read -p "Enter your choice (1-3) [1]: " ENV_CHOICE
    ENV_CHOICE=${ENV_CHOICE:-1}
    
    case $ENV_CHOICE in
        1)
            ENVIRONMENT="staging"
            SERVICE_NAME="tbe-api-staging"
            MIN_INSTANCES=0
            MAX_INSTANCES=10
            MEMORY="1Gi"
            ;;
        2)
            ENVIRONMENT="production"
            SERVICE_NAME="tbe-api"
            MIN_INSTANCES=1
            MAX_INSTANCES=20
            MEMORY="2Gi"
            ;;
        3)
            ENVIRONMENT="manual"
            SERVICE_NAME="tbe-api-dev"
            MIN_INSTANCES=0
            MAX_INSTANCES=5
            MEMORY="1Gi"
            ;;
        *)
            error "Invalid choice. Defaulting to staging."
            ENVIRONMENT="staging"
            SERVICE_NAME="tbe-api-staging"
            MIN_INSTANCES=0
            MAX_INSTANCES=10
            MEMORY="1Gi"
            ;;
    esac
    
    log "Selected environment: $ENVIRONMENT"
    log "Service name: $SERVICE_NAME"
}

# Setup GCP resources (one-time)
setup_gcp() {
    step "Setting up GCP resources..."
    
    # Enable APIs
    gcloud services enable run.googleapis.com artifactregistry.googleapis.com cloudbuild.googleapis.com secretmanager.googleapis.com --quiet
    
    # Create Artifact Registry
    gcloud artifacts repositories create $REPOSITORY \
        --repository-format=docker \
        --location=$REGION \
        --description="TBE API containers" \
        --quiet 2>/dev/null || log "Repository already exists"
    
    log "GCP setup complete ✓"
}

# Deploy using Cloud Build
deploy_with_cloud_build() {
    step "Deploying with Cloud Build..."
    
    # Go to monorepo root
    MONOREPO_ROOT="/Users/imsks/Public/git-repos/tbe/tbe-platform"
    cd "$MONOREPO_ROOT"
    
    log "Submitting build to Cloud Build..."
    
    # Submit build to Cloud Build
    gcloud builds submit \
        --config cloudbuild.yaml \
        --substitutions=_SERVICE_NAME=$SERVICE_NAME,_ENVIRONMENT=$ENVIRONMENT,_MEMORY=$MEMORY,_MIN_INSTANCES=$MIN_INSTANCES,_MAX_INSTANCES=$MAX_INSTANCES \
        --region=$REGION \
        .
    
    # Get the latest build ID and open in browser
    BUILD_ID=$(gcloud builds list --limit=1 --format="value(id)" --project=$PROJECT_ID 2>/dev/null || echo "")
    
    if [ -n "$BUILD_ID" ]; then
        BUILD_URL="https://console.cloud.google.com/cloud-build/builds;region=$REGION/$BUILD_ID?project=$PROJECT_ID"
        log "Opening build logs in browser: $BUILD_URL"
        
        # Open in browser
        if command -v open >/dev/null; then
            open "$BUILD_URL"
        elif command -v xdg-open >/dev/null; then
            xdg-open "$BUILD_URL"
        else
            log "Please open this URL manually: $BUILD_URL"
        fi
    fi
    
    # Get service URL
    SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region $REGION --format 'value(status.url)' 2>/dev/null || echo "")
    
    if [ -n "$SERVICE_URL" ]; then
        log "Deployment complete ✓"
        log "Service URL: $SERVICE_URL"
        
        # Open service URL in browser
        log "Opening service in browser..."
        if command -v open >/dev/null; then
            open "$SERVICE_URL"
        elif command -v xdg-open >/dev/null; then
            xdg-open "$SERVICE_URL"
        fi
    else
        log "Deployment in progress. Check the build logs above for status."
    fi
    
    # Test health endpoint
    step "Testing deployment..."
    sleep 5
    if curl -f -s "$SERVICE_URL/api/health" >/dev/null; then
        log "Health check passed ✓"
    else
        warn "Health check failed - service may still be starting"
    fi
    
    # Open in browser
    if command -v open >/dev/null; then
        open "$SERVICE_URL" 2>/dev/null &
    fi
    
    echo
    log "🚀 API deployed successfully!"
    log "URL: $SERVICE_URL"
    log "Health: $SERVICE_URL/api/health"
    log "Environment: $ENVIRONMENT"
}

# Main
main() {
    echo "🚀 TBE API - Cloud Build Deployment"
    echo "==================================="
    echo
    
    check_prereqs
    build_and_test_locally
    
    echo
    log "✅ Local build successful! Ready for deployment."
    echo
    
    select_environment
    
    echo
    read -p "Deploy to $ENVIRONMENT environment? (y/n) [y]: " DEPLOY_CONFIRM
    DEPLOY_CONFIRM=${DEPLOY_CONFIRM:-y}
    
    if [[ ! $DEPLOY_CONFIRM =~ ^[Yy]$ ]]; then
        echo "Deployment cancelled."
        exit 0
    fi
    
    setup_gcp
    deploy_with_cloud_build
    
    echo
    log "✅ Done! Your API is live on Cloud Run."
}

# Handle command line arguments
while [[ "$#" -gt 0 ]]; do
    case $1 in
        --staging) 
            DEPLOY_ENV="staging"
            shift
            ;;
        --production) 
            DEPLOY_ENV="production"
            shift
            ;;
        --manual) 
            DEPLOY_ENV="manual"
            shift
            ;;
        --status)
            check_deployment_status
            exit 0
            ;;
        -h|--help)
            echo "Usage: $0 [--staging|--production|--manual|--status]"
            echo "  --staging: Deploy to staging environment"
            echo "  --production: Deploy to production environment"
            echo "  --manual: Deploy to manual/dev environment"
            echo "  --status: Check deployment status"
            exit 0
            ;;
        *) 
            error "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Run if called directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi