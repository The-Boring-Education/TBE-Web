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
            const response = await fetch(
                `${API_URL}/user?email=${session.user.email}`
            )
            const result = await response.json()

            if (result.status && result.data) {
                session.user.id = result.data._id
                session.user.isOnboarded = result.data.isOnboarded || false
            } else {
                session.user.id = token.sub
            }
        } catch (error) {
            console.error("Error fetching user in session:", error)
            session.user.id = token.sub
        }

        return session
    }
})

authOptions.callbacks = {
    ...authOptions.callbacks,
    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
        if (url.startsWith("/")) return `${baseUrl}${url}`
        if (new URL(url).origin === baseUrl) return url
        return baseUrl
    }
}

export default NextAuth(authOptions)
export { authOptions }

