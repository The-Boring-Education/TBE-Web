import { createAuthOptions, getUserByEmail } from "@tbe/auth"
import NextAuth from "next-auth"

/**
 * NextAuth configuration for Prep Yatra app
 * Uses centralized auth with custom session callback for Prep Yatra specific onboarding
 */
const authOptions = createAuthOptions({
    pages: {
        signIn: "/auth",
        error: "/auth"
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
                // Prep Yatra specific onboarding check
                session.user.isOnboarded =
                    userData.prepYatra?.pyOnboarded || false
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

export default NextAuth(authOptions)
export { authOptions }
