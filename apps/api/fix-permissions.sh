#!/bin/bash

# Quick fix for Secret Manager permissions
# Run this if you get permission denied errors

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

# Get project ID
PROJECT_ID=$(gcloud config get-value project 2>/dev/null || echo "")

if [ -z "$PROJECT_ID" ]; then
    error "No GCP project set. Run: gcloud config set project YOUR_PROJECT_ID"
    exit 1
fi

log "Fixing Secret Manager permissions for project: $PROJECT_ID"

# Grant Secret Manager access to Cloud Run service account
step "Granting Secret Manager access to Cloud Run service account..."
SERVICE_ACCOUNT="183084025505-compute@developer.gserviceaccount.com"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:${SERVICE_ACCOUNT}" \
    --role="roles/secretmanager.secretAccessor" \
    --quiet

log "✅ Permissions fixed! You can now deploy again."
log "Run: ./deploy.sh --staging"
