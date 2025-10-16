import { createAuthOptions } from "@tbe/auth"
import NextAuth from "next-auth"

const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL

const authOptions = createAuthOptions({
    pages: {
        signIn: "/auth",
        error: "/auth"
    },
    onSignIn: async (user, account) => {
        if (!user) return false

        const { name, email } = user

        if (!email || !name) return false

        try {
            // Find or create the user via API
            const response = await fetch(`${API_URL}/user`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name,
                    email,
                    image: user.image,
                    provider: account?.provider || "google",
                    providerAccountId: account?.providerAccountId || user.id
                })
            })

            const result = await response.json()

            if (result.status && result.data) {
                // Attach the MongoDB _id to the user object
                user.id = result.data._id.toString()
                return true
            }

            return false
        } catch (error) {
            console.error("Error signing in:", error)
            return false
        }
    },
    onSession: async (session, token) => {
        try {
            // Fetch user data to get MongoDB user ID and onboarding status
            const response = await fetch(
                `${API_URL}/user?email=${session.user.email}`
            )
            const result = await response.json()

            if (result.status && result.data) {
                // Set the MongoDB user ID from the API response
                session.user.id = result.data._id
                session.user.isOnboarded =
                    result.data.prepYatra?.pyOnboarded || false
            } else {
                // Fallback to token.sub if user not found in API
                session.user.id = token.sub
            }
        } catch (error) {
            console.error("Error fetching user in session:", error)
            // Fallback to token.sub on error
            session.user.id = token.sub
        }

        return session
    }
})

export default NextAuth(authOptions)
export { authOptions }
