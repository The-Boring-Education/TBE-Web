/**
 * Google OAuth provider configuration
 * Requires GOOGLE_AUTH_CLIENT_ID and GOOGLE_AUTH_CLIENT_SECRET environment variables
 */
export const createGoogleProvider = () => {
    const clientId = process.env.GOOGLE_AUTH_CLIENT_ID
    const clientSecret = process.env.GOOGLE_AUTH_CLIENT_SECRET

    if (!clientId || !clientSecret) {
        throw new Error(
            "GOOGLE_AUTH_CLIENT_ID and GOOGLE_AUTH_CLIENT_SECRET environment variables are required"
        )
    }

    // Dynamic import for NextAuth providers
    const GoogleProvider = require("next-auth/providers/google").default

    return GoogleProvider({
        clientId,
        clientSecret,
        authorization: {
            params: {
                scope: "openid email profile"
            }
        }
    })
}
