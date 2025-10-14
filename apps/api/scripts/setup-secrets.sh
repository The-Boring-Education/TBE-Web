#!/bin/bash

# TBE API - Secret Manager Setup Script
# This script creates all necessary secrets in Google Secret Manager

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

print_input() {
    echo -e "${BLUE}[INPUT]${NC} $1"
}

# Check if gcloud is installed and authenticated
check_gcloud() {
    if ! command -v gcloud &> /dev/null; then
        print_error "gcloud CLI is not installed."
        exit 1
    fi
    
    if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | head -1 > /dev/null; then
        print_error "No active gcloud authentication found. Please run 'gcloud auth login'"
        exit 1
    fi
    
    PROJECT_ID=$(gcloud config get-value project 2>/dev/null || echo "")
    if [ -z "$PROJECT_ID" ]; then
        print_error "No active GCP project. Please run 'gcloud config set project PROJECT_ID'"
        exit 1
    fi
    
    print_status "Using project: $PROJECT_ID"
}

# Create a secret in Secret Manager
create_secret() {
    local secret_name=$1
    local secret_description=$2
    local secret_value=$3
    local is_required=${4:-true}
    
    if [ -z "$secret_value" ]; then
        if [ "$is_required" = true ]; then
            print_error "Secret value for $secret_name is required but not provided."
            return 1
        else
            print_warning "Skipping optional secret: $secret_name"
            return 0
        fi
    fi
    
    # Check if secret already exists
    if gcloud secrets describe $secret_name &> /dev/null; then
        print_warning "Secret $secret_name already exists. Creating new version..."
        echo "$secret_value" | gcloud secrets versions add $secret_name --data-file=-
    else
        print_status "Creating secret: $secret_name"
        echo "$secret_value" | gcloud secrets create $secret_name --data-file=-
    fi
    
    print_status "✓ Secret $secret_name configured"
}

# Prompt for secret values
prompt_for_secrets() {
    echo "🔐 Setting up secrets for TBE API"
    echo "================================="
    echo
    print_warning "Please provide the following secret values:"
    echo "Press Enter to skip optional secrets, or Ctrl+C to exit."
    echo
    
    # Required secrets
    print_input "MongoDB Connection String (Required):"
    read -r MONGODB_URI
    
    print_input "NextAuth Secret (Required - generate with: openssl rand -base64 32):"
    read -r NEXTAUTH_SECRET
    
    print_input "Admin Secret (Required):"
    read -r ADMIN_SECRET
    
    # Optional but recommended secrets
    print_input "OpenAI API Key (Optional):"
    read -r OPENAI_API_KEY
    
    print_input "YouTube API Key (Optional):"
    read -r YOUTUBE_API_KEY
    
    print_input "Cashfree Secret Key (Optional):"
    read -r CASHFREE_SECRET_KEY
    
    print_input "Email API Key (Optional):"
    read -r EMAIL_API_KEY
    
    print_input "Sentry Auth Token (Optional):"
    read -r SENTRY_AUTH_TOKEN
}

# Create all secrets
setup_secrets() {
    print_status "Creating secrets in Google Secret Manager..."
    
    # Required secrets
    create_secret "mongodb-uri" "MongoDB connection string for TBE API" "$MONGODB_URI" true
    create_secret "nextauth-secret" "NextAuth.js secret key for session encryption" "$NEXTAUTH_SECRET" true
    create_secret "admin-secret" "Admin authentication secret for admin endpoints" "$ADMIN_SECRET" true
    
    # Optional secrets
    create_secret "openai-api-key" "OpenAI API key for AI features" "$OPENAI_API_KEY" false
    create_secret "youtube-api-key" "YouTube Data API key for video integration" "$YOUTUBE_API_KEY" false
    create_secret "cashfree-secret-key" "Cashfree payment gateway secret key" "$CASHFREE_SECRET_KEY" false
    create_secret "email-api-key" "Email service API key for notifications" "$EMAIL_API_KEY" false
    create_secret "sentry-auth-token" "Sentry authentication token for error tracking" "$SENTRY_AUTH_TOKEN" false
}

# Display environment variables that need to be set
show_env_vars() {
    echo
    print_status "📋 Environment Variables Reference"
    echo "================================="
    echo
    echo "The following non-sensitive environment variables need to be set in Cloud Run:"
    echo
    echo "Required:"
    echo "  NODE_ENV=production (or staging)"
    echo
    echo "Application URLs (update with your actual URLs):"
    echo "  API_URL=https://your-api-service-url"
    echo "  AUTH_URL=https://your-auth-url"
    echo "  ADMIN_BASE_URL=https://your-admin-url"
    echo "  PREPYATRA_APP_URL=https://your-prepyatra-url"
    echo "  QUIZ_APP_URL=https://your-quiz-url"
    echo "  EMAIL_SERVICE_URL=https://your-email-service-url"
    echo
    echo "Payment Configuration:"
    echo "  CASHFREE_BASE_URL=https://sandbox.cashfree.com/pg (or production URL)"
    echo "  CASHFREE_CLIENT_ID=your_cashfree_client_id"
    echo
    echo "Email Configuration:"
    echo "  FROM_EMAIL=noreply@yourdomain.com"
    echo
    print_warning "Set these in Cloud Run service configuration or GitHub Actions workflow."
}

# Generate sample .env file
generate_sample_env() {
    local env_file="apps/api/.env.example"
    
    print_status "Generating sample .env file: $env_file"
    
    cat > "$env_file" << 'EOF'
# TBE API Environment Variables
# Copy to .env.local for local development

# Node Environment
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/tbe-dev

# Authentication
NEXTAUTH_SECRET=your-nextauth-secret-key-here

# Admin
ADMIN_SECRET=your-admin-secret-key

# Application URLs
API_URL=http://localhost:3000
AUTH_URL=http://localhost:3000
ADMIN_BASE_URL=http://localhost:3001
PREPYATRA_APP_URL=http://localhost:3002
QUIZ_APP_URL=http://localhost:3003
EMAIL_SERVICE_URL=http://localhost:3004

# External Services (Optional)
OPENAI_API_KEY=your-openai-api-key
YOUTUBE_API_KEY=your-youtube-api-key

# Payment Gateway (Optional)
CASHFREE_BASE_URL=https://sandbox.cashfree.com/pg
CASHFREE_CLIENT_ID=your-cashfree-client-id
CASHFREE_SECRET_KEY=your-cashfree-secret-key

# Email Service (Optional)
EMAIL_API_KEY=your-email-api-key
FROM_EMAIL=noreply@yourdomain.com

# Monitoring (Optional)
SENTRY_AUTH_TOKEN=your-sentry-auth-token
EOF
    
    print_status "✓ Sample .env file created: $env_file"
}

# Main function
main() {
    echo "🔐 TBE API - Secret Manager Setup"
    echo "================================="
    echo
    
    check_gcloud
    
    echo "This script will help you set up all necessary secrets for the TBE API."
    echo "Secrets will be stored securely in Google Secret Manager."
    echo
    
    read -p "Continue with secret setup? (y/n) [y]: " CONTINUE
    CONTINUE=${CONTINUE:-y}
    
    if [[ ! $CONTINUE =~ ^[Yy]$ ]]; then
        echo "Setup cancelled."
        exit 0
    fi
    
    prompt_for_secrets
    setup_secrets
    show_env_vars
    generate_sample_env
    
    echo
    print_status "✅ Secret setup completed successfully!"
    echo
    echo "Next steps:"
    echo "1. Update environment variables in your Cloud Run service"
    echo "2. Deploy your API using the GitHub Actions workflow"
    echo "3. Test the deployment with health check endpoint"
    echo
    echo "For deployment instructions, see: apps/api/README-DEPLOYMENT.md"
}

# Run main function
main "$@"
