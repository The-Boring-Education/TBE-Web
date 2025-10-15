import { createAuthOptions } from "@tbe/auth"
import NextAuth from "next-auth"

const authOptions = createAuthOptions({
    pages: {
        signIn: "/auth",
        error: "/auth"
    }
})

export default NextAuth(authOptions)
export { authOptions }
