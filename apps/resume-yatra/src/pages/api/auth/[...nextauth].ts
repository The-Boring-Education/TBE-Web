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
            // Check if API_URL is available
            if (!API_URL || API_URL === "undefined") {
                console.warn("⚠️ API_URL not available, allowing sign-in without user creation")
                return true
            }

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
            // Check if API_URL is available
            if (!API_URL || API_URL === "undefined") {
                console.warn("⚠️ API_URL not available, using token.sub as fallback")
                session.user.id = token.sub
                return session
            }

            // Fetch user data to get MongoDB user ID and onboarding status
            const response = await fetch(
                `${API_URL}/user?email=${session.user.email}`
            )
            const result = await response.json()

            if (result.status && result.data) {
                // Set the MongoDB user ID from the API response
                session.user.id = result.data._id
                session.user.isOnboarded =
                    result.data.resume?.onboarded || false
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

// Add redirect callback to prevent redirect loops
authOptions.callbacks = {
    ...authOptions.callbacks,
    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
        // Allows relative callback URLs
        if (url.startsWith("/")) return `${baseUrl}${url}`
        // Allows callback URLs on the same origin
        else if (new URL(url).origin === baseUrl) return url
        return baseUrl
    }
}

export default NextAuth(authOptions)
export { authOptions }
