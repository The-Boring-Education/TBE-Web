import {
    useSession,
    signIn as nextAuthSignIn,
    signOut as nextAuthSignOut
} from "next-auth/react"
import type { ExtendedUser } from "../types"

/**
 * Unified authentication hook
 * Provides consistent auth interface across all apps
 */
export const useAuth = () => {
    const { data: session, status } = useSession()

    return {
        user: session?.user as ExtendedUser | null,
        session,
        isAuthenticated: status === "authenticated",
        isLoading: status === "loading",
        isUnauthenticated: status === "unauthenticated",

        signIn: (callbackUrl?: string) => {
            return nextAuthSignIn("google", {
                callbackUrl: callbackUrl || "/dashboard"
            })
        },

        signOut: (callbackUrl?: string) => {
            return nextAuthSignOut({ callbackUrl: callbackUrl || "/" })
        }
    }
}
