import NextAuth from "next-auth"
import { createAuthOptions } from "@tbe/auth"

const authOptions = createAuthOptions({
    pages: {
        signIn: "/login",
        error: "/login"
    }
})

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
export { authOptions }
