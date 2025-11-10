import { createAuthOptions } from "@tbe/auth"
import NextAuth from "next-auth"

const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL

const authOptions = createAuthOptions({
    pages: {
        signIn: "/login",
        error: "/login"
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
                session.user.isOnboarded = result.data.quiz?.onboarded || false
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

// Note: NextAuth will use NEXT_PUBLIC_AUTH_URL environment variable automatically
// Make sure NEXT_PUBLIC_AUTH_URL=http://localhost:3002 is set in your .env.local

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

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
