"use client"

import { SessionProvider } from "next-auth/react"
import type { ReactNode } from "react"

interface AuthProviderProps {
    children: ReactNode
    session?: any
}

/**
 * Auth provider component
 * Wraps SessionProvider with consistent configuration
 * 
 * Note: NextAuth.js requires auth routes to be on the same domain as the app
 * for cookie security. The session endpoint will always be local (e.g., /api/auth/session)
 * but it fetches user data from the centralized API.
 */
export const AuthProvider = ({ children, session }: AuthProviderProps) => {
    return (
        <SessionProvider
            session={session}
            refetchInterval={5 * 60} // Refetch session every 5 minutes
            refetchOnWindowFocus>
            {children}
        </SessionProvider>
    )
}
