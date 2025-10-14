#!/bin/bash

# TBE API - Complete Setup and Deployment Script
# This script runs the complete setup and deployment process

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

print_header() {
    echo -e "${PURPLE}$1${NC}"
}

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

# Check if scripts exist
check_scripts() {
    local script_dir="$(dirname "$0")"
    
    if [ ! -f "$script_dir/setup-gcp.sh" ]; then
        print_error "setup-gcp.sh not found in scripts directory"
        exit 1
    fi
    
    if [ ! -f "$script_dir/setup-secrets.sh" ]; then
        print_error "setup-secrets.sh not found in scripts directory"
        exit 1
    fi
    
    if [ ! -f "$script_dir/deploy.sh" ]; then
        print_error "deploy.sh not found in scripts directory"
        exit 1
    fi
    
    # Make sure scripts are executable
    chmod +x "$script_dir/setup-gcp.sh"
    chmod +x "$script_dir/setup-secrets.sh"
    chmod +x "$script_dir/deploy.sh"
}

# Show setup menu
show_menu() {
    clear
    print_header "🚀 TBE API - Complete Setup & Deployment"
    print_header "========================================"
    echo
    echo "This script will guide you through the complete setup and deployment process."
    echo
    echo "Setup stages:"
    echo "  1️⃣  Google Cloud Platform setup (APIs, service accounts, repositories)"
    echo "  2️⃣  Secret Manager configuration (environment variables, API keys)"
    echo "  3️⃣  Application deployment to Cloud Run"
    echo "  4️⃣  Monitoring and validation"
    echo
    echo "Choose your setup option:"
    echo "  1) Complete setup (all steps - recommended for first time)"
    echo "  2) Skip GCP setup (if already completed)"
    echo "  3) Skip to deployment only (if GCP + secrets are configured)"
    echo "  4) Setup only (no deployment)"
    echo "  5) Exit"
    echo
    read -p "Enter your choice (1-5) [1]: " SETUP_CHOICE
    SETUP_CHOICE=${SETUP_CHOICE:-1}
}

# Run GCP setup
run_gcp_setup() {
    print_header "🛠️  Step 1: Google Cloud Platform Setup"
    print_header "======================================"
    echo
    print_status "Setting up Google Cloud resources..."
    echo
    
    ./scripts/setup-gcp.sh
    
    if [ $? -eq 0 ]; then
        print_success "✅ GCP setup completed successfully!"
    else
        print_error "❌ GCP setup failed. Please check the errors above."
        exit 1
    fi
    
    echo
    read -p "Press Enter to continue to secrets setup..."
}

# Run secrets setup  
run_secrets_setup() {
    print_header "🔐 Step 2: Secret Manager Configuration"
    print_header "====================================="
    echo
    print_status "Setting up secrets and environment variables..."
    echo
    
    ./scripts/setup-secrets.sh
    
    if [ $? -eq 0 ]; then
        print_success "✅ Secrets setup completed successfully!"
    else
        print_error "❌ Secrets setup failed. Please check the errors above."
        exit 1
    fi
    
    echo
    read -p "Press Enter to continue to deployment..."
}

# Run deployment
run_deployment() {
    print_header "🚀 Step 3: Application Deployment"
    print_header "================================"
    echo
    print_status "Deploying TBE API to Google Cloud Run..."
    echo
    
    ./scripts/deploy.sh
    
    if [ $? -eq 0 ]; then
        print_success "✅ Deployment completed successfully!"
    else
        print_error "❌ Deployment failed. Please check the errors above."
        exit 1
    fi
}

# Show final summary
show_final_summary() {
    print_header "🎉 Setup and Deployment Complete!"
    print_header "================================"
    echo
    print_success "Your TBE API is now deployed and running on Google Cloud Run!"
    echo
    echo "What's been configured:"
    echo "  ✅ Google Cloud Project with required APIs"
    echo "  ✅ Artifact Registry for container images"
    echo "  ✅ Service account with proper permissions"
    echo "  ✅ Secret Manager with environment variables"
    echo "  ✅ Cloud Run service deployed and running"
    echo "  ✅ Monitoring and logging configured"
    echo
    echo "Next steps for GitHub Actions automation:"
    echo "  1. Add GitHub secrets (if not done already):"
    echo "     - GCP_PROJECT_ID: Your Google Cloud project ID"
    echo "     - GCP_SA_KEY: Contents of github-actions-key.json"
    echo
    echo "  2. Push your code to trigger automated deployments:"
    echo "     git add ."
    echo "     git commit -m 'feat: add Cloud Run deployment'"
    echo "     git push origin development  # → staging deployment"
    echo "     git push origin main         # → production deployment"
    echo
    echo "  3. Monitor your deployments:"
    echo "     - GitHub Actions: Repository → Actions tab"
    echo "     - Google Cloud Console: Cloud Run section"
    echo "     - API Health: Visit your service URL + /api/health"
    echo
    print_success "🎊 Congratulations! Your API is cloud-ready!"
}

# Handle GitHub setup reminder
github_setup_reminder() {
    echo
    print_header "📋 GitHub Actions Setup"
    print_header "======================"
    echo
    print_status "To enable automated deployments via GitHub Actions:"
    echo
    echo "1. Go to your GitHub repository"
    echo "2. Navigate to: Settings → Secrets and variables → Actions"
    echo "3. Add these repository secrets:"
    echo
    echo "   Secret Name: GCP_PROJECT_ID"
    echo "   Value: $(gcloud config get-value project 2>/dev/null || echo 'YOUR_PROJECT_ID')"
    echo
    echo "   Secret Name: GCP_SA_KEY"
    echo "   Value: [Contents of github-actions-key.json file]"
    echo
    
    if [ -f "github-actions-key.json" ]; then
        echo "📄 Service account key file: github-actions-key.json"
        print_warning "Copy the ENTIRE contents of this file into the GCP_SA_KEY secret"
    fi
    
    echo
    read -p "Open GitHub repository settings? (y/n) [y]: " OPEN_GITHUB
    OPEN_GITHUB=${OPEN_GITHUB:-y}
    
    if [[ $OPEN_GITHUB =~ ^[Yy]$ ]]; then
        # Try to get the GitHub repository URL
        local repo_url=""
        if command -v git &> /dev/null && git rev-parse --is-inside-work-tree &> /dev/null; then
            repo_url=$(git config --get remote.origin.url 2>/dev/null || echo "")
            if [[ $repo_url =~ ^git@ ]]; then
                # Convert SSH URL to HTTPS
                repo_url=$(echo "$repo_url" | sed 's/git@github.com:/https:\/\/github.com\//' | sed 's/\.git$//')
            fi
        fi
        
        if [ -n "$repo_url" ]; then
            local settings_url="${repo_url}/settings/secrets/actions"
            print_status "Opening GitHub repository settings..."
            
            if command -v open &> /dev/null; then
                open "$settings_url" 2>/dev/null &
            elif command -v xdg-open &> /dev/null; then
                xdg-open "$settings_url" 2>/dev/null &
            else
                echo "Repository settings URL: $settings_url"
            fi
        else
            print_warning "Could not detect GitHub repository URL. Please navigate manually."
        fi
    fi
}

# Main function
main() {
    # Get script directory
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    cd "$SCRIPT_DIR/.."  # Navigate to API directory
    
    check_scripts
    show_menu
    
    case $SETUP_CHOICE in
        1)
            # Complete setup
            run_gcp_setup
            run_secrets_setup  
            run_deployment
            show_final_summary
            github_setup_reminder
            ;;
        2)
            # Skip GCP setup
            print_status "Skipping GCP setup (assuming already completed)"
            run_secrets_setup
            run_deployment
            show_final_summary
            github_setup_reminder
            ;;
        3)
            # Deployment only
            print_status "Skipping to deployment (assuming GCP and secrets are configured)"
            run_deployment
            show_final_summary
            ;;
        4)
            # Setup only
            run_gcp_setup
            run_secrets_setup
            print_success "✅ Setup completed! Run './scripts/deploy.sh' when ready to deploy."
            github_setup_reminder
            ;;
        5)
            # Exit
            echo "Setup cancelled."
            exit 0
            ;;
        *)
            print_error "Invalid choice. Please run the script again."
            exit 1
            ;;
    esac
}

# Show help
show_help() {
    echo "TBE API - Complete Setup and Deployment Script"
    echo
    echo "Usage: $0 [options]"
    echo
    echo "Options:"
    echo "  --help, -h        Show this help message"
    echo "  --complete        Run complete setup (GCP + Secrets + Deploy)"
    echo "  --skip-gcp        Skip GCP setup, run secrets + deploy"  
    echo "  --deploy-only     Skip setup, deploy only"
    echo "  --setup-only      Run setup only, no deployment"
    echo
    echo "Interactive mode (default):"
    echo "  $0"
    echo
    echo "Examples:"
    echo "  $0                # Interactive setup menu"
    echo "  $0 --complete     # Complete automated setup"
    echo "  $0 --skip-gcp     # Skip GCP, run secrets + deploy"
    echo "  $0 --deploy-only  # Deploy only"
}

# Handle command line arguments
case "${1:-}" in
    --help|-h)
        show_help
        exit 0
        ;;
    --complete)
        SETUP_CHOICE=1
        ;;
    --skip-gcp)
        SETUP_CHOICE=2
        ;;
    --deploy-only)
        SETUP_CHOICE=3
        ;;
    --setup-only)
        SETUP_CHOICE=4
        ;;
    "")
        # Interactive mode - main function will handle it
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
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/.."  # Navigate to API directory
check_scripts

# Execute based on choice
case $SETUP_CHOICE in
    1) run_gcp_setup; run_secrets_setup; run_deployment; show_final_summary; github_setup_reminder ;;
    2) run_secrets_setup; run_deployment; show_final_summary; github_setup_reminder ;;
    3) run_deployment; show_final_summary ;;
    4) run_gcp_setup; run_secrets_setup; github_setup_reminder ;;
esac
