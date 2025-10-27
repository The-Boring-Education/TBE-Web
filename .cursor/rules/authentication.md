# 🔐 TBE Platform - Authentication Rules

## 📋 Overview

This document defines authentication and authorization patterns using NextAuth.js across all TBE Platform applications.

## 🔑 NextAuth.js Configuration

### Centralized Auth Configuration

```typescript
// packages/auth/src/config.ts
import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { MongoDBAdapter } from "@next-auth/mongodb-adapter"
import { MongoClient } from "mongodb"

const client = new MongoClient(process.env.MONGODB_URI!)
const clientPromise = client.connect()

export const authOptions: NextAuthOptions = {
    adapter: MongoDBAdapter(clientPromise),
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_AUTH_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_AUTH_CLIENT_SECRET!
        })
    ],
    session: {
        strategy: "jwt",
        maxAge: 24 * 60 * 60 // 24 hours
    },
    jwt: {
        maxAge: 24 * 60 * 60 // 24 hours
    },
    callbacks: {
        async jwt({ token, user, account }) {
            if (user) {
                token.id = user.id
                token.role = user.role || "user"
                token.permissions = user.permissions || []
            }
            return token
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id as string
                session.user.role = token.role as string
                session.user.permissions = token.permissions as string[]
            }
            return session
        },
        async signIn({ user, account, profile }) {
            // Custom sign-in logic
            if (account?.provider === "google") {
                // Verify email domain if needed
                const allowedDomains =
                    process.env.ALLOWED_EMAIL_DOMAINS?.split(",") || []
                if (allowedDomains.length > 0) {
                    const emailDomain = user.email?.split("@")[1]
                    if (!allowedDomains.includes(emailDomain!)) {
                        return false
                    }
                }
            }
            return true
        }
    },
    pages: {
        signIn: "/auth/signin",
        signOut: "/auth/signout",
        error: "/auth/error"
    },
    cookies: {
        sessionToken: {
            name: "next-auth.session-token",
            options: {
                domain:
                    process.env.NODE_ENV === "production"
                        ? ".theboringeducation.com"
                        : "localhost",
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax"
            }
        }
    }
}
```

### App-Level Auth Setup

```typescript
// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth"
import { authOptions } from "@tbe/auth"

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
```

## 🛡️ Protected Routes

### Client-Side Protection

```typescript
// components/auth/ProtectedRoute.tsx
"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { LoadingSpinner } from "@tbe/components"

interface ProtectedRouteProps {
    children: React.ReactNode
    requireAuth?: boolean
    requireAdmin?: boolean
    requiredPermissions?: string[]
    redirectTo?: string
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    children,
    requireAuth = true,
    requireAdmin = false,
    requiredPermissions = [],
    redirectTo = "/auth/signin"
}) => {
    const { data: session, status } = useSession()
    const router = useRouter()

    useEffect(() => {
        if (status === "loading") return

        if (requireAuth && !session) {
            router.push(redirectTo)
            return
        }

        if (requireAdmin && session?.user?.role !== "admin") {
            router.push("/unauthorized")
            return
        }

        if (requiredPermissions.length > 0) {
            const hasPermissions = requiredPermissions.every(permission =>
                session?.user?.permissions?.includes(permission)
            )
            if (!hasPermissions) {
                router.push("/unauthorized")
                return
            }
        }
    }, [session, status, requireAuth, requireAdmin, requiredPermissions, redirectTo, router])

    if (status === "loading") {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <LoadingSpinner size="lg" />
            </div>
        )
    }

    if (requireAuth && !session) {
        return null // Will redirect
    }

    if (requireAdmin && session?.user?.role !== "admin") {
        return null // Will redirect
    }

    if (requiredPermissions.length > 0) {
        const hasPermissions = requiredPermissions.every(permission =>
            session?.user?.permissions?.includes(permission)
        )
        if (!hasPermissions) {
            return null // Will redirect
        }
    }

    return <>{children}</>
}
```

### Server-Side Protection

```typescript
// lib/auth/server.ts
import { getServerSession } from "next-auth/next"
import { authOptions } from "@tbe/auth"
import { redirect } from "next/navigation"

export async function requireAuth() {
    const session = await getServerSession(authOptions)

    if (!session) {
        redirect("/auth/signin")
    }

    return session
}

export async function requireAdmin() {
    const session = await requireAuth()

    if (session.user.role !== "admin") {
        redirect("/unauthorized")
    }

    return session
}

export async function requirePermissions(permissions: string[]) {
    const session = await requireAuth()

    const hasPermissions = permissions.every(permission =>
        session.user.permissions?.includes(permission)
    )

    if (!hasPermissions) {
        redirect("/unauthorized")
    }

    return session
}

// Usage in page components
export default async function AdminPage() {
    await requireAdmin()

    return (
        <div>
            <h1>Admin Dashboard</h1>
            {/* Admin content */}
        </div>
    )
}
```

## 🎣 Authentication Hooks

### Core Auth Hook

```typescript
// hooks/useAuth.ts
import { useSession, signIn, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import type { User } from "@tbe/types"

interface UseAuthReturn {
    user: User | null
    isLoading: boolean
    isAuthenticated: boolean
    login: (provider?: string) => void
    logout: () => void
    hasPermission: (permission: string) => boolean
    isAdmin: () => boolean
}

export const useAuth = (): UseAuthReturn => {
    const { data: session, status } = useSession()
    const router = useRouter()

    const login = (provider = "google") => {
        signIn(provider, { callbackUrl: "/dashboard" })
    }

    const logout = () => {
        signOut({ callbackUrl: "/" })
    }

    const hasPermission = (permission: string) => {
        return session?.user?.permissions?.includes(permission) ?? false
    }

    const isAdmin = () => {
        return session?.user?.role === "admin"
    }

    return {
        user: session?.user || null,
        isLoading: status === "loading",
        isAuthenticated: !!session,
        login,
        logout,
        hasPermission,
        isAdmin
    }
}
```

### Permission Hook

```typescript
// hooks/usePermissions.ts
import { useSession } from "next-auth/react"

export const usePermissions = () => {
    const { data: session } = useSession()

    const hasPermission = (permission: string) => {
        return session?.user?.permissions?.includes(permission) ?? false
    }

    const hasAnyPermission = (permissions: string[]) => {
        return permissions.some((permission) => hasPermission(permission))
    }

    const hasAllPermissions = (permissions: string[]) => {
        return permissions.every((permission) => hasPermission(permission))
    }

    const isAdmin = () => {
        return session?.user?.role === "admin"
    }

    const canAccess = (resource: string, action: string) => {
        const permission = `${resource}:${action}`
        return hasPermission(permission) || isAdmin()
    }

    return {
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        isAdmin,
        canAccess,
        permissions: session?.user?.permissions || [],
        role: session?.user?.role || "user"
    }
}
```

## 🌐 API Route Protection

### Middleware Pattern

```typescript
// middleware/withAuth.ts
import { getServerSession } from "next-auth/next"
import { authOptions } from "@tbe/auth"
import { sendAPIResponse } from "@/utils"
import type { NextApiRequest, NextApiResponse } from "next"

interface AuthOptions {
    requireAuth?: boolean
    requireAdmin?: boolean
    requiredPermissions?: string[]
}

export const withAuth = (
    handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>,
    options: AuthOptions = {}
) => {
    return async (req: NextApiRequest, res: NextApiResponse) => {
        const {
            requireAuth = true,
            requireAdmin = false,
            requiredPermissions = []
        } = options

        if (!requireAuth) {
            return handler(req, res)
        }

        const session = await getServerSession(req, res, authOptions)

        if (!session) {
            return res.status(401).json(
                sendAPIResponse({
                    status: false,
                    message: "Unauthorized - Please login"
                })
            )
        }

        if (requireAdmin && session.user.role !== "admin") {
            return res.status(403).json(
                sendAPIResponse({
                    status: false,
                    message: "Forbidden - Admin access required"
                })
            )
        }

        if (requiredPermissions.length > 0) {
            const hasPermissions = requiredPermissions.every((permission) =>
                session.user.permissions?.includes(permission)
            )

            if (!hasPermissions) {
                return res.status(403).json(
                    sendAPIResponse({
                        status: false,
                        message: "Forbidden - Insufficient permissions"
                    })
                )
            }
        }

        // Add user to request for handler access
        req.user = session.user
        return handler(req, res)
    }
}

// Usage in API routes
export default withAuth(
    async (req: NextApiRequest, res: NextApiResponse) => {
        // Handler logic with authenticated user
        const userId = req.user.id
        // ... rest of handler
    },
    { requireAuth: true, requiredPermissions: ["quiz:read"] }
)
```

### Direct Auth Check

```typescript
// pages/api/protected-route.ts
import type { NextApiRequest, NextApiResponse } from "next"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@tbe/auth"
import { sendAPIResponse } from "@/utils"

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const session = await getServerSession(req, res, authOptions)

    if (!session) {
        return res.status(401).json(
            sendAPIResponse({
                status: false,
                message: "Unauthorized"
            })
        )
    }

    // Authenticated logic here
    return res.status(200).json(
        sendAPIResponse({
            status: true,
            data: { message: "Protected data", userId: session.user.id }
        })
    )
}
```

## 🎨 Auth UI Components

### Sign In Component

```typescript
// components/auth/SignInForm.tsx
"use client"

import { signIn, getSession } from "next-auth/react"
import { useState } from "react"
import { Button, Card } from "@tbe/components"
import { GoogleIcon } from "@tbe/components/icons"

export const SignInForm: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false)

    const handleGoogleSignIn = async () => {
        setIsLoading(true)
        try {
            await signIn("google", { callbackUrl: "/dashboard" })
        } catch (error) {
            console.error("Sign in error:", error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card className="w-full max-w-md mx-auto">
            <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Welcome to TBE</h1>
                <p className="text-gray-600 mt-2">Sign in to continue your learning journey</p>
            </div>

            <Button
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                loading={isLoading}
                className="w-full"
                variant="outline"
            >
                <GoogleIcon className="mr-2 h-4 w-4" />
                Continue with Google
            </Button>
        </Card>
    )
}
```

### User Menu Component

```typescript
// components/auth/UserMenu.tsx
"use client"

import { useAuth } from "@tbe/hooks"
import { Button, Avatar, DropdownMenu } from "@tbe/components"

export const UserMenu: React.FC = () => {
    const { user, logout, isAuthenticated } = useAuth()

    if (!isAuthenticated) {
        return (
            <Button onClick={() => signIn("google")}>
                Sign In
            </Button>
        )
    }

    return (
        <DropdownMenu>
            <DropdownMenu.Trigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                        <Avatar.Image src={user?.image} alt={user?.name} />
                        <Avatar.Fallback>{user?.name?.[0]}</Avatar.Fallback>
                    </Avatar>
                </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content className="w-56" align="end" forceMount>
                <DropdownMenu.Label className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user?.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                            {user?.email}
                        </p>
                    </div>
                </DropdownMenu.Label>
                <DropdownMenu.Separator />
                <DropdownMenu.Item onClick={() => router.push("/profile")}>
                    Profile
                </DropdownMenu.Item>
                <DropdownMenu.Item onClick={() => router.push("/settings")}>
                    Settings
                </DropdownMenu.Item>
                <DropdownMenu.Separator />
                <DropdownMenu.Item onClick={logout}>
                    Log out
                </DropdownMenu.Item>
            </DropdownMenu.Content>
        </DropdownMenu>
    )
}
```

## 🚫 Authentication Anti-Patterns

### ❌ What NOT to Do

1. **Don't store sensitive data in client-side storage**

```typescript
// BAD: Storing tokens in localStorage
localStorage.setItem("authToken", token) ❌

// GOOD: Use NextAuth.js session management
const { data: session } = useSession() ✅
```

2. **Don't bypass authentication checks**

```typescript
// BAD: Trusting client-side auth state
if (user.role === "admin") { /* admin logic */ } ❌

// GOOD: Server-side verification
const session = await getServerSession(req, res, authOptions)
if (session?.user?.role === "admin") { /* admin logic */ } ✅
```

3. **Don't create custom auth flows**

```typescript
// BAD: Custom authentication
const login = async (email, password) => { /* custom logic */ } ❌

// GOOD: Use NextAuth.js providers
signIn("google", { callbackUrl: "/dashboard" }) ✅
```

## 🔄 Session Management

### Session Refresh

```typescript
// hooks/useSessionRefresh.ts
import { useSession } from "next-auth/react"
import { useEffect } from "react"

export const useSessionRefresh = () => {
    const { data: session, update } = useSession()

    useEffect(() => {
        const interval = setInterval(
            async () => {
                if (session) {
                    await update() // Refresh session
                }
            },
            5 * 60 * 1000
        ) // Every 5 minutes

        return () => clearInterval(interval)
    }, [session, update])
}
```

### Cross-App Session Sharing

```typescript
// Ensure session cookies work across subdomains
// Set in authOptions.cookies configuration
cookies: {
    sessionToken: {
        name: "next-auth.session-token",
        options: {
            domain: ".theboringeducation.com", // Shared across subdomains
            httpOnly: true,
            secure: true,
            sameSite: "lax"
        }
    }
}
```

This authentication system ensures secure, consistent user management across all TBE Platform applications.
