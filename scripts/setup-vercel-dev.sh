#!/bin/bash

# TBE Vercel Development Setup Script
# This script helps set up Vercel local development environment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 TBE Vercel Development Setup${NC}"
echo "=================================="

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}⚠️  Vercel CLI not found. Installing...${NC}"
    npm install -g vercel
    echo -e "${GREEN}✅ Vercel CLI installed${NC}"
else
    echo -e "${GREEN}✅ Vercel CLI is already installed${NC}"
fi

# Check if user is logged in
if ! vercel whoami &> /dev/null; then
    echo -e "${YELLOW}🔐 Please log in to Vercel...${NC}"
    vercel login
else
    echo -e "${GREEN}✅ Already logged in to Vercel${NC}"
fi

# Link project if not already linked
if [ ! -f ".vercel/project.json" ]; then
    echo -e "${YELLOW}🔗 Linking project to Vercel...${NC}"
    vercel link
else
    echo -e "${GREEN}✅ Project already linked to Vercel${NC}"
fi

# Pull environment variables
echo -e "${BLUE}📥 Pulling environment variables...${NC}"
if vercel env pull .env.local; then
    echo -e "${GREEN}✅ Environment variables pulled to .env.local${NC}"
else
    echo -e "${RED}❌ Failed to pull environment variables${NC}"
    echo -e "${YELLOW}💡 You may need to set them manually in Vercel dashboard${NC}"
fi

# Optional: Pull development environment variables
read -p "Do you want to pull development environment variables? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if vercel env pull .env.development --environment=development; then
        echo -e "${GREEN}✅ Development environment variables pulled${NC}"
    else
        echo -e "${YELLOW}⚠️  Could not pull development environment variables${NC}"
    fi
fi

# Test configuration
echo -e "${BLUE}🔍 Testing reverse proxy configuration...${NC}"
if command -v node &> /dev/null; then
    node scripts/test-reverse-proxy.js
else
    echo -e "${YELLOW}⚠️  Node.js not found, skipping configuration test${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Setup complete!${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "1. Start Vercel development server: ${GREEN}npm run dev:vercel${NC}"
echo "2. Or start regular Next.js server: ${GREEN}npm run dev${NC}"
echo "3. Test reverse proxy: ${GREEN}http://localhost:3000/prepyatra${NC}"
echo "4. Debug if needed: ${GREEN}http://localhost:3000/prepyatra/debug${NC}"
echo "5. Check environment: ${GREEN}http://localhost:3000/api/env-check${NC}"
echo ""
echo -e "${YELLOW}💡 Remember to set environment variables in Vercel dashboard for deployments!${NC}"