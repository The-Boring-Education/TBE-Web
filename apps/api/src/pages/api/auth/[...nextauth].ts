import type { NextAuthOptions } from "next-auth"
import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"

import { routes } from "@/lib/constants"
import { createUserInDB, getUserByEmailFromDB } from "@/lib/database"
import { connectDB } from "@/middleware/api"

/**
 * NextAuth configuration for API app
 * Uses direct MongoDB access (not centralized callbacks)
 *
 * NOTE: This app IS the API service, so it directly accesses MongoDB
 * instead of calling external APIs.
 */
const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_AUTH_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_AUTH_CLIENT_SECRET || "",
            authorization: {
                params: {
                    scope: "openid email profile"
                }
            }
        })
    ],

    secret: process.env.NEXTAUTH_SECRET,

    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
        updateAge: 24 * 60 * 60 // 24 hours
    },

    cookies: {
        sessionToken: {
            name:
                process.env.NODE_ENV === "production"
                    ? "__Secure-next-auth.session-token"
                    : "next-auth.session-token",
            options: {
                httpOnly: true,
                sameSite: "lax",
                path: "/",
                secure: process.env.NODE_ENV === "production",
                domain: process.env.COOKIE_DOMAIN || undefined
            }
        }
    },

    pages: {
        signIn: routes?.register
    },

    callbacks: {
        async signIn({ user, account }) {
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
                        image: user.image || undefined,
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

        async jwt({ token, user, account }) {
            // On initial sign in, attach user data to token
            if (user) {
                token.sub = user.id
                token.email = user.email
                token.name = user.name
                token.picture = user.image || undefined
            }

            // Attach provider info on initial sign in
            if (account) {
                token.provider = account.provider
                token.providerAccountId = account.providerAccountId
            }

            return token
        },

        async session({ session, token }) {
            // Attach the MongoDB user ID to the session object
            session.user.id = token.sub || ""

            try {
                const { data: existingUser } = await getUserByEmailFromDB(
                    session.user.email
                )
                if (existingUser) {
                    session.user.isOnboarded = existingUser.isOnboarded
                }
            } catch (error) {
                console.error("Error fetching user in session:", error)
            }

            return session
        }
    },

    events: {
        async signIn({ user, account }) {
            console.log(
                `User signed in: ${user.email} via ${account?.provider}`
            )
        },

        async signOut({ session }) {
            console.log(`User signed out: ${session?.user?.email || "unknown"}`)
        }
    },

    debug: process.env.NODE_ENV === "development"
}

export default NextAuth(authOptions)
export { authOptions }
