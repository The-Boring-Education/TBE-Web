import { createNextAuthHandler, getAuthOptions } from "@tbe/auth"

/**
 * NextAuth configuration for Resume Yatra app
 * 🚀 Plug-and-play setup with default configuration
 */
const handler = createNextAuthHandler({
    pages: {
        signIn: "/auth",
        error: "/auth"
    }
})

export default handler
export const authOptions = getAuthOptions(handler)
