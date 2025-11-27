import type { NextAuthOptions } from "next-auth"

import { createGoogleProvider } from "../providers/google"
import type { AuthConfig } from "../types"
import {
    defaultJwtCallback,
    defaultSessionCallback,
    defaultSignInCallback} from "./callbacks"
import { getAuthSecret,getCookieConfig, sessionConfig } from "./session"

/**
 * Factory function to create NextAuth configuration
 * Provides consistent auth setup across all apps
 *
 * @param config - Custom configuration options
 * @returns NextAuth configuration object
 */
export const createAuthOptions = (config: AuthConfig = {}): NextAuthOptions => {
    const { pages, onSignIn, onSession, useDefaultCallbacks = true } = config

    return {
        providers: [createGoogleProvider()],

        secret: getAuthSecret(),

        session: sessionConfig,

        cookies: getCookieConfig(),

        pages: pages || {
            signIn: "/auth/signin",
            error: "/auth/error"
        },

        callbacks: {
            async signIn({ user, account }) {
                // If custom sign-in logic is provided, use it
                if (onSignIn) {
                    return await onSignIn(user as any, account)
                }

                // Use default callback if enabled
                if (useDefaultCallbacks) {
                    return await defaultSignInCallback(user as any, account)
                }

                // Default: allow sign-in
                return true
            },

            async jwt({ token, user, account }) {
                // Use default JWT callback if enabled
                if (useDefaultCallbacks) {
                    return await defaultJwtCallback({ token, user, account })
                }

                // Fallback: Basic JWT handling
                if (account && user) {
                    return {
                        ...token,
                        accessToken: account.access_token,
                        provider: account.provider
                    }
                }

                return token
            },

            async session({ session, token }) {
                // Attach user ID from token to session
                if (session.user) {
                    session.user.id = token.sub || ""

                    // If custom session logic is provided, use it
                    if (onSession) {
                        return await onSession(session, token)
                    }

                    // Use default callback if enabled
                    if (useDefaultCallbacks) {
                        return await defaultSessionCallback(session, token)
                    }
                }

                return session
            }
        },

        events: {
            async signIn({ user, account }) {
                console.log(
                    `User signed in: ${user.email} via ${account?.provider}`
                )
            },

            async signOut({ session }) {
                console.log(
                    `User signed out: ${session?.user?.email || "unknown"}`
                )
            }
        },

        debug: process.env.NODE_ENV === "development"
    }
}
