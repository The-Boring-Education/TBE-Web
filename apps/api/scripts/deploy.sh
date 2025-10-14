#!/bin/bash

# TBE API - Deployment Script
# This script handles the complete deployment process to Google Cloud Run

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

print_success() {
    echo -e "${PURPLE}[SUCCESS]${NC} $1"
}

# Check dependencies
check_dependencies() {
    print_step "Checking dependencies..."
    
    local missing_deps=()
    
    if ! command -v gcloud &> /dev/null; then
        missing_deps+=("gcloud CLI")
    fi
    
    if ! command -v docker &> /dev/null; then
        missing_deps+=("Docker")
    fi
    
    if ! command -v pnpm &> /dev/null; then
        missing_deps+=("pnpm")
    fi
    
    if [ ${#missing_deps[@]} -gt 0 ]; then
        print_error "Missing dependencies: ${missing_deps[*]}"
        echo "Please install the missing dependencies and try again."
        exit 1
    fi
    
    print_success "All dependencies are installed ✓"
}

# Get current project and validate setup
validate_gcp_setup() {
    print_step "Validating Google Cloud setup..."
    
    PROJECT_ID=$(gcloud config get-value project 2>/dev/null || echo "")
    if [ -z "$PROJECT_ID" ]; then
        print_error "No active GCP project found."
        echo "Please run: gcloud config set project YOUR_PROJECT_ID"
        exit 1
    fi
    
    print_status "Using project: $PROJECT_ID"
    
    # Check if APIs are enabled
    print_status "Checking if required APIs are enabled..."
    local required_apis=("run" "artifactregistry" "cloudbuild" "secretmanager")
    for api in "${required_apis[@]}"; do
        if ! gcloud services list --enabled --filter="name:${api}.googleapis.com" --format="value(name)" | grep -q "${api}.googleapis.com"; then
            print_warning "API ${api}.googleapis.com might not be enabled"
        fi
    done
    
    print_success "GCP setup validation completed ✓"
}

# Select deployment environment
select_environment() {
    echo
    print_step "Select deployment environment:"
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
            print_error "Invalid choice. Defaulting to staging."
            ENVIRONMENT="staging"
            SERVICE_NAME="tbe-api-staging"
            MIN_INSTANCES=0
            MAX_INSTANCES=10
            MEMORY="1Gi"
            ;;
    esac
    
    print_status "Selected environment: $ENVIRONMENT"
    print_status "Service name: $SERVICE_NAME"
}

# Build the application
build_application() {
    print_step "Building application..."
    
    # Navigate to project root
    cd "$(dirname "$0")/../../.."
    
    print_status "Installing dependencies..."
    pnpm install --frozen-lockfile
    
    print_status "Building shared packages..."
    pnpm run build --filter=@tbe/constants &
    pnpm run build --filter=@tbe/types &
    pnpm run build --filter=@tbe/utils &
    wait
    
    pnpm run build --filter=@tbe/database &
    pnpm run build --filter=@tbe/interface &
    pnpm run build --filter=@tbe/services &
    wait
    
    print_status "Running linter..."
    pnpm run lint --filter=@tbe/api
    
    print_success "Application build completed ✓"
}

# Deploy to Cloud Run
deploy_to_cloud_run() {
    print_step "Deploying to Google Cloud Run..."
    
    # Navigate to API directory
    cd apps/api
    
    REGION="asia-south1"
    REPOSITORY="tbe-api-repo"
    IMAGE_TAG="manual-$(date +%Y%m%d-%H%M%S)"
    IMAGE_NAME="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPOSITORY}/tbe-api:${IMAGE_TAG}"
    
    print_status "Building Docker image..."
    docker build -t $IMAGE_NAME .
    
    print_status "Pushing image to Artifact Registry..."
    gcloud auth configure-docker ${REGION}-docker.pkg.dev --quiet
    docker push $IMAGE_NAME
    
    print_status "Deploying to Cloud Run service: $SERVICE_NAME..."
    gcloud run deploy $SERVICE_NAME \
        --image $IMAGE_NAME \
        --region $REGION \
        --platform managed \
        --allow-unauthenticated \
        --memory $MEMORY \
        --cpu 1 \
        --min-instances $MIN_INSTANCES \
        --max-instances $MAX_INSTANCES \
        --concurrency 80 \
        --timeout 300s \
        --port 3000 \
        --set-env-vars NODE_ENV=$ENVIRONMENT \
        --set-secrets MONGODB_URI=mongodb-uri:latest,NEXTAUTH_SECRET=nextauth-secret:latest,ADMIN_SECRET=admin-secret:latest,OPENAI_API_KEY=openai-api-key:latest,YOUTUBE_API_KEY=youtube-api-key:latest,CASHFREE_SECRET_KEY=cashfree-secret-key:latest,EMAIL_API_KEY=email-api-key:latest,SENTRY_AUTH_TOKEN=sentry-auth-token:latest \
        --quiet
    
    print_success "Deployment completed ✓"
}

# Get service URL and test deployment
test_deployment() {
    print_step "Testing deployment..."
    
    SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region asia-south1 --format 'value(status.url)')
    
    print_status "Service URL: $SERVICE_URL"
    
    # Wait a moment for the service to be ready
    sleep 10
    
    print_status "Testing health endpoint..."
    if curl -f -s "$SERVICE_URL/api/health" > /dev/null; then
        print_success "Health check passed ✓"
        
        # Get health check response
        HEALTH_RESPONSE=$(curl -s "$SERVICE_URL/api/health" | jq -r '.status // "unknown"' 2>/dev/null || echo "ok")
        print_status "Health status: $HEALTH_RESPONSE"
    else
        print_warning "Health check failed. Service might still be starting up."
    fi
    
    return $SERVICE_URL
}

# Open monitoring dashboards
open_monitoring() {
    print_step "Opening monitoring dashboards..."
    
    local base_url="https://console.cloud.google.com"
    
    # Cloud Run service page
    local service_url="${base_url}/run/detail/${REGION}/${SERVICE_NAME}/metrics?project=${PROJECT_ID}"
    
    # Cloud Logging
    local logging_url="${base_url}/logs/query;query=resource.type%3D%22cloud_run_revision%22%0Aresource.labels.service_name%3D%22${SERVICE_NAME}%22?project=${PROJECT_ID}"
    
    # Error Reporting
    local error_url="${base_url}/errors?project=${PROJECT_ID}"
    
    # Artifact Registry
    local registry_url="${base_url}/artifacts/docker/${PROJECT_ID}/${REGION}/tbe-api-repo?project=${PROJECT_ID}"
    
    echo
    print_success "🚀 Deployment Complete!"
    echo "=================================="
    echo
    echo "📋 Service Information:"
    echo "  Environment: $ENVIRONMENT"
    echo "  Service Name: $SERVICE_NAME"
    echo "  Service URL: $SERVICE_URL"
    echo "  Region: $REGION"
    echo "  Image: $IMAGE_NAME"
    echo
    echo "📊 Monitoring Links:"
    echo "  Service Dashboard: $service_url"
    echo "  Logs: $logging_url" 
    echo "  Error Reporting: $error_url"
    echo "  Container Registry: $registry_url"
    echo
    
    # Ask if user wants to open monitoring pages
    read -p "Open monitoring dashboards in browser? (y/n) [y]: " OPEN_BROWSER
    OPEN_BROWSER=${OPEN_BROWSER:-y}
    
    if [[ $OPEN_BROWSER =~ ^[Yy]$ ]]; then
        print_status "Opening dashboards..."
        
        # Try to open URLs (works on macOS, Linux with xdg-open, Windows with start)
        if command -v open &> /dev/null; then
            # macOS
            open "$service_url" 2>/dev/null &
            sleep 1
            open "$SERVICE_URL" 2>/dev/null &
        elif command -v xdg-open &> /dev/null; then
            # Linux
            xdg-open "$service_url" 2>/dev/null &
            sleep 1
            xdg-open "$SERVICE_URL" 2>/dev/null &
        elif command -v start &> /dev/null; then
            # Windows
            start "$service_url" 2>/dev/null &
            sleep 1
            start "$SERVICE_URL" 2>/dev/null &
        else
            print_warning "Could not automatically open browser. Please visit the URLs above manually."
        fi
    fi
    
    echo
    print_success "✅ Deployment process completed successfully!"
    echo
    echo "Next steps:"
    echo "1. Test your API endpoints"
    echo "2. Monitor logs and metrics in Google Cloud Console"
    echo "3. Update your UI applications to use the new API URL"
    echo "4. Set up custom domain if needed"
}

# Main deployment function
main() {
    echo "🚀 TBE API - Cloud Run Deployment"
    echo "================================="
    echo
    
    check_dependencies
    validate_gcp_setup
    select_environment
    
    echo
    print_warning "This will deploy the TBE API to Google Cloud Run."
    print_warning "Make sure you have run './scripts/setup-secrets.sh' first."
    echo
    
    read -p "Continue with deployment? (y/n) [y]: " CONTINUE
    CONTINUE=${CONTINUE:-y}
    
    if [[ ! $CONTINUE =~ ^[Yy]$ ]]; then
        echo "Deployment cancelled."
        exit 0
    fi
    
    echo
    print_status "Starting deployment process..."
    
    build_application
    deploy_to_cloud_run
    test_deployment
    open_monitoring
}

# Handle script arguments
case "${1:-}" in
    --help|-h)
        echo "TBE API Deployment Script"
        echo
        echo "Usage: $0 [options]"
        echo
        echo "Options:"
        echo "  --help, -h     Show this help message"
        echo "  --staging      Deploy to staging environment"
        echo "  --production   Deploy to production environment"
        echo "  --manual       Deploy current code as manual/dev environment"
        echo
        echo "Interactive mode (default):"
        echo "  $0"
        echo
        echo "Examples:"
        echo "  $0                    # Interactive deployment"
        echo "  $0 --staging          # Direct staging deployment"
        echo "  $0 --production       # Direct production deployment"
        exit 0
        ;;
    --staging)
        ENVIRONMENT="staging"
        SERVICE_NAME="tbe-api-staging"
        MIN_INSTANCES=0
        MAX_INSTANCES=10
        MEMORY="1Gi"
        ;;
    --production)
        ENVIRONMENT="production"
        SERVICE_NAME="tbe-api"
        MIN_INSTANCES=1
        MAX_INSTANCES=20
        MEMORY="2Gi"
        ;;
    --manual)
        ENVIRONMENT="manual"
        SERVICE_NAME="tbe-api-dev"
        MIN_INSTANCES=0
        MAX_INSTANCES=5
        MEMORY="1Gi"
        ;;
    "")
        # Interactive mode - main function will handle environment selection
        main "$@"
        exit 0
        ;;
    *)
        print_error "Unknown option: $1"
        echo "Use --help for usage information"
        exit 1
        ;;
esac

# Non-interactive mode
echo "🚀 TBE API - Cloud Run Deployment ($ENVIRONMENT)"
echo "=============================================="
echo

check_dependencies
validate_gcp_setup

print_status "Environment: $ENVIRONMENT"
print_status "Service: $SERVICE_NAME"
echo

build_application
deploy_to_cloud_run
test_deployment
open_monitoring
