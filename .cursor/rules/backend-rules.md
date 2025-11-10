# 🌐 TBE Platform - Backend Development Rules

## 📋 Overview

This document defines the backend development patterns, conventions, and best practices for the centralized TBE APIs service and any backend logic within Next.js applications.

## 🏗️ API Architecture

### Standard API Route Structure

```typescript
import type { NextApiRequest, NextApiResponse } from "next"
import { apiStatusCodes } from "@/config/constants"
import { sendAPIResponse } from "@/utils"
import { connectDB, cors } from "@/middleware"

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    // Apply CORS headers (REQUIRED)
    await cors(req, res)

    // Handle OPTIONS preflight
    if (req.method === "OPTIONS") {
        res.status(200).end()
        return
    }

    // Connect to database
    await connectDB()
    const { method, query, body } = req

    switch (method) {
        case "GET":
            return handleGet(req, res)
        case "POST":
            return handlePost(req, res)
        case "PATCH":
            return handlePatch(req, res)
        case "DELETE":
            return handleDelete(req, res)
        default:
            return res.status(apiStatusCodes.BAD_REQUEST).json(
                sendAPIResponse({
                    status: false,
                    message: `Method ${method} Not Allowed`
                })
            )
    }
}

export default handler
```

### Response Structure Pattern

```typescript
// Always use sendAPIResponse utility
import { sendAPIResponse } from "@/utils"

// Success response
return res.status(200).json(
    sendAPIResponse({
        status: true,
        data: result,
        message: "Operation successful"
    })
)

// Error response
return res.status(400).json(
    sendAPIResponse({
        status: false,
        message: "Validation error",
        error: errorDetails
    })
)
```

## 🗄️ Database Patterns

### Query Function Organization

```typescript
// Use existing query functions from @/database
import {
    getUserByIdFromDB,
    createUserInDB,
    updateUserInDB,
    deleteUserFromDB
} from "@/database"

// Create new query functions in appropriate files
// database/queries/user.ts
export const getUserByEmailFromDB = async (email: string) => {
    try {
        const user = await User.findOne({ email }).lean()
        return user
    } catch (error) {
        throw new Error(`Error fetching user: ${error.message}`)
    }
}
```

### Mongoose Model Patterns

```typescript
import mongoose, { Schema, Document } from "mongoose"

interface IUser extends Document {
    email: string
    name: string
    createdAt: Date
    updatedAt: Date
}

const UserSchema = new Schema<IUser>(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        name: {
            type: String,
            required: true,
            trim: true
        }
    },
    {
        timestamps: true,
        collection: "users"
    }
)

export const User =
    mongoose.models.User || mongoose.model<IUser>("User", UserSchema)
```

## 🔐 Authentication & Authorization

### Protected Route Pattern

```typescript
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/config/auth"

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    await cors(req, res)
    await connectDB()

    // Check authentication
    const session = await getServerSession(req, res, authOptions)

    if (!session) {
        return res.status(401).json(
            sendAPIResponse({
                status: false,
                message: "Unauthorized - Please login"
            })
        )
    }

    // Continue with authenticated logic
    const userId = session.user.id
    // ... rest of handler
}
```

### Admin Authorization

```typescript
import { withAuth } from "@/middleware"

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    await cors(req, res)
    await connectDB()

    // Use admin middleware
    const authResult = await withAuth(req, res, { requireAdmin: true })
    if (!authResult.success) {
        return res.status(401).json(
            sendAPIResponse({
                status: false,
                message: authResult.message
            })
        )
    }

    // Admin-only logic here
}
```

## 🛡️ Error Handling

### Consistent Error Patterns

```typescript
import { captureAPIError } from "@/utils/sentry"

const handleDatabaseOperation = async (
    req: NextApiRequest,
    res: NextApiResponse
) => {
    try {
        const result = await performDatabaseOperation()

        return res.status(200).json(
            sendAPIResponse({
                status: true,
                data: result
            })
        )
    } catch (error) {
        // Log error to Sentry
        captureAPIError(error, req)

        // Return user-friendly error
        return res.status(500).json(
            sendAPIResponse({
                status: false,
                message: "Internal server error"
            })
        )
    }
}
```

### Validation Patterns

```typescript
const validateRequestBody = (body: any, requiredFields: string[]) => {
    const missingFields = requiredFields.filter((field) => !body[field])

    if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(", ")}`)
    }
}

// Usage in handler
const handlePost = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        validateRequestBody(req.body, ["email", "name"])

        // Continue with logic
    } catch (error) {
        return res.status(400).json(
            sendAPIResponse({
                status: false,
                message: error.message
            })
        )
    }
}
```

## 🔌 External Service Integration

### Service Structure Pattern

```typescript
// services/email.ts
import { EmailAPIResponse } from "@/interfaces"

export const sendWelcomeEmail = async (
    email: string,
    name: string
): Promise<EmailAPIResponse> => {
    try {
        const response = await fetch(process.env.EMAIL_SERVICE_URL!, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.EMAIL_API_KEY}`
            },
            body: JSON.stringify({
                to: email,
                template: "welcome",
                data: { name }
            })
        })

        return await response.json()
    } catch (error) {
        throw new Error(`Email service error: ${error.message}`)
    }
}
```

## 📝 Interface Definitions

### Request/Response Types

```typescript
// Define in @/interfaces/api.ts
export interface CreateUserRequestPayloadProps {
    email: string
    name: string
    username?: string
}

export interface UserResponseProps {
    id: string
    email: string
    name: string
    createdAt: string
}

export interface APIResponse<T = any> {
    status: boolean
    message?: string
    data?: T
    error?: any
}
```

## 🚫 Backend Anti-Patterns

### ❌ What NOT to Do

1. **Don't skip CORS middleware**

```typescript
// BAD: No CORS handling
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    // Direct logic without CORS ❌
}

// GOOD: Always apply CORS
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    await cors(req, res) // ✅
}
```

2. **Don't use direct MongoDB queries**

```typescript
// BAD: Direct MongoDB operations
import { MongoClient } from "mongodb" ❌

// GOOD: Use query functions
import { getUserByIdFromDB } from "@/database" ✅
```

3. **Don't return raw errors**

```typescript
// BAD: Exposing internal errors
return res.status(500).json({ error: error.stack }) ❌

// GOOD: User-friendly error responses
return res.status(500).json(sendAPIResponse({
    status: false,
    message: "Internal server error"
})) ✅
```

## 🎯 Quality Checklist

Before completing any API endpoint:

- ✅ Applied CORS middleware
- ✅ Connected to database
- ✅ Used proper TypeScript interfaces
- ✅ Implemented authentication checks
- ✅ Added comprehensive error handling
- ✅ Used existing query functions
- ✅ Followed consistent response structure
- ✅ Added proper logging for debugging
- ✅ Tested all HTTP methods
- ✅ Validated request payloads

## 🔄 Development Workflow

### Adding New Endpoints

1. **Define interfaces** in `@/interfaces`
2. **Create query functions** in `@/database/queries`
3. **Implement route handler** following patterns
4. **Add proper error handling** and logging
5. **Test with proper authentication**
6. **Update API documentation**

This backend architecture ensures robust, secure, and maintainable API services across the TBE platform ecosystem.
