# 🌐 TBE API - Centralized Backend Service

A comprehensive Next.js API application serving as the centralized backend for all TBE platform applications, deployed on Google Cloud Run.

## 📋 Overview

The TBE API provides a unified backend service handling authentication, data management, external integrations, and business logic for the entire TBE ecosystem.

### Key Features

- **Unified Authentication**: NextAuth.js integration for all apps
- **Database Management**: MongoDB operations and data modeling
- **External Integrations**: OpenAI, YouTube, payment gateways
- **RESTful APIs**: Comprehensive endpoint coverage
- **Cloud Deployment**: Optimized for Google Cloud Run
- **Monitoring**: Sentry integration for error tracking

## 🛠️ Tech Stack

- **Framework**: Next.js 13.2.4 (API Routes)
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: NextAuth.js
- **External APIs**: OpenAI, YouTube Data API, Cashfree
- **Deployment**: Google Cloud Run
- **Monitoring**: Sentry
- **Container**: Docker

## 🚀 Development

### Prerequisites

- Node.js >= 20.x
- pnpm >= 9.12.0
- MongoDB instance (local or cloud)
- Docker (for containerization)

### Setup

```bash
# From monorepo root
pnpm install

# Start API server only
pnpm dev:api

# Or start all apps
pnpm dev
```

The API will be available at `http://localhost:3004`

### Environment Variables

Create `.env.local` in the app directory:

```bash
# Database
MONGODB_URI=mongodb://localhost:27017/tbe-platform

# Authentication
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3004

# Google OAuth
GOOGLE_AUTH_CLIENT_ID=your-google-client-id
GOOGLE_AUTH_CLIENT_SECRET=your-google-client-secret

# External APIs
OPENAI_API_KEY=your-openai-api-key
YOUTUBE_API_KEY=your-youtube-api-key

# Payment Gateway
CASHFREE_CLIENT_ID=your-cashfree-client-id
CASHFREE_SECRET_KEY=your-cashfree-secret-key
CASHFREE_BASE_URL=https://sandbox.cashfree.com

# Email Service
EMAIL_API_KEY=your-email-api-key
FROM_EMAIL=noreply@theboringeducation.com
EMAIL_SERVICE_URL=your-email-service-url

# Admin
ADMIN_SECRET=your-admin-secret

# Monitoring
SENTRY_AUTH_TOKEN=your-sentry-token
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn

# Environment
NODE_ENV=development
```

## 📁 Project Structure

```
apps/api/
├── src/
│   ├── pages/
│   │   └── api/            # API routes
│   │       ├── auth/       # Authentication endpoints
│   │       ├── v1/         # Versioned API endpoints
│   │       │   ├── user/   # User management
│   │       │   ├── quiz/   # Quiz operations
│   │       │   ├── course/ # Course management
│   │       │   ├── project/# Project operations
│   │       │   └── analytics/ # Analytics endpoints
│   │       └── health/     # Health check
│   ├── lib/               # Core libraries and utilities
│   │   ├── auth/          # Authentication logic
│   │   ├── database/      # Database models and queries
│   │   ├── services/      # External service integrations
│   │   └── utils/         # Utility functions
│   ├── middleware/        # API middleware
│   └── types/             # TypeScript type definitions
├── Dockerfile             # Docker configuration
├── deploy.sh             # Deployment script
├── cloudbuild.yaml       # Google Cloud Build config
└── next.config.js        # Next.js configuration
```

## 🔧 Available Scripts

```bash
# Development
pnpm dev                   # Start development server (port 3004)

# Building
pnpm build                 # Build for production
pnpm start                 # Start production server
pnpm start:cloud-run      # Start for Cloud Run deployment

# Code Quality
pnpm lint                  # Run ESLint

# Docker
pnpm docker:build         # Build Docker image
pnpm docker:run           # Run Docker container
pnpm docker:test          # Test Docker build

# Deployment
pnpm deploy               # Deploy to Google Cloud Run
```

## 🔌 API Endpoints

### Authentication (`/api/auth/`)

```typescript
// NextAuth.js endpoints
POST   /api/auth/signin      # Sign in
POST   /api/auth/signout     # Sign out
GET    /api/auth/session     # Get session
GET    /api/auth/providers   # Get auth providers
```

### User Management (`/api/v1/user/`)

```typescript
GET    /api/v1/user/profile     # Get user profile
PUT    /api/v1/user/profile     # Update user profile
POST   /api/v1/user/register    # Register new user
GET    /api/v1/user/progress    # Get user progress
PUT    /api/v1/user/preferences # Update preferences
```

### Quiz System (`/api/v1/quiz/`)

```typescript
GET    /api/v1/quiz/list        # Get available quizzes
GET    /api/v1/quiz/:id         # Get specific quiz
POST   /api/v1/quiz/attempt     # Submit quiz attempt
GET    /api/v1/quiz/results/:id # Get quiz results
GET    /api/v1/quiz/leaderboard # Get leaderboard
POST   /api/v1/quiz/upload      # Upload quiz content
```

### Course Management (`/api/v1/course/`)

```typescript
GET    /api/v1/course/list      # Get available courses
GET    /api/v1/course/:id       # Get specific course
POST   /api/v1/course/enroll    # Enroll in course
PUT    /api/v1/course/progress  # Update course progress
GET    /api/v1/course/my-courses # Get user's courses
```

### Analytics (`/api/v1/analytics/`)

```typescript
POST   /api/v1/analytics/track  # Track user events
GET    /api/v1/analytics/dashboard # Get analytics dashboard
GET    /api/v1/analytics/performance # Get performance metrics
```

## 🗄️ Database Models

### User Model

```typescript
interface User {
    _id: ObjectId
    email: string
    name: string
    image?: string
    role: "student" | "instructor" | "admin"
    profile: {
        skills: string[]
        interests: string[]
        experience: string
        goals: string[]
    }
    progress: {
        coursesCompleted: number
        quizzesAttempted: number
        totalPoints: number
        achievements: string[]
    }
    createdAt: Date
    updatedAt: Date
}
```

### Quiz Model

```typescript
interface Quiz {
    _id: ObjectId
    title: string
    description: string
    category: string
    difficulty: "Beginner" | "Intermediate" | "Advanced"
    questions: Question[]
    timeLimit: number
    isActive: boolean
    createdBy: ObjectId
    createdAt: Date
}

interface Question {
    id: string
    question: string
    options: string[]
    correctAnswer: number
    explanation: string
    points: number
}
```

### Course Model

```typescript
interface Course {
    _id: ObjectId
    title: string
    description: string
    instructor: ObjectId
    modules: Module[]
    prerequisites: string[]
    difficulty: string
    duration: number
    isPublished: boolean
    enrollmentCount: number
    rating: number
}
```

## 🔐 Authentication & Authorization

### NextAuth Configuration

```typescript
// pages/api/auth/[...nextauth].ts
import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { MongoDBAdapter } from "@next-auth/mongodb-adapter"

export default NextAuth({
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_AUTH_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_AUTH_CLIENT_SECRET!
        })
    ],
    adapter: MongoDBAdapter(mongoClient),
    callbacks: {
        session: async ({ session, token }) => {
            // Customize session object
            return session
        },
        jwt: async ({ token, user }) => {
            // Customize JWT token
            return token
        }
    }
})
```

### Authorization Middleware

```typescript
// middleware/withAuth.ts
export const withAuth = (handler: NextApiHandler) => {
    return async (req: NextApiRequest, res: NextApiResponse) => {
        const session = await getSession({ req })

        if (!session) {
            return res.status(401).json({ error: "Unauthorized" })
        }

        req.user = session.user
        return handler(req, res)
    }
}

// Usage
export default withAuth(async (req, res) => {
    // Protected endpoint logic
})
```

## 🔌 External Service Integrations

### OpenAI Integration

```typescript
// lib/services/openai.ts
import { OpenAI } from "openai"

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
})

export const generateQuizQuestions = async (topic: string, count: number) => {
    const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
            {
                role: "system",
                content: "Generate quiz questions for the given topic..."
            },
            {
                role: "user",
                content: `Generate ${count} questions about ${topic}`
            }
        ]
    })

    return parseQuizQuestions(response.choices[0].message.content)
}
```

### Payment Integration

```typescript
// lib/services/payment.ts
import { Cashfree } from "cashfree-pg"

Cashfree.XClientId = process.env.CASHFREE_CLIENT_ID
Cashfree.XClientSecret = process.env.CASHFREE_SECRET_KEY
Cashfree.XEnvironment =
    process.env.NODE_ENV === "production"
        ? Cashfree.Environment.PRODUCTION
        : Cashfree.Environment.SANDBOX

export const createPaymentOrder = async (orderData: OrderData) => {
    const response = await Cashfree.PGCreateOrder("2023-08-01", orderData)
    return response.data
}
```

## 🚀 Deployment

### Google Cloud Run Deployment

```bash
# Deploy using the deployment script
./deploy.sh

# Or deploy manually
gcloud run deploy tbe-api \
  --image gcr.io/PROJECT_ID/tbe-api \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

### Docker Configuration

```dockerfile
# Dockerfile
FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build

# Expose port
EXPOSE 3000

# Start application
CMD ["npm", "run", "start:cloud-run"]
```

### Environment Variables (Production)

```bash
# Set in Google Cloud Run
MONGODB_URI=mongodb+srv://...
NEXTAUTH_SECRET=production-secret
OPENAI_API_KEY=sk-...
# ... other production variables
```

## 📊 Monitoring & Logging

### Sentry Integration

```typescript
// lib/sentry.ts
import * as Sentry from "@sentry/nextjs"

Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NODE_ENV
})

// Error handling in API routes
export const handleApiError = (error: Error, req: NextApiRequest) => {
    Sentry.captureException(error, {
        tags: {
            endpoint: req.url,
            method: req.method
        }
    })
}
```

### Health Check Endpoint

```typescript
// pages/api/health/index.ts
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        // Check database connection
        await mongoose.connection.db.admin().ping()

        res.status(200).json({
            status: "healthy",
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            version: process.env.npm_package_version
        })
    } catch (error) {
        res.status(503).json({
            status: "unhealthy",
            error: error.message
        })
    }
}
```

## 🧪 Testing

### API Testing

```typescript
// Example test structure
import { createMocks } from "node-mocks-http"
import handler from "../pages/api/v1/user/profile"

describe("/api/v1/user/profile", () => {
    it("returns user profile for authenticated user", async () => {
        const { req, res } = createMocks({
            method: "GET",
            headers: {
                authorization: "Bearer valid-token"
            }
        })

        await handler(req, res)

        expect(res._getStatusCode()).toBe(200)
        expect(JSON.parse(res._getData())).toHaveProperty("user")
    })
})
```

## 🐛 Troubleshooting

### Common Issues

**Database Connection:**

- Verify MongoDB URI and network access
- Check connection string format
- Ensure database exists and user has permissions

**Authentication Issues:**

- Verify NextAuth configuration
- Check environment variables
- Ensure callback URLs are correct

**External API Failures:**

- Check API keys and quotas
- Verify network connectivity
- Implement proper error handling and retries

**Deployment Issues:**

- Check Docker build process
- Verify Cloud Run configuration
- Monitor deployment logs

## 📖 Contributing

### Development Guidelines

1. **API Design**: Follow RESTful conventions
2. **Error Handling**: Implement consistent error responses
3. **Documentation**: Update API documentation for new endpoints
4. **Testing**: Add comprehensive test coverage
5. **Security**: Validate inputs and implement proper authorization

### Adding New Endpoints

1. Create endpoint in appropriate `/api/v1/` directory
2. Implement proper authentication/authorization
3. Add input validation and error handling
4. Update TypeScript types
5. Add tests and documentation

## 🔗 Integration Points

- **Platform**: User authentication and data
- **Prep Yatra**: Challenge data and progress
- **Quizes**: Quiz content and analytics
- **Onboarding**: User registration and setup

## 📈 Performance Considerations

- **Database Indexing**: Optimize query performance
- **Caching**: Implement Redis for frequently accessed data
- **Rate Limiting**: Prevent API abuse
- **Connection Pooling**: Optimize database connections

---

**Part of the TBE Platform Monorepo**
