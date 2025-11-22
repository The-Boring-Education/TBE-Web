import NextAuth from "next-auth"
import type { NextAuthOptions } from "next-auth"
import { createAuthOptions } from "../config/nextauth"
import { getUserByEmail } from "../services"
import type { AppAuthConfig } from "../types"


const getNestedValue = (obj: any, path: string): any => {
    return path.split(".").reduce((current, key) => current?.[key], obj)
}

export const createNextAuthHandler = (config: AppAuthConfig = {}) => {
    const {
        pages = { signIn: "/auth", error: "/auth" },
        onboardingField = "isOnboarded",
        enableRedirectLogic = false,
        customSessionCallback
    } = config

    // Create auth options with custom session callback
    const authOptions = createAuthOptions({
        pages,
        useDefaultCallbacks: true,
        onSession: async (session, token) => {
            try {
                // Always attach the token sub (user ID) as fallback
                session.user.id = token.sub

                // Preserve user image from token (comes from OAuth provider)
                if (token.picture) {
                    session.user.image = token.picture
                }

                // Validate session and email before fetching user data
                if (!session?.user?.email) {
                    console.error("Session or user email is missing in session callback")
                    // Return session with basic info from token
                    return session
                }

                // Fetch fresh user data from the database
                const userData = await getUserByEmail(session.user.email)

                if (userData) {
                    session.user.id = userData._id

                    // Get app-specific onboarding status using the provided field path
                    session.user.isOnboarded =
                        getNestedValue(userData, onboardingField) || false

                    // Attach common user fields
                    session.user.userName = userData.userName
                    session.user.occupation = userData.occupation
                    session.user.purpose = userData.purpose
                    session.user.contactNo = userData.contactNo
                    // Use database image if available, otherwise keep token image
                    if (userData.image) {
                        session.user.image = userData.image
                    }

                    // Call custom session callback if provided
                    // The callback can modify or extend the session, and any returned
                    // properties will be merged with the existing session
                    if (customSessionCallback) {
                        const customResult = await customSessionCallback(
                            session,
                            token,
                            userData
                        )
                        
                        // Merge custom callback result with existing session
                        if (customResult && typeof customResult === "object") {
                            return {
                                ...session,
                                ...customResult,
                                user: {
                                    ...session.user,
                                    ...customResult.user
                                }
                            }
                        }
                    }
                }

                return session
            } catch (error) {
                console.error("Error in session callback:", error)
                // Return session with basic info on error
                session.user.id = token.sub
                // Preserve image from token even on error
                if (token.picture) {
                    session.user.image = token.picture
                }
                return session
            }
        }
    })

    // Add redirect logic if enabled
    if (enableRedirectLogic && authOptions.callbacks) {
        authOptions.callbacks.redirect = async ({ url, baseUrl }) => {
            // Allows relative callback URLs
            if (url.startsWith("/")) return `${baseUrl}${url}`
            // Allows callback URLs on the same origin
            if (new URL(url).origin === baseUrl) return url
            return baseUrl
        }
    }

    // Create and return NextAuth handler
    const handler = NextAuth(authOptions)

    // Attach authOptions to handler for export
    ;(handler as any).authOptions = authOptions

    return handler
}

export const getAuthOptions = (handler: any): NextAuthOptions => {
    return handler.authOptions
}

