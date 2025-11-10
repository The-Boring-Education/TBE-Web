import { createAuthOptions } from "@tbe/auth"
import NextAuth from "next-auth"

import { routes } from "@/lib/constants"
import { createUserInDB, getUserByEmailFromDB } from "@/lib/database"
import { connectDB } from "@/middleware/api"

/**
 * NextAuth configuration for API app
 * Uses custom callbacks to interact directly with MongoDB
 * (Since this IS the API service, it doesn't call itself)
 */
const authOptions = createAuthOptions({
    pages: {
        signIn: routes?.register
    },
    useDefaultCallbacks: false, // Use custom callbacks for direct DB access
    onSignIn: async (user, account) => {
        if (!user) return false

        const { name, email } = user

        if (!email || !name) return false

        try {
            await connectDB()

            // Find or create the user in MongoDB
            const { data: existingUser } = await getUserByEmailFromDB(email)

            if (!existingUser) {
                // Create a new user in MongoDB if not found
                const { data: result } = await createUserInDB({
                    name,
                    email,
                    image: user.image,
                    provider: account?.provider || "google",
                    providerAccountId: account?.providerAccountId || user.id
                })

                // Attach the MongoDB _id to the user object
                user.id = result._id.toString()
            } else {
                // If the user exists, attach the MongoDB _id to the user object
                user.id = existingUser._id.toString()
            }

            return true // Allow the sign in
        } catch (error) {
            console.error("Error signing in:", error)
            return false
        }
    },
    onSession: async (session, token) => {
        // Attach the MongoDB user ID to the session object
        session.user.id = token.sub

        const { data: existingUser } = await getUserByEmailFromDB(
            session.user.email
        )
        if (existingUser) {
            session.user.isOnboarded = existingUser.isOnboarded
        }

        return session
    }
})

export default NextAuth(authOptions)
export { authOptions }
