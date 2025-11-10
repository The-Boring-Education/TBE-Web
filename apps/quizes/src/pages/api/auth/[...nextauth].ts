import { createAuthOptions, getUserByEmail } from "@tbe/auth"
import NextAuth from "next-auth"

/**
 * NextAuth configuration for Quizes app
 * Uses centralized auth with custom session callback for Quiz specific onboarding
 */
const authOptions = createAuthOptions({
    pages: {
        signIn: "/login",
        error: "/login"
    },
    useDefaultCallbacks: true, // Use centralized auth logic for signIn
    onSession: async (session, token) => {
        try {
            // Always attach the token sub (user ID) as fallback
            session.user.id = token.sub

            // Fetch fresh user data from the database
            const userData = await getUserByEmail(session.user.email)

            if (userData) {
                session.user.id = userData._id
                // Quiz specific onboarding check
                session.user.isOnboarded = userData.quiz?.onboarded || false
                session.user.userName = userData.userName
                session.user.occupation = userData.occupation
                session.user.purpose = userData.purpose
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

// Add redirect callback to prevent redirect loops
if (authOptions.callbacks) {
    authOptions.callbacks.redirect = async ({ url, baseUrl }) => {
        // Allows relative callback URLs
        if (url.startsWith("/")) return `${baseUrl}${url}`
        // Allows callback URLs on the same origin
        if (new URL(url).origin === baseUrl) return url
        return baseUrl
    }
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
