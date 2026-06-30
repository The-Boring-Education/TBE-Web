# TBE Admin

Minimal admin dashboard for The Boring Education. Built with Vite, React, TypeScript, Tailwind, and shadcn-ui.

## Run locally

Prerequisites: Node.js 18+

```sh
cd tbe-admin
npm install

# Optional: point to Agents API (defaults to http://localhost:8000/api/v1)
echo 'VITE_AGENTS_API_BASE=http://localhost:8000/api/v1' > .env.local

npm run dev
```

## Build

```sh
npm run build
npm run preview
```

## Environment Configuration

The Admin UI supports three environments with automatic configuration and **separate, stylish sections** for Platform API and AI Agents:

### 🎨 **Stylish Environment Banner**

- **Gradient Background**: Beautiful blue-to-indigo gradient with modern styling
- **Separate Sections**: Platform API and AI Agents have distinct, independent configuration areas
- **Visual Indicators**: Color-coded status indicators and badges
- **Environment Selector**: Dropdown with emojis for Local 🚀, Dev 🔧, and Prod 🚀

### 🔗 **Platform API Section** (Green Theme)

- **Purpose**: User management, course data, quiz uploads
- **Status**: Always "Active" (green indicator)
- **Base URL**: Automatically configured per environment
- **Usage**: Main platform functionality

### 🤖 **AI Agents Section** (Purple Theme)

- **Purpose**: Quiz generation, interview prep, content creation
- **Status**: "AI-Powered" (purple indicator)
- **Base URL**: Separate configuration from Platform API
- **Usage**: AI-powered content generation services

### Environment URLs

- **Local**:
  - Platform API: `http://localhost:3004/api/v1`
  - Agents API: `http://localhost:8000/api/v1`
- **Dev**:
  - Platform API: `https://tbe-dev-git-development-tbe.vercel.app/api/v1`
  - Agents API: `https://tbe-agents-dev.vercel.app/api/v1`
- **Prod**:
  - Platform API: `https://www.theboringeducation.com/api/v1`
  - Agents API: `https://tbe-agents-prod.vercel.app/api/v1`

**Note**: Update the Agents API URLs in `src/hooks/useEnvironment.ts` with your actual deployment URLs.

## Quiz Generation UI

- Topic can be selected from a dynamic dropdown powered by Agents `/quiz/topics`
- Target audience selection: `beginners`, `developers` (default), `experts`
- **AgentsStatus Component**: Real-time status monitoring with refresh capability
- Environment-aware API calls - automatically uses correct URLs for Platform and Agents APIs
- Errors show proper server messages when available

## AI Agents Management

### 🤖 **AgentsStatus Component**

- **Independent Status Monitoring**: Separate from main platform API
- **Real-time Health Check**: Ping agents and fetch available topics
- **Environment Awareness**: Shows current environment and base URL
- **Interactive Controls**: Refresh status, open API documentation
- **Visual Status**: Color-coded online/offline indicators

### 📱 **AgentsPage** (Dedicated Management Interface)

- **Comprehensive Overview**: Full Agents API status and configuration
- **Service Catalog**: Available AI services with status indicators
- **API Documentation**: Quick access to Swagger docs and endpoints
- **Quick Actions**: Direct links to test endpoints and source code

### 🔄 **Automatic Integration**

- **Quiz Generation**: Automatically uses correct Agents API URL
- **Status Monitoring**: Real-time health checks across all environments
- **Error Handling**: Centralized error logging with environment context
- **Configuration Sync**: Environment changes automatically update both APIs

## Error Logging & Debugging

- **Centralized Error System**: All API errors are logged with detailed context
- **Enhanced Error Visibility**: Errors show in toast notifications with meaningful messages
- **Debug Panel**: Development-only debug panel (🐛 button) shows error history
- **Error Storage**: Last 10 errors stored in localStorage for debugging
- **Environment Tracking**: All errors include environment information for better debugging

## Agents API (for local dev)

Start the Agents service (FastAPI) separately:

```sh
cd ../The-Boring-Agents
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python3 run_api.py  # serves on http://localhost:8000
```

Key endpoints used by Admin:

- `GET {VITE_AGENTS_API_BASE}/ping` → health check
- `GET {VITE_AGENTS_API_BASE}/quiz/topics` → available topics
- `POST {VITE_AGENTS_API_BASE}/quiz/generate` → generate quiz (includes environment info)
- `POST {VITE_AGENTS_API_BASE}/quiz/validate` → validate quiz JSON
- `POST {VITE_AGENTS_API_BASE}/quiz/upload` → upload quiz to platform (includes environment info)

## Environment Switching

The Admin UI automatically:

1. Detects the selected environment (Local/Dev/Prod)
2. Uses the correct Platform API URL for uploads
3. Uses the correct Agents API URL for quiz generation
4. Passes environment information to Agents for tracking
5. Shows both API URLs in **separate, stylish sections**

## Debug Features

In development mode, a debug panel is available:

- Shows recent error history
- Displays HTTP status codes, URLs, and timestamps
- Allows clearing error logs
- Tracks environment information for each error

## Component Architecture

### **Independent Components**

- **AgentsStatus**: Standalone status monitoring component
- **MainLayout**: Environment configuration with separate sections
- **QuizzesPage**: Uses AgentsStatus for real-time monitoring
- **AgentsPage**: Dedicated Agents management interface

### **Reusable Design**

- **AgentsStatus**: Can be embedded anywhere in the app
- **Environment Hooks**: Shared across all components
- **Error Logging**: Centralized system for all components
- **Styling**: Consistent design language with color-coded sections
