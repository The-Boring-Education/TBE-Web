/**
 * Session configuration for NextAuth
 * Provides consistent session settings across all apps
 */

export const sessionConfig = {
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60 // 24 hours
}

/**
 * Cookie configuration for SSO across subdomains
 * Set COOKIE_DOMAIN environment variable to enable SSO
 * Example: .theboringeducation.com
 */
export const getCookieConfig = () => {
    const cookieDomain = process.env.COOKIE_DOMAIN
    const isProduction = process.env.NODE_ENV === "production"

    return {
        sessionToken: {
            name: isProduction
                ? "__Secure-next-auth.session-token"
                : "next-auth.session-token",
            options: {
                httpOnly: true,
                sameSite: "lax" as const,
                path: "/",
                secure: isProduction,
                domain: cookieDomain || undefined
            }
        }
    }
}

/**
 * Get NextAuth URL for the current app
 */
export const getAuthUrl = () => {
    return (
        process.env.NEXTAUTH_URL ||
        process.env.NEXT_PUBLIC_APP_URL ||
        "http://localhost:3000"
    )
}

/**
 * Get NextAuth secret
 */
export const getAuthSecret = () => {
    const secret = process.env.NEXTAUTH_SECRET
    if (!secret) {
        throw new Error("NEXTAUTH_SECRET environment variable is required")
    }
    return secret
}
