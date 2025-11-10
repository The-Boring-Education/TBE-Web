import { createAuthOptions } from "@tbe/auth"
import NextAuth from "next-auth"

/**
 * NextAuth configuration for DSA Yatra app
 * Uses centralized auth with default callbacks
 */
const authOptions = createAuthOptions({
    pages: {
        signIn: "/auth",
        error: "/auth"
    },
    useDefaultCallbacks: true // Use centralized auth logic
})

export default NextAuth(authOptions)
export { authOptions }
