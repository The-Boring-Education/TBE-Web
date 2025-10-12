import NextAuth from "next-auth"
import { createAuthOptions } from "@tbe/auth"

const authOptions = createAuthOptions({
    pages: {
        signIn: "/auth",
        error: "/auth"
    }
})

export default NextAuth(authOptions)
export { authOptions }
