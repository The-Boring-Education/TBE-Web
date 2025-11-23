import type { ExtendedUser } from "../types"
import { createOrFindUser, getUserByEmail } from "../services"

/**
 * Default signIn callback
 * Creates or finds user in the database and attaches MongoDB _id to the user object
 *
 * @param user - NextAuth user object
 * @param account - NextAuth account object
 * @returns Whether sign in should proceed
 */
export const defaultSignInCallback = async (
    user: ExtendedUser,
    account?: any
): Promise<boolean> => {
    if (!user) return false

    const { name, email } = user

    if (!email || !name) return false

    try {
        // Create or find user in MongoDB
        const userData = await createOrFindUser({
            name,
            email,
            image: user.image,
            provider: account?.provider || "google",
            providerAccountId: account?.providerAccountId || user.id
        })

        // Attach MongoDB _id to the user object
        user.id = userData._id.toString()

        return true
    } catch (error) {
        console.error("Error in defaultSignInCallback:", error)
        return false
    }
}

/**
 * Default session callback
 * Fetches user data from database and enriches the session
 *
 * @param session - NextAuth session object
 * @param token - JWT token object
 * @returns Enriched session object
 */
export const defaultSessionCallback = async (
    session: any,
    token: any
): Promise<any> => {
    try {
        // Always attach the token sub (user ID) as fallback
        session.user.id = token.sub

        // Fetch fresh user data from the database
        const userData = await getUserByEmail(session.user.email)

        if (userData) {
            session.user.id = userData._id
            session.user.isOnboarded = userData.isOnboarded || false
            session.user.userName = userData.userName
            session.user.occupation = userData.occupation
            session.user.purpose = userData.purpose
            session.user.contactNo = userData.contactNo
        }


        return session
    } catch (error) {
        console.error("Error in defaultSessionCallback:", error)
        // Return session with basic info on error
        session.user.id = token.sub
        return session
    }
}

/**
 * Default JWT callback
 * Handles JWT token creation and updates
 *
 * @param token - JWT token object
 * @param user - User object (available on sign in)
 * @param account - Account object (available on sign in)
 * @returns Updated JWT token
 */
export const defaultJwtCallback = async (params: {
    token: any
    user?: any
    account?: any
}): Promise<any> => {
    const { token, user, account } = params

    // On initial sign in, attach user data to token
    if (user) {
        token.sub = user.id
        token.email = user.email
        token.name = user.name
        token.picture = user.image
    }

    // Attach provider info on initial sign in
    if (account) {
        token.provider = account.provider
        token.providerAccountId = account.providerAccountId
    }

    return token
}
