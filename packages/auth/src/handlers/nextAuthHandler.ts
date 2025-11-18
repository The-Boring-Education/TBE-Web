import NextAuth from "next-auth"
import type { NextAuthOptions } from "next-auth"
import { createAuthOptions } from "../config/nextauth"
import { getUserByEmail } from "../services"
import type { AppAuthConfig } from "../types"

/**
 * Helper function to get nested property value from object using dot notation
 * Example: getNestedValue(user, "prepYatra.pyOnboarded")
 */
const getNestedValue = (obj: any, path: string): any => {
    return path.split(".").reduce((current, key) => current?.[key], obj)
}

/**
 * Creates a plug-and-play NextAuth handler with minimal configuration
 *
 * @param config - Optional app-specific configuration
 * @returns NextAuth handler and authOptions
 *
 * @example
 * // Simple usage (default setup)
 * export default createNextAuthHandler()
 *
 * @example
 * // With custom pages
 * export default createNextAuthHandler({
 *   pages: { signIn: "/login", error: "/login" }
 * })
 *
 * @example
 * // With app-specific onboarding field
 * export default createNextAuthHandler({
 *   onboardingField: "prepYatra.pyOnboarded"
 * })
 *
 * @example
 * // With redirect logic enabled
 * export default createNextAuthHandler({
 *   pages: { signIn: "/login" },
 *   enableRedirectLogic: true
 * })
 */
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

                    // Call custom session callback if provided
                    if (customSessionCallback) {
                        return await customSessionCallback(
                            session,
                            token,
                            userData
                        )
                    }
                }

                return session
            } catch (error) {
                console.error("Error in session callback:", error)
                // Return session with basic info on error
                session.user.id = token.sub
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

/**
 * Helper function to extract authOptions from handler
 * @param handler - NextAuth handler created by createNextAuthHandler
 * @returns authOptions
 */
export const getAuthOptions = (handler: any): NextAuthOptions => {
    return handler.authOptions
}

