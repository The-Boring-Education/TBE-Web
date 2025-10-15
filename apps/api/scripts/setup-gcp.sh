#!/bin/bash

# TBE API - Google Cloud Platform Setup Script
# This script sets up the necessary GCP resources for deploying the TBE API

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_dependencies() {
    print_status "Checking dependencies..."
    
    if ! command -v gcloud &> /dev/null; then
        print_error "gcloud CLI is not installed. Please install it first."
        exit 1
    fi
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install it first."
        exit 1
    fi
    
    print_status "Dependencies check passed ✓"
}

# Get project ID from user or use current project
get_project_id() {
    CURRENT_PROJECT=$(gcloud config get-value project 2>/dev/null || echo "")
    
    if [ -z "$CURRENT_PROJECT" ]; then
        echo "No active GCP project found."
        read -p "Enter your GCP Project ID: " PROJECT_ID
    else
        echo "Current active project: $CURRENT_PROJECT"
        read -p "Use current project? (y/n) [y]: " USE_CURRENT
        USE_CURRENT=${USE_CURRENT:-y}
        
        if [[ $USE_CURRENT =~ ^[Yy]$ ]]; then
            PROJECT_ID=$CURRENT_PROJECT
        else
            read -p "Enter your GCP Project ID: " PROJECT_ID
        fi
    fi
    
    # Set the project
    gcloud config set project $PROJECT_ID
    print_status "Using project: $PROJECT_ID"
}

# Enable required APIs
enable_apis() {
    print_status "Enabling required Google Cloud APIs..."
    
    APIS=(
        "cloudbuild.googleapis.com"
        "run.googleapis.com"
        "artifactregistry.googleapis.com"
        "secretmanager.googleapis.com"
        "logging.googleapis.com"
        "monitoring.googleapis.com"
    )
    
    for api in "${APIS[@]}"; do
        print_status "Enabling $api..."
        gcloud services enable $api
    done
    
    print_status "All APIs enabled ✓"
}

# Create Artifact Registry repository
create_artifact_registry() {
    print_status "Creating Artifact Registry repository..."
    
    REPO_NAME="tbe-api-repo"
    REGION="asia-south1"
    
    # Check if repository already exists
    if gcloud artifacts repositories describe $REPO_NAME --location=$REGION &> /dev/null; then
        print_warning "Repository $REPO_NAME already exists in $REGION"
    else
        gcloud artifacts repositories create $REPO_NAME \
            --repository-format=docker \
            --location=$REGION \
            --description="TBE API container images"
        
        print_status "Artifact Registry repository created ✓"
    fi
}

# Create service account for GitHub Actions
create_service_account() {
    print_status "Creating service account for GitHub Actions..."
    
    SA_NAME="github-actions-sa"
    SA_DISPLAY_NAME="GitHub Actions Service Account"
    
    # Check if service account already exists
    if gcloud iam service-accounts describe "${SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com" &> /dev/null; then
        print_warning "Service account $SA_NAME already exists"
        SA_EMAIL="${SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"
    else
        gcloud iam service-accounts create $SA_NAME \
            --display-name="$SA_DISPLAY_NAME"
        
        SA_EMAIL="${SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"
        print_status "Service account created: $SA_EMAIL"
    fi
    
    # Grant necessary permissions
    print_status "Granting IAM permissions..."
    
    ROLES=(
        "roles/run.admin"
        "roles/storage.admin"
        "roles/artifactregistry.admin"
        "roles/secretmanager.secretAccessor"
        "roles/cloudbuild.builds.builder"
        "roles/logging.logWriter"
        "roles/monitoring.metricWriter"
    )
    
    for role in "${ROLES[@]}"; do
        gcloud projects add-iam-policy-binding $PROJECT_ID \
            --member="serviceAccount:$SA_EMAIL" \
            --role="$role"
    done
    
    print_status "IAM permissions granted ✓"
    
    # Create and download service account key
    print_status "Creating service account key..."
    KEY_FILE="github-actions-key.json"
    
    gcloud iam service-accounts keys create $KEY_FILE \
        --iam-account=$SA_EMAIL
    
    print_status "Service account key saved to: $KEY_FILE"
    print_warning "Add this key to your GitHub repository secrets as 'GCP_SA_KEY'"
}

# Configure Docker authentication
configure_docker() {
    print_status "Configuring Docker authentication..."
    
    gcloud auth configure-docker asia-south1-docker.pkg.dev
    
    print_status "Docker authentication configured ✓"
}

# Create initial Cloud Run service (optional)
create_initial_service() {
    print_status "Would you like to create initial Cloud Run services?"
    read -p "Create services? (y/n) [n]: " CREATE_SERVICES
    CREATE_SERVICES=${CREATE_SERVICES:-n}
    
    if [[ $CREATE_SERVICES =~ ^[Yy]$ ]]; then
        print_status "Creating staging service..."
        
        # Create a minimal service that we can update later
        gcloud run services replace <(cat <<EOF
apiVersion: serving.knative.dev/v1
kind: Service
metadata:
  name: tbe-api-staging
  annotations:
    run.googleapis.com/ingress: all
spec:
  template:
    metadata:
      annotations:
        autoscaling.knative.dev/maxScale: "10"
        run.googleapis.com/cpu-throttling: "true"
        run.googleapis.com/memory: "1Gi"
        run.googleapis.com/cpu: "1"
    spec:
      containerConcurrency: 80
      timeoutSeconds: 300
      containers:
      - image: gcr.io/cloudrun/hello
        ports:
        - containerPort: 8080
        env:
        - name: NODE_ENV
          value: staging
        resources:
          limits:
            cpu: "1"
            memory: "1Gi"
EOF
) --region=asia-south1
        
        print_status "Staging service created ✓"
    fi
}

# Main setup function
main() {
    echo "🚀 TBE API - Google Cloud Platform Setup"
    echo "========================================"
    echo
    
    check_dependencies
    get_project_id
    enable_apis
    create_artifact_registry
    create_service_account
    configure_docker
    create_initial_service
    
    echo
    print_status "✅ GCP setup completed successfully!"
    echo
    echo "Next steps:"
    echo "1. Add the service account key (github-actions-key.json) to GitHub secrets"
    echo "2. Add your project ID as 'GCP_PROJECT_ID' in GitHub secrets"
    echo "3. Set up environment variables and secrets in Google Secret Manager"
    echo "4. Deploy your API using the GitHub Actions workflow"
    echo
    echo "For detailed instructions, see: apps/api/README-DEPLOYMENT.md"
}

# Run the main function
main "$@"
